// Contributors: Eric Cheng

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Meeting = require("../models/meeting");
const MeetingSlot = require("../models/meetingSlot");
const Notification = require("../models/notification");
const { validateBooking } = require("../middleware");
const { calculateDates, calculateWeeklyDates } = require("../utils");
const { formatDateTime } = require("../utils");

// POST /api/bookings/new to create a new booking
router.post("/new", validateBooking, async (req, res) => {
  const { attendee, meetingID, userID, meetingDate, timeSlot, seats } =
    req.body;

  try {
    const meeting = await Meeting.findById(meetingID).populate("meetingSlots");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    let dates = [];
    let formattedDates = [];
    const repeat = meeting.repeat;
    const startDate = meeting.startDate;
    const endRepeatDate = meeting.endRepeatDate;
    const repeatingDays = meeting.repeatDays;
    const intervalCheck = meeting.interval;

    // Retrieve the dates for the meeting based on the repeat value
    // Note: Cannot reuse the logic from the meeting creation route as the date is in a different format
    if (repeat === "None") {
      if (
        intervalCheck !== 10 &&
        intervalCheck !== 15 &&
        intervalCheck !== 20 &&
        intervalCheck !== 30 &&
        intervalCheck !== 60
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
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });

    //check if the is contained in the meeting dates
    if (!formattedDates.includes(meetingDate)) {
      return res.status(400).json({
        message: "The selected date is not available for booking",
      });
    }

    const allSlots = meeting.validSlots;
    let possibleSlots = [];

    //Check if the received slot is valid
    // Note: cannot reuse the logic from the meeting creation route as the date is in a different format
    const receivedDate = new Date(meetingDate);
    const cmpDate = receivedDate.toISOString().split("T")[0];
    const startDateObj = new Date(meeting.startDate);
    const endDateObj = new Date(meeting.endDate);
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
        (new Date(receivedDate).setHours(0, 0, 0, 0) -
          new Date(startDate).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      possibleSlots = allSlots[diff];
    } else {
      return res.status(400).json({ message: "Invalid date" });
    }

    if (!possibleSlots.includes(timeSlot)) {
      return res.status(400).json({
        message: "The selected time slot is not available for booking",
      });
    }

    const existingSlots = meeting.meetingSlots.filter(
      (slot) => slot.occurrenceDate.toISOString().split("T")[0] === meetingDate
    );
    const interval = meeting.interval;
    const savedDate = new Date(meetingDate);
    const startString = `${savedDate.toISOString().split("T")[0]} ${timeSlot}`;
    const startTime = new Date(startString).toISOString();
    let endTime = new Date(startTime); // Create a new Date object to avoid mutating the original

    endTime.setMinutes(endTime.getMinutes() + interval);

    const endTimeHours = endTime.getHours();
    const endTimeMinutes = endTime.getMinutes();

    const meetingEndDateHours = meeting.endDate.getHours();
    const meetingEndDateMinutes = meeting.endDate.getMinutes();

    // Check if the end time exceeds the slot and set it to the slot's end time
    if (
      meeting.repeat === "Daily" &&
      (endTimeHours > meetingEndDateHours ||
        (endTimeHours === meetingEndDateHours &&
          endTimeMinutes > meetingEndDateMinutes))
    ) {
      // Set endTime to meeting endDate if the end time exceeds the meeting's end time
      endTime.setHours(meetingEndDateHours);
      endTime.setMinutes(meetingEndDateMinutes);
    } else if (
      meeting.repeat === "Weekly" &&
      (endTimeHours > meetingEndDateHours ||
        (endTimeHours === meetingEndDateHours &&
          endTimeMinutes > meetingEndDateMinutes))
    ) {
      // Set endTime to meeting endDate if the end time exceeds the meeting's end time
      endTime.setHours(meetingEndDateHours);
      endTime.setMinutes(meetingEndDateMinutes);
    } else if (
      meeting.repeat === "None" &&
      (endTimeHours > meetingEndDateHours ||
        (endTimeHours === meetingEndDateHours &&
          endTimeMinutes > meetingEndDateMinutes))
    ) {
      // Set endTime to meeting endDate if the end time exceeds the meeting's end time
      endTime = meeting.endDate;
    }

    endTime = endTime.toISOString();

    if (existingSlots.length === 0) {
      //check if the slot is full
      if (seats > meeting.seatsPerSlot) {
        return res.status(400).json({
          message: "The number of seats booked exceeds the available seats",
        });
      }

      const newSlot = new MeetingSlot({
        meeting: meetingID,
        occurrenceDate: savedDate.toISOString(),
        startTime,
        endTime,
        //push the attendee to the attendees array
        attendees: [attendee],
        seatsAvailable: meeting.seatsPerSlot - seats,
      });

      //save the new booking
      await newSlot.save();
      //add the booking to the meeting
      meeting.meetingSlots.push(newSlot);
      await meeting.save();
      // notify the host of the new booking
      const notification = new Notification({
        user: meeting.host.toString(),
        title: "New Booking",
        // Format the message with the user's full name and the date of the booking
        message: `${attendee} has booked a slot for "${
          meeting.title
        }" on ${formatDateTime(startTime)}`,
        date: Date.now(),
      });

      await notification.save();

      await meeting.populate("host");
      // add notification to host's notifications array
      const host = await User.findById(meeting.host._id).populate(
        "Notifications"
      );

      host.Notifications.push(notification);

      //save the host
      await host.save();

      //check if a user is logged in and add the booking to the user
      if (userID && userID !== "") {
        const user = await User.findById(userID);
        user.reservations.push(newSlot);
        await user.save();

        //add the user to the list of registered attendees for the slot
        newSlot.registeredAttendees.push({
          attendeeId: userID, // The user's ID
          seatsBooked: seats, // Number of seats booked
        });
        await newSlot.save();
      }
      return res.status(201).json({ message: "Booking created successfully" });
    } else {
      // check is there is a slot for that date and time

      const existingSlot = existingSlots.find(
        (slot) => slot.startTime === startTime
      );

      //check if the slot is full

      if (!existingSlot) {
        if (seats > meeting.seatsPerSlot) {
          return res.status(400).json({
            message: "The number of seats booked exceeds the available seats",
          });
        }
        const newSlot = new MeetingSlot({
          meeting: meetingID,
          occurrenceDate: savedDate.toISOString(),
          startTime,
          endTime,
          //push the attendee to the attendees array
          attendees: [attendee],
          seatsAvailable: meeting.seatsPerSlot - seats,
        });

        //save the new booking
        await newSlot.save();
        //add the booking to the meeting
        meeting.meetingSlots.push(newSlot);
        await meeting.save();

        // notify the host of the new booking
        const notification = new Notification({
          user: meeting.host.toString(),
          title: "New Booking",
          // Format the message with the user's full name and the date of the booking
          message: `${attendee} has booked a slot for "${
            meeting.title
          }" on ${formatDateTime(startTime)}`,
          date: Date.now(),
        });

        await notification.save();

        await meeting.populate("host");
        // add notification to host's notifications array
        const host = await User.findById(meeting.host._id).populate(
          "Notifications"
        );

        host.Notifications.push(notification);

        //save the host
        await host.save();

        //check if a user is logged in and add the booking to the user
        if (userID && userID !== "") {
          console.log("User ID:", userID);
          const user = await User.findById(userID);
          user.reservations.push(newSlot);
          await user.save();

          newSlot.registeredAttendees.push({
            attendeeId: userID, // The user's ID
            seatsBooked: seats, // Number of seats booked
          });

          await newSlot.save();
        }
        return res
          .status(201)
          .json({ message: "Booking created successfully" });
      } else {
        //check if the slot is full
        if (seats > existingSlot.seatsAvailable) {
          return res.status(400).json({
            message: "The number of seats booked exceeds the available seats",
          });
        }

        //push the attendee to the attendees array
        existingSlot.attendees.push(attendee);
        //update the seats available
        existingSlot.seatsAvailable -= seats;
        await existingSlot.save();

        // notify the host of the new booking
        const notification = new Notification({
          user: meeting.host.toString(),
          title: "New Booking",
          // Format the message with the user's full name and the date of the booking
          message: `${attendee} has booked a slot for "${
            meeting.title
          }" on ${formatDateTime(startTime)}`,
          date: Date.now(),
        });

        await notification.save();

        //retrieve the meeting host
        await meeting.populate("host");
        // add notification to host's notifications array
        //retrieve the meeting host

        const host = await User.findById(meeting.host._id).populate(
          "Notifications"
        );

        host.Notifications.push(notification);

        //save the host
        await host.save();

        //check if a user is logged in and add the booking to the user
        if (userID) {
          const user = await User.findById(userID);
          user.reservations.push(existingSlot);
          await user.save();

          //add the user to the list of registered attendees for the slot
          existingSlot.registeredAttendees.push({
            attendeeId: userID, // The user's ID
            seatsBooked: seats, // Number of seats booked
          });
          await existingSlot.save();
        }
        return res
          .status(201)
          .json({ message: "Booking created successfully" });
      }
    }
  } catch (error) {
    console.error("Booking creation error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }

    res
      .status(500)
      .json({ message: "Booking creation failed", error: error.message });
  }
});

// DELETE /api/bookings/:bookingID/:userID to delete a booking
router.delete("/:bookingID/:userID", async (req, res) => {
  const { bookingID, userID } = req.params;

  try {
    // Ensure bookingID and userID are provided
    if (!bookingID || !userID) {
      return res
        .status(400)
        .json({ message: "Booking ID and User ID are required" });
    }

    // First, find the booking without population to verify it exists
    const bookingExists = await MeetingSlot.findById(bookingID);
    if (!bookingExists) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Now find with explicit population of all nested paths
    const booking = await MeetingSlot.findById(bookingID).populate({
      path: "meeting",
      populate: {
        path: "host",
      },
    });

    // Separately populate registeredAttendees
    await booking.populate("registeredAttendees.attendeeId");

    // Find the user
    const registeree = await User.findById(userID);
    if (!registeree) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format the user's name
    const userName = `${registeree.firstName} ${registeree.lastName}`;

    // Remove the user from the list of attendees
    booking.attendees = booking.attendees.filter(
      (attendee) => attendee !== userName
    );

    // Create notification
    const notification = new Notification({
      user: booking.meeting.host._id,
      title: "Booking Cancelled",
      message: `${userName} has cancelled their booking for "${
        booking.meeting.title
      }" on ${formatDateTime(booking.startTime)}`,
      date: Date.now(),
    });

    await notification.save();

    // Update host's notifications
    await User.findByIdAndUpdate(booking.meeting.host._id, {
      $push: { Notifications: notification._id },
    });

    // Find the booking in registeredAttendees
    const bookingToRemove = booking.registeredAttendees.find(
      (attendee) =>
        attendee.attendeeId && attendee.attendeeId._id.toString() === userID
    );

    if (bookingToRemove) {
      // Update seats available
      booking.seatsAvailable += bookingToRemove.seatsBooked;

      // Remove from registeredAttendees
      booking.registeredAttendees = booking.registeredAttendees.filter(
        (attendee) =>
          attendee.attendeeId && attendee.attendeeId._id.toString() !== userID
      );
    }

    // Remove from user's reservations using $pull
    await User.findByIdAndUpdate(userID, {
      $pull: { reservations: bookingID },
    });

    // Check if the booking has any remaining registrations
    if (booking.registeredAttendees.length === 0) {
      // If no registrations left, remove the booking from the meeting
      await Meeting.findByIdAndUpdate(booking.meeting._id, {
        $pull: { meetingSlots: bookingID },
      });

      // Delete the booking completely
      await MeetingSlot.findByIdAndDelete(bookingID);

      return res.status(200).json({
        message: "Booking deleted successfully and removed from meeting",
      });
    }

    // If there are still other registrations, just save the updated booking
    await booking.save();

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res
      .status(500)
      .json({ message: "Booking deletion failed", error: error.message });
  }
});

module.exports = router;
