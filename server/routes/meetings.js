// Contributors: Eric Cheng

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Meeting = require("../models/meeting");
const MeetingSlot = require("../models/meetingSlot");
const Notification = require("../models/notification");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { validateMeeting } = require("../middleware");
const {
  generateSlots,
  calculateDates,
  calculateWeeklyDates,
} = require("../utils");

// POST /api/meetings/new to handle new meeting creation
router.post("/new", validateMeeting, async (req, res) => {
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

  //Start of additional validation

  //check start date is not before today
  const today = new Date().toLocaleString();
  const cmpStartDate = new Date(startDate).toLocaleString();
  const cmpEndDate = new Date(endDate).toLocaleString();
  const onlyDateStart = new Date(startDate).toLocaleDateString();
  const onlyDateEnd = new Date(endDate).toLocaleDateString();

  if (cmpStartDate < today) {
    return res.status(400).json({ message: "Start time cannot be before now" });
  }

  //check end date is not before start date or today
  if (cmpEndDate < cmpStartDate || cmpEndDate < today) {
    return res
      .status(400)
      .json({ message: "End time cannot be before start time or now" });
  }

  //if the interval is not 10, 15, 20, 30, or 60, check if its equal to the minutes between the start and end date.
  if (
    interval !== 10 &&
    interval !== 15 &&
    interval !== 20 &&
    interval !== 30 &&
    interval !== 60
  ) {
    const diff = Math.floor((cmpEndDate - cmpStartDate) / (1000 * 60));
    if (diff % interval !== 0) {
      return res.status(400).json({ message: "Invalid interval time" });
    }
  }

  //check that the seats per slot is greater than 0
  if (seatsPerSlot <= 0) {
    return res
      .status(400)
      .json({ message: "Seats per slot must be at least 1" });
  }

  //if repeat is other than none, check that the start and end time are on the same day
  if (repeat !== "None" && onlyDateStart !== onlyDateEnd) {
    return res.status(400).json({
      message:
        "Start and end date must be on the same day for repeating meetings",
    });
  }

  // If repeat is selected, check for an endDate and check that the endRepeatDate is after the start date
  if (repeat !== "None" && !endRepeatDate) {
    return res
      .status(400)
      .json({ message: "End repeat date is required for repeating meetings" });
  }

  if (repeat !== "None" && new Date(endRepeatDate) < cmpStartDate) {
    return res
      .status(400)
      .json({ message: "End repeat date must be after the start date" });
  }

  // If repeat is weekly, check for repeating days
  if (repeat === "Weekly" && (!repeatDays || repeatDays.length === 0)) {
    return res.status(400).json({
      message: "Repeating start days are required for weekly meetings",
    });
  }

  // check that the repeating days are not before the start date
  if (repeat === "Weekly") {
    for (let i = 0; i < repeatDays.length; i++) {
      const cmpRepeatDate = new Date(repeatDays[i]);
      if (cmpRepeatDate < cmpStartDate) {
        return res
          .status(400)
          .json({ message: "Repeating days cannot be before the start date" });
      }
    }
  }

  //End of additional validation

  try {
    // Retrieve all valid time slots for the meeting
    const allSlots = generateSlots(startDate, endDate, interval);

    // Create a new meeting object
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

    // save the meeting under the host
    const hostUser = await User.findById(host);
    if (hostUser) {
      // push the meeting ID to the meetings array
      // initialize meetings array if it doesn't exist
      if (!hostUser.meetings) {
        hostUser.meetings = [];
      }
      hostUser.meetings.push(newMeeting._id);
      await hostUser.save();
    }

    // Create a token for the new meeting that can be used to fetch the meeting
    const payload = { ID: newMeeting._id }; // Create a payload with the meeting ID
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

// GET /api/meetings/token/:meetingID to generate a token for the requested meeting
router.get("/token/:meetingID", async (req, res) => {
  const { meetingID } = req.params;

  try {
    if (!meetingID) {
      return res.status(400).json({ message: "Meeting ID is required" });
    }
    //check if the meeting ID exists by checking if the meeting is in the database
    const meeting = await Meeting.findById;
    if (!meeting) {
      return res.status(404).json({ message: "Requested meeting not valid" });
    }

    const payload = { ID: meetingID };
    const token = jwt.sign(payload, config.secretKey, { algorithm: "HS256" });

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

    // Retrieve the dates for the meeting based on the repeat value
    if (repeat === "None") {
      if (
        interval !== 10 &&
        interval !== 15 &&
        interval !== 20 &&
        interval !== 30 &&
        interval !== 60
      ) {
        dates = calculateDates(startDate, startDate); // Single start date
      } else {
        dates = calculateDates(startDate, endRepeatDate); // Multiple dates
      }
    } else if (repeat === "Daily") {
      dates = calculateDates(startDate, endRepeatDate);
    } else if (repeat === "Weekly") {
      dates = calculateWeeklyDates(repeatingDays, endRepeatDate);
    } else {
      return res.status(400).json({ message: "Invalid repeat value" });
    }

    formattedDates = dates.map((date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });

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
  } catch (error) {
    console.error("Meeting fetch error:", error);
    res
      .status(500)
      .json({ message: "Meeting fetch failed", error: error.message });
  }
});

// GET /api/meetings/:meetingID/:date to fetch all slots for a meeting on a specific date
router.get("/:meetingID/:date", async (req, res) => {
  const { meetingID, date } = req.params;

  try {
    if (!meetingID || !date) {
      return res
        .status(400)
        .json({ message: "Meeting ID and date are required" });
    }

    const meeting = await Meeting.findById(meetingID).populate("meetingSlots");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const startDate = new Date(meeting.startDate);
    const endDate = new Date(meeting.endDate);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    const cmpDate = new Date(date).toISOString().split("T")[0]; // Get date portion

    const populatedMeetingSlots = await meeting.populate("meetingSlots");
    const meetingSlots = populatedMeetingSlots.meetingSlots;

    // get the slots that match the date
    const fileteredSlots = meetingSlots.filter(
      (slot) =>
        new Date(slot.occurrenceDate).toISOString().split("T")[0] === cmpDate
    );

    // get the slots that have no seats available
    const slotsWithNoSeats = fileteredSlots
      .filter((slot) => slot.seatsAvailable <= 0)
      .map((slot) => slot.startTime);

    // format the slots with no seats
    formattedNoSeats = slotsWithNoSeats.map((slot) => {
      const date = new Date(slot);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    });

    // retrieve the valid slots for the meeting
    const allSlots = meeting.validSlots;
    let possibleSlots = [];

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    const cmpStartDate = `${startDateObj.getFullYear()}-${String(
      startDateObj.getMonth() + 1
    ).padStart(2, "0")}-${String(startDateObj.getDate()).padStart(2, "0")}`;
    const cmpEndDate = `${endDateObj.getFullYear()}-${String(
      endDateObj.getMonth() + 1
    ).padStart(2, "0")}-${String(endDateObj.getDate()).padStart(2, "0")}`;

    if (cmpStartDate === cmpEndDate) {
      possibleSlots = allSlots[0];
    } else if (cmpDate === cmpStartDate) {
      possibleSlots = allSlots[0];
    } else if (cmpDate === cmpEndDate) {
      possibleSlots = allSlots[allSlots.length - 1];
    } else if (cmpDate > cmpStartDate && cmpDate < cmpEndDate) {
      const diff = Math.floor(
        (new Date(date).setHours(0, 0, 0, 0) -
          new Date(startDate).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      possibleSlots = allSlots[diff];
    } else {
      return res.status(400).json({ message: "Invalid date" });
    }

    // remove slots that are booked and have no seats available
    const finalSlots = possibleSlots.filter(
      (slot) => !formattedNoSeats.includes(slot)
    );

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
    const startDateObj = new Date(meeting.startDate);
    const endDateObj = new Date(meeting.endDate);

    const cmpStartDate = `${startDateObj.getFullYear()}-${String(
      startDateObj.getMonth() + 1
    ).padStart(2, "0")}-${String(startDateObj.getDate()).padStart(2, "0")}`;
    const cmpEndDate = `${endDateObj.getFullYear()}-${String(
      endDateObj.getMonth() + 1
    ).padStart(2, "0")}-${String(endDateObj.getDate()).padStart(2, "0")}`;

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

    // Find the meeting slot that matches the slot time
    const meetingSlot = meeting.meetingSlots.find((slot) => {
      return (
        new Date(slot.startTime).getTime() === new Date(slotTime).getTime()
      );
    });

    // if no meeting slot is found, return the max seats for the meeting
    if (!meetingSlot) {
      return res.status(200).json({ data: { seats: meeting.seatsPerSlot } });
    } else {
      const seatsLeft = meetingSlot.seatsAvailable;
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
