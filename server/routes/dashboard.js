// Contributors: Eric Cheng

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Meeting = require("../models/meeting");
const MeetingSlot = require("../models/meetingSlot");

// GET /api/dashboard/meetings/:userID to fetch all meetings a user has created
router.get("/meetings/:userID", async (req, res) => {
  const { userID } = req.params;

  // console.log("User ID:", userID);
  try {
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const meetings = await Meeting.find({ host: userID });
    // console.log("Meetings:", meetings);

    //return a list of meeting IDs with the corresponding title, location
    const meetingList = meetings.map((meeting) => ({
      id: meeting._id,
      title: meeting.title,
      location: meeting.location,
    }));

    res.status(200).json({ data: meetingList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Meeting fetch failed", error: error.message });
  }
});

// GET /api/dashboard/bookings/:userID to fetch all bookings for a user
router.get("/bookings/:userID", async (req, res) => {
  const { userID } = req.params;

  try {
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userID).populate({
      path: "reservations",
      populate: {
        path: "meeting",
      },
    });

    const bookingList = user.reservations.map((booking) => {
      // Get full ISO strings for all dates/times
      const occurrenceDate = new Date(booking.occurrenceDate);
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);

      return {
        id: booking._id,
        title: booking.meeting.title,
        location: booking.meeting.location,
        // Include full ISO strings with timezone information
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        occurrenceDate: occurrenceDate.toISOString(),
      };
    });

    res.status(200).json({ data: bookingList });
  } catch (error) {
    console.error("Error fetching bookings: ", error);
    res
      .status(500)
      .json({ message: "Booking fetch failed", error: error.message });
  }
});

// GET /api/dashboard/events/:userID to fetch all the booking a user has made and all the slots for meetings the user has created
//For the meetings the user has created, each event should have the list of attendees
//For meetings the user has booked, the event should have the host name
router.get("/events/:userID", async (req, res) => {
  const { userID } = req.params;

  // console.log("User ID:", userID);
  try {
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    //Populate the host under the meeting object
    const user = await User.findById(userID).populate({
      path: "reservations",
      populate: {
        path: "meeting",
        populate: { path: "host", select: "firstName lastName" },
      },
    });

    const meetings = await Meeting.find({ host: userID }).populate(
      "meetingSlots"
    );

    //return a list of meeting IDs with the corresponding title, location, date, start time, end time, and attendees
    const eventList = [];

    // Add the meetings the user has created. Each slot is an event. Take the attendees array from the slot (not registeredAttendees)
    meetings.forEach((meeting) => {
      meeting.meetingSlots.forEach((slot) => {
        const attendees = slot.attendees.map((attendee) => attendee);
        eventList.push({
          title: meeting.title,
          location: meeting.location,
          date: slot.occurrenceDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          attendees,
        });
      });
    });

    // Add the bookings the user has made. Each booking is an event. Take the host name from the meeting
    user.reservations.forEach((booking) => {
      const hostName = `${booking.meeting.host.firstName} ${booking.meeting.host.lastName}`;

      eventList.push({
        title: booking.meeting.title,
        location: booking.meeting.location,
        date: booking.occurrenceDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        host: hostName,
      });
    });

    //console.log("Event list:", eventList);

    res.status(200).json({ data: eventList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Event fetch failed", error: error.message });
  }
});

module.exports = router;
