const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Meeting = require("../models/meeting");
const MeetingSlot = require("../models/meetingSlot");
const Notification = require("../models/notification");
const jwt = require("jsonwebtoken");
const config = require("../config");
const {
  generateSlots,
  calculateDates,
  calculateWeeklyDates,
} = require("../utils");

// POST /api/meetings/new to handle new meeting creation
router.post("/new", async (req, res) => {
  const {
    title,
    host,
    startDate,
    endDate,
    location,
    description,
    interval,
    seatsPerSlot,
    repeat,
    endRepeatDate,
    repeatDays,
  } = req.body;

  // server-side validation
  if (
    !title ||
    !host ||
    !startDate ||
    !endDate ||
    !location ||
    !interval ||
    !seatsPerSlot ||
    !repeat
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // If repeat is selected, check for an endDate
  if (repeat !== "None" && !endDate) {
    return res
      .status(400)
      .json({ message: "End date is required for repeating meetings" });
  }

  try {
    // Create new meeting

    const allSlots = generateSlots(startDate, endDate, interval);
    // console.log("All slots:", allSlots);

    const newMeeting = new Meeting({
      title,
      host,
      startDate,
      endDate,
      location,
      description,
      interval,
      seatsPerSlot,
      repeat,
      endRepeatDate,
      repeatingDays: repeatDays,
      validSlots: allSlots,
    });

    await newMeeting.save();

    //save the meeting under the host
    const hostUser = await User.findById(host);
    // console.log("Host user:", hostUser);

    if (hostUser) {
      // Push the meeting ID to the meetings array
      // Initialize meetings array if it doesn't exist
      if (!hostUser.meetings) {
        hostUser.meetings = [];
      }
      hostUser.meetings.push(newMeeting._id);
      // Save the user
      await hostUser.save();
    }

    const payload = { ID: newMeeting._id };

    const newToken = jwt.sign(payload, config.secretKey, {
      algorithm: "HS256",
    });

    res.status(201).json({
      message: "Meeting created successfully",
      msgToken: newToken,
    });
  } catch (error) {
    console.error("Meeting creation error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }

    res
      .status(500)
      .json({ message: "Meeting creation failed", error: error.message });
  }
});

// GET /api/meetings/token/:meetingID to generate a token for a meeting
router.get("/token/:meetingID", async (req, res) => {
  const { meetingID } = req.params;

  try {
    if (!meetingID) {
      return res.status(400).json({ message: "Meeting ID is required" });
    }

    const payload = { ID: meetingID };
    const token = jwt.sign(payload, config.secretKey, { algorithm: "HS256" });

    // console.log("Token:", token);

    res.status(200).json({ data: { token } });
  } catch (error) {
    console.error("Token generation error:", error);
    res
      .status(500)
      .json({ message: "Token generation failed", error: error.message });
  }
});

// GET /api/meetings/:token to fetch a meeting by token
router.get("/:token", async (req, res) => {
  const iToken = req.params.token;
  let meetingID = req.params.token;
  // Extract the meeting ID from the token and validate the token that is stored in the meeting object
  try {
    if (!iToken) {
      return res.status(400).json({ message: "Token is required" });
    }

    let meeting;

    try {
      // check if the token is a meeting ID
      meeting = await Meeting.findById(iToken);
    } catch (error) {
      // if the token is not a meeting ID, try decoding it
      const decoded = jwt.verify(iToken, config.secretKey);
      meetingID = decoded.ID;

      if (!meetingID) {
        return res.status(400).json({ message: "Invalid token" });
      }

      meeting = await Meeting.findById(meetingID).populate(
        "host",
        "firstName lastName"
      );

      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
    }

    const {
      title,
      host,
      startDate,
      endDate,
      location,
      description,
      interval,
      seatsPerSlot,
      repeat,
      endRepeatDate,
      repeatingDays,
    } = meeting;

    let dates = [];
    let formattedDates = [];

    if (repeat === "None") {
      if (
        interval !== 10 &&
        interval !== 15 &&
        interval !== 20 &&
        interval !== 30 &&
        interval !== 60
      ) {
        dates = calculateDates(startDate, startDate);
      } else {
        dates = calculateDates(startDate, endRepeatDate);
      }

      formattedDates = dates.map((date) => date.toISOString().split("T")[0]);
      return res.status(200).json({
        data: {
          title,
          host,
          startDate,
          endDate,
          location,
          description,
          interval,
          seatsPerSlot,
          repeat,
          endRepeatDate,
          formattedDates,
          meetingID,
        },
      });
    } else if (repeat === "Daily") {
      dates = calculateDates(startDate, endRepeatDate);
      formattedDates = dates.map((date) => date.toISOString().split("T")[0]);
      return res.status(200).json({
        data: {
          title,
          host,
          startDate,
          endDate,
          location,
          description,
          interval,
          seatsPerSlot,
          repeat,
          endRepeatDate,
          formattedDates,
          meetingID,
        },
      });
    } else if (repeat === "Weekly") {
      dates = calculateWeeklyDates(repeatingDays, endRepeatDate);
      formattedDates = dates.map((date) => date.toISOString().split("T")[0]);
      return res.status(200).json({
        data: {
          title,
          host,
          startDate,
          endDate,
          location,
          description,
          interval,
          seatsPerSlot,
          repeat,
          endRepeatDate,
          formattedDates,
          meetingID,
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid repeat value" });
    }
  } catch (error) {
    console.error("Meeting fetch error:", error);
    res
      .status(500)
      .json({ message: "Meeting fetch failed", error: error.message });
  }
});

// GET /api/meetings/:meetingID/:date to fetch all slots for a meeting on a specific date
// Meeting contains a list of slots called meetingSlots
router.get("/:meetingID/:date", async (req, res) => {
  const { meetingID, date } = req.params;

  try {
    if (!meetingID || !date) {
      return res
        .status(400)
        .json({ message: "Meeting ID and date are required" });
    }

    const meeting = await Meeting.findById(meetingID).populate("meetingSlots");

    //retrieve the meeting start and end date and interval
    const startDate = new Date(meeting.startDate);
    const endDate = new Date(meeting.endDate);
    //const interval = meeting.interval;

    // console.log("Start Date:", startDate);
    // console.log("End Date:", endDate);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    const cmpDate = new Date(date).toISOString().split("T")[0]; // Get date portion in UTC
    // console.log("cmpDate", cmpDate);
    //CHECK IF DATE COMPARISON IS VALID
    const populatedMeetingSlots = await meeting.populate("meetingSlots");
    const meetingSlots = populatedMeetingSlots.meetingSlots;

    // console.log("Meeting slots:", meetingSlots);
    const fileteredSlots = meetingSlots.filter(
      (slot) =>
        new Date(slot.occurrenceDate).toISOString().split("T")[0] === cmpDate
    );

    // console.log("fileteredSlots", fileteredSlots);

    // find slots that have 0 seats available
    const slotsWithNoSeats = fileteredSlots
      .filter((slot) => slot.seatsAvailable <= 0)
      .map((slot) => slot.startTime);

    // console.log("slotsWithNoSeats", slotsWithNoSeats);

    formattedNoSeats = slotsWithNoSeats.map((slot) => {
      const date = new Date(slot);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    });

    // console.log("formattedNoSeats", formattedNoSeats);

    const allSlots = meeting.validSlots;
    // console.log("allSlots", allSlots);

    let possibleSlots = [];

    const cmpStartDate = new Date(startDate).toISOString().split("T")[0]; // Get date portion in UTC
    // console.log("cmpStartDate", cmpStartDate);

    const cmpEndDate = new Date(endDate).toISOString().split("T")[0]; // Get date portion in UTC
    // console.log("cmpEndDate", cmpEndDate);

    if (cmpStartDate === cmpEndDate) {
      // Case 1: Start and end dates are the same day
      possibleSlots = allSlots[0];
    } else if (cmpDate === cmpStartDate) {
      //   console.log("Start date");
      possibleSlots = allSlots[0];
    } else if (cmpDate === cmpEndDate) {
      // Case 3: Current date is the end date
      //   console.log("End date");
      possibleSlots = allSlots[allSlots.length - 1];
    } else if (cmpDate > cmpStartDate && cmpDate < cmpEndDate) {
      // Case 4: Date is between start and end dates
      //   console.log("In between");
      const diff = Math.floor(
        (new Date(date).setHours(0, 0, 0, 0) -
          new Date(startDate).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      possibleSlots = allSlots[diff];
    } else {
      return res.status(400).json({ message: "Invalid date" });
    }

    // console.log("possibleSlots", possibleSlots);

    // remove slots that are booked and have no seats available
    const finalSlots = possibleSlots.filter(
      (slot) => !formattedNoSeats.includes(slot)
    );
    // console.log("finalSlots", finalSlots);

    res.status(200).json({ data: { finalSlots } });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Meeting slots fetch failed", error: error.message });
  }
});

// GET /api/meetings/allslots/:meetingID/:date to fetch all slots for a meeting on a specific date
router.get("/allslots/:meetingID/:date", async (req, res) => {
  const { meetingID, date } = req.params;

  // console.log("Meeting ID:", meetingID);
  // console.log("Date:", date);

  try {
    if (!meetingID || !date) {
      return res.status(400).json({
        message: "Meeting ID and date are required",
      });
    }

    // Find the meeting and populate the meeting slots
    const meeting = await Meeting.findById(meetingID).populate("meetingSlots");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Get the possible slots from validSlots array
    const cmpDate = new Date(date).toISOString().split("T")[0];
    const cmpStartDate = new Date(meeting.startDate)
      .toISOString()
      .split("T")[0];
    const cmpEndDate = new Date(meeting.endDate).toISOString().split("T")[0];

    let possibleSlots = [];

    // Determine which slots to use based on the date
    if (cmpStartDate === cmpEndDate) {
      possibleSlots = meeting.validSlots[0];
    } else if (cmpDate === cmpStartDate) {
      possibleSlots = meeting.validSlots[0];
    } else if (cmpDate === cmpEndDate) {
      possibleSlots = meeting.validSlots[meeting.validSlots.length - 1];
    } else if (cmpDate > cmpStartDate && cmpDate < cmpEndDate) {
      const diff = Math.floor(
        (new Date(date).setHours(0, 0, 0, 0) -
          new Date(meeting.startDate).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      possibleSlots = meeting.validSlots[diff];
    } else {
      return res.status(400).json({ message: "Invalid date" });
    }

    // Get the booked slots for this date
    const bookedSlots = meeting.meetingSlots
      .filter(
        (slot) =>
          new Date(slot.occurrenceDate).toISOString().split("T")[0] === cmpDate
      )
      .map((slot) => ({
        time: new Date(slot.startTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        seatsAvailable: slot.seatsAvailable,
        totalSeats: meeting.seatsPerSlot,
        attendees: slot.attendees,
      }));

    // Create a map of booked slots for easy lookup
    const bookedSlotsMap = new Map(
      bookedSlots.map((slot) => [slot.time, slot])
    );

    // Combine all slots with their booking status
    const allSlots = possibleSlots.map((slotTime) => {
      const bookedSlot = bookedSlotsMap.get(slotTime);
      const seatsAvailable = bookedSlot
        ? bookedSlot.seatsAvailable
        : meeting.seatsPerSlot;

      const isBooked = meeting.seatsPerSlot - seatsAvailable > 0;

      return {
        time: slotTime,
        seatsAvailable: seatsAvailable,
        totalSeats: meeting.seatsPerSlot,
        attendees: bookedSlot ? bookedSlot.attendees : [],
        isBooked: isBooked,
      };
    });

    res.status(200).json({
      data: {
        date: cmpDate,
        slots: allSlots,
      },
    });
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({
      message: "Failed to fetch slots",
      error: error.message,
    });
  }
});

// GET /api/meetings/:meetingID/:date/:slot to fetch a specific slot for a meeting on a specific date
router.get("/:meetingID/:date/:slot", async (req, res) => {
  const { meetingID, date, slot } = req.params;
  // console.log("Meeting ID:", meetingID);

  const savedDate = new Date(date);
  const slotString = `${savedDate.toISOString().split("T")[0]} ${slot}`;
  const slotTime = new Date(slotString);
  // console.log("Slot time:", slotTime);

  try {
    if (!meetingID || !date || !slot) {
      return res
        .status(400)
        .json({ message: "Meeting ID, date, and slot are required" });
    }

    const meeting = await Meeting.findById(meetingID).populate("meetingSlots");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    //TODO COMPARE WITH THE ACTUAL TIME
    const meetingSlot = meeting.meetingSlots.find((slot) => {
      return (
        new Date(slot.startTime).getTime() === new Date(slotTime).getTime()
      );
    });
    // console.log("Meeting slot:", meetingSlot);

    // if no meeting slot is found, return the max seats for the meeting
    if (!meetingSlot) {
      return res.status(200).json({ data: { seats: meeting.seatsPerSlot } });
    } else {
      const seatsLeft = meetingSlot.seatsAvailable;
      //   console.log("Seats left:", seatsLeft);
      res.status(200).json({ data: { seats: seatsLeft } });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Meeting slots fetch failed", error: error.message });
  }
});

// DELETE /api/meetings/:meetingID to delete a meeting
router.delete("/:meetingID", async (req, res) => {
  const { meetingID } = req.params;

  try {
    if (!meetingID) {
      return res.status(400).json({ message: "Meeting ID is required" });
    }

    // Find the meeting and populate the necessary fields
    const meeting = await Meeting.findById(meetingID)
      .populate({
        path: "meetingSlots",
        populate: {
          path: "registeredAttendees",
          populate: {
            path: "attendeeId",
            model: "User",
            populate: {
              path: "reservations",
            },
          },
        },
      })
      .populate("host");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Get attendees with their populated data
    const attendees = meeting.meetingSlots.flatMap((slot) =>
      slot.registeredAttendees.map((registration) => registration.attendeeId)
    );

    // Update each attendee's reservations
    for (const attendee of attendees) {
      attendee.reservations = attendee.reservations.filter(
        (reservation) => reservation.meeting.toString() !== meetingID
      );

      // Save the updated attendee
      await attendee.save();

      // get the host's name
      const hostName = `${meeting.host.firstName} ${meeting.host.lastName}`;

      // notify each attendee of the meeting cancellation
      const notification = new Notification({
        user: attendee._id,
        title: "Meeting Cancelled",
        message: `${hostName} has cancelled the meeting "${meeting.title}".`,
        date: Date.now(),
      });

      await notification.save();

      // add notification to host's notifications array
      await User.findByIdAndUpdate(attendee._id, {
        $push: { Notifications: notification._id },
      });
    }

    // Log number of attendees whose reservations were updated
    // console.log(`Updated reservations for ${attendees.length} attendees.`);

    // Delete the meeting
    const deletedMeeting = await Meeting.findByIdAndDelete(meetingID);
    if (!deletedMeeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Delete all associated meeting slots
    await MeetingSlot.deleteMany({ meeting: meetingID });

    // Remove the meeting from the host's list of meetings
    const host = await User.findById(deletedMeeting.host);
    if (host) {
      host.meetings = host.meetings.filter(
        (meeting) => meeting.toString() !== meetingID
      );
      await host.save();
    } else {
      console.error(`Host with ID ${deletedMeeting.host} not found.`);
    }

    // Respond with a success message
    res
      .status(200)
      .json({ message: "Meeting deleted successfully", deletedMeeting });
  } catch (error) {
    // console.error("Error deleting meeting:", error.message);
    res
      .status(500)
      .json({ message: "Meeting deletion failed", error: error.message });
  }
});

module.exports = router;
