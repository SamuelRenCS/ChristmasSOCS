const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Meeting = require("../models/meeting");
const MeetingSlot = require("../models/meetingSlot");
const { validateBooking } = require("../middleware");
const {
  calculateDates,
  calculateWeeklyDates,
} = require("../utils");

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
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });

    //check if the is contained in the meeting dates
    if (!formattedDates.includes(meetingDate)) {
      return res.status(400).json({
        message: "The selected date is not available for booking",
      });
    }

    //check if the time slot is contained in the meeting slots
    const slots = meeting.meetingSlots.map((slot) => slot.startTime);
    if (!slots.includes(timeSlot)) {
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

    //console.log("end time 1", endTime);

    endTime.setMinutes(endTime.getMinutes() + interval);

    // console.log("end time 2", endTime);

    //TODO WRONG
    const endTimeHours = endTime.getHours();
    const endTimeMinutes = endTime.getMinutes();

    const meetingEndDateHours = meeting.endDate.getHours();
    const meetingEndDateMinutes = meeting.endDate.getMinutes();

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

    // console.log("Start time:", startTime);
    // console.log("End time:", endTime);

    if (existingSlots.length === 0) {
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
      //check if a user is logged in and add the booking to the user
      if (userID && userID !== "") {
        // console.log("User ID:", userID);

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
      if (!existingSlot) {
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
        //check if a user is logged in and add the booking to the user
        if (userID && userID !== "") {
          console.log("User ID:", userID);
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
        return res
          .status(201)
          .json({ message: "Booking created successfully" });
      } else {
        //push the attendee to the attendees array
        existingSlot.attendees.push(attendee);
        //update the seats available
        existingSlot.seatsAvailable -= seats;
        await existingSlot.save();

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
// When a booking is deleted, the seats available for the slot should be updated
// The booking should be removed from the user's list of reservations
// The booking should be removed from the slot's list of attendees and registered attendees
router.delete("/:bookingID/:userID", async (req, res) => {
  const { bookingID, userID } = req.params;

  try {
    // Ensure bookingID and userID are provided
    if (!bookingID || !userID) {
      return res
        .status(400)
        .json({ message: "Booking ID and User ID are required" });
    }

    // Find the booking slot and populate necessary fields
    const booking = await MeetingSlot.findById(bookingID)
      .populate({
        path: "registeredAttendees.attendeeId", // Populate attendeeId inside registeredAttendees
        model: "User", // Refers to the User model
      })
      .populate({
        path: "meeting",
        populate: { path: "host" }, // Optionally populate meeting and host details if needed
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

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

    // Find the booking to remove from the registered attendees list
    // Find the booking to remove from the registered attendees list
    const bookingToRemove = booking.registeredAttendees.find(
      (attendee) => attendee.attendeeId._id.toString() === userID
    );
    // console.log("Booking to remove:", bookingToRemove);

    if (bookingToRemove) {
      // Update the available seats by adding back the number of seats the user booked
      booking.seatsAvailable += bookingToRemove.seatsBooked;

      // console.log("Seats available:", booking.seatsAvailable);

      // Remove the booking from the registered attendees list
      booking.registeredAttendees = booking.registeredAttendees.filter(
        (attendee) => attendee.attendeeId._id.toString() !== userID
      );

      // console.log("Registered attendees:", booking.registeredAttendees);
    }

    // Remove the booking from the user's list of reservations
    registeree.reservations = registeree.reservations.filter(
      (reservation) => reservation.toString() !== bookingID
    );

    // Save the updated user and booking slot
    await registeree.save();
    await booking.save();

    // console.log("Successfully deleted booking");
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error.message);
    res
      .status(500)
      .json({ message: "Booking deletion failed", error: error.message });
  }
});

module.exports = router;
