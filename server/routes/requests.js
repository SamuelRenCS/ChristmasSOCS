const express = require("express");
const router = express.Router();
const Request = require("../models/request");
const User = require("../models/user");
const Notification = require("../models/notification");
const mongoose = require("mongoose");

// POST /api/requests/new to handle new request creation
router.post("/new", async (req, res) => {
  const {
    requester,
    host,
    title,
    location,
    startDate,
    endDate,
    numberOfSeats,
    description,
  } = req.body;

  if (!requester || !host || !title || !location || !startDate || !endDate) {
    return res.status(400).json({
      message:
        "Requester, host, title, location, start date, and end date are required",
    });
  }

  try {
    // check if valid requester
    const requesterUser = await User.findById(requester);
    if (!requesterUser) {
      return res.status(404).json({ message: "Requester not found" });
    }

    // check if valid host
    const hostUser = await User.findById(host);
    if (!hostUser) {
      return res.status(404).json({ message: "Host not found" });
    }

    // create new request
    const newRequest = new Request({
      requester,
      host,
      requesterName: `${requesterUser.firstName} ${requesterUser.lastName}`,
      title,
      location,
      startDate,
      endDate,
      numberOfSeats,
      description,
    });

    await newRequest.save();

    // create notification for host
    const notification = new Notification({
      user: host,
      title: "New Request",
      message: `You have a new request from ${requesterUser.firstName} ${requesterUser.lastName}.`,
      date: Date.now(),
    });

    await notification.save();

    // add notification to user's notifications array
    await User.findByIdAndUpdate(host, {
      $push: { Notifications: notification._id },
    });

    res.status(201).json({ message: "Request created successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }
    res
      .status(500)
      .json({ message: "Request creation failed", error: error.message });
  }
});

// GET /api/requests/:userID to fetch all requests for a user
router.get("/:userID", async (req, res) => {
  const { userID } = req.params;

  try {
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // find Confirmed requests, where requester or host is the user
    const confirmedRequests = await Request.find({
      $or: [{ requester: userID }, { host: userID }],
      approved: true,
    });

    // find requests that have not been accepted as the host
    const incomingRequests = await Request.find({
      host: userID,
      approved: false,
    });

    // find requests that have not been accepted as the requester
    const outgoingRequests = await Request.find({
      requester: userID,
      approved: false,
    });

    res.status(200).json({
      data: { confirmedRequests, incomingRequests, outgoingRequests },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Request fetch failed", error: error.message });
  }
});

// PUT /api/requests/:requestID to handle request acceptance
router.put("/:requestID", async (req, res) => {
  const { requestID } = req.params;

  try {
    if (!requestID) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    const request = await Request.findById(requestID);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.approved = true;
    await request.save();

    // create notification for requester
    const notification = new Notification({
      user: request.requester,
      title: "Request Accepted",
      message: `Your request "${request.title}" has been accepted.`,
      date: Date.now(),
    });

    await notification.save();

    // add notification user's notifications array
    await User.findByIdAndUpdate(request.requester, {
      $push: { Notifications: notification._id },
    });

    res.status(200).json({ message: "Request accepted successfully", request });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Request acceptance failed", error: error.message });
  }
});

// DELETE /api/requests/:requestID to handle request rejection
router.delete("/:requestID", async (req, res) => {
  const { requestID } = req.params;

  // console.log("Request ID:", requestID);

  try {
    // Validate if `requestID` is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestID)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    // Find and delete the request
    const deletedRequest = await Request.findByIdAndDelete(requestID);

    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    const notification = new Notification({
      user: deletedRequest.requester,
      title: "Request Cancelled/Rejected",
      message: `Your request "${deletedRequest.title}" has been cancelled/rejected.`,
      date: Date.now(),
    });

    await notification.save();

    // add notification to user's notifications array
    await User.findByIdAndUpdate(deletedRequest.requester, {
      $push: { Notifications: notification._id },
    });

    // delete the request
    await Request.findByIdAndDelete(requestID);

    res
      .status(200)
      .json({ message: "Request rejected successfully", deletedRequest });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Request rejection failed", error: error.message });
  }
});

module.exports = router;
