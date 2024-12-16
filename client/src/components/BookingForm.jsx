import React, { useState } from "react";
import { useEffect } from "react";

//TODO
import { createBooking } from "../api/api";
import { fetchMeeting } from "../api/api"; // onload to get the general meeting details
import { getMeetingsSlots } from "../api/api";

import CalendarDateInput from "./CalendarDateInput";
import InputField from "./InputField";
import SelectField from "./SelectField";
import "./BookingForm.css";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BookingForm = (token) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allSlots, setAllSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [maxSeats, setMaxSeats] = useState(0);
  const [highlightedDates, setHighlightedDates] = useState([]);

  useEffect(() => {
    // Fetch the meeting data on load
    const fetchMeetingDetails = async () => {
      try {
        const response = await fetchMeeting(meetingID);
        const { startDate, endDate, timeSlot, seats, interval } = response.data;

        // Calculate highlighted dates based on the interval
        const dates = calculateDates(
          new Date(startDate),
          new Date(endDate),
          interval
        );

        setHighlightedDates(dates);

        // Prepopulate form fields
        setFormData({
          meetingDate: startDate,
          timeSlot: timeSlot || "",
          seats: seats || "",
        });
      } catch (error) {
        console.error("Error fetching meeting data:", error);
      }
    };

    fetchMeetingDetails();
  }, [meetingID]);

  const calculateDates = (startDate, endDate, interval) => {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate)); // Push the date
      currentDate.setDate(
        currentDate.getDate() + (interval === "daily" ? 1 : 7)
      ); // Increment based on interval
    }

    return dates;
  };

  const generateSlots = (startTime, endTime, interval) => {
    const slots = [];
    const start = new Date(`1970-01-01T${startTime}:00`); // Base date for time calculation
    const end = new Date(`1970-01-01T${endTime}:00`);

    let current = new Date(start);

    while (current < end) {
      slots.push(
        current.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      current.setMinutes(current.getMinutes() + interval); // Increment by interval
    }

    return slots;
  };

  const [formData, setFormData] = useState({
    attendee: user ? user.id : "",
    meetingDate: "",
    timeSlot: "",
    seats: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = async (date) => {
    setFormData({
      ...formData,
      meetingDate: date,
    });

    try {
      const response = await getMeetingsSlots(meetingID, date);
      const { bookedSlots } = await response.json();

      const remainingSlots = allSlots.filter(
        (slot) => !bookedSlots.some((booked) => booked.timeSlot === slot)
      );

      setAvailableSlots(remainingSlots);
    } catch (error) {
      console.error("Error fetching slots for the date:", error);
      toast.error("Error fetching available slots.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createBooking(formData);
      if (!response) {
        toast.error("Failed to create the booking.");
        return;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Booking creation failed";
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <div className="form-date">
        <CalendarDateInput
          label="Date:"
          value={formData.meetingDate}
          onChange={handleDateChange}
          highlightedDates={highlightedDates}
        />
      </div>

      <div className="form-slot">
        <SelectField
          label="Time slot:"
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleChange}
          options={availableSlots}
        />
      </div>

      <div className="form-seats">
        <InputField
          label="Number of seats:"
          name="seats"
          type="number"
          min="1"
          max={maxSeats}
          value={formData.seats}
          onChange={handleChange}
          placeholder="Enter the number of seats"
        />
      </div>

      <div className="form-submit">
        <button type="submit">Book Meeting</button>
      </div>
    </form>
  );
};

export default BookingForm;
