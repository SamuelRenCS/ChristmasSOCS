import React, { useState } from "react";
import { useEffect } from "react";

//TODO
import { createBooking } from "../api/api";
import { fetchMeeting } from "../api/api"; // onload to get the general meeting details
import { fetchMeetingSlot } from "../api/api";

import { fetchSeats } from "../api/api";

import CalendarDateInput from "./CalendarDateInput";
import InputField from "./InputField";
import SelectField from "./SelectField";
import styles from "./BookingForm.module.css";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BookingForm = ({token}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetingID, setMeetingID] = useState("");

  //const [allSlots, setAllSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [maxSeats, setMaxSeats] = useState(0);
  const [highlightedDates, setHighlightedDates] = useState([]);

  useEffect(() => {
    // Fetch the meeting data on load
    const fetchMeetingDetails = async () => {
      try {
        // pass token as a string
        const response = await fetchMeeting(token);
        // res.status(200).json({ data: { title, host, date, startTime, endTime, location, description, interval, seatsPerSlot, repeat, endDate, dates } });
        const { title, host, date, startTime, endTime, location, description, interval, seatsPerSlot, repeat, endDate, formattedDates, meetingID } = response.data;

        setMeetingID(meetingID);
        console.log("Meeting details:", response.data);
        console.log("Formatted dates:", formattedDates);
        setHighlightedDates(formattedDates);

        //keep the date part of the datetime
        const dateObj = new Date(date);

        // Prepopulate form fields
        setFormData({
          attendee: user ? `${user.firstName} ${user.lastName}` : "",
          meetingDate: dateObj.toISOString().split("T")[0],
        });

      } catch (error) {
        console.error("Error fetching meeting data:", error);
      }
    };

    fetchMeetingDetails();
  }, [token]);

  const [formData, setFormData] = useState({
    // Retrieve the first and last name from the user context
    attendee: user ? `${user.firstName} ${user.lastName}` : "",
    meetingDate: "",
    timeSlot: "",
    seats: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value || "" });
  };

  const handleDateChange = async (date) => {
    setFormData({
      ...formData,
      meetingDate: date || "",
    });

    try {
      const response = await fetchMeetingSlot(meetingID, date);
      const  remainingSlots = response.data.finalSlots;
      console.log("Available slots:", remainingSlots);
      setAvailableSlots(remainingSlots);
      // select the first slot
      setFormData({
        ...formData,
        timeSlot: remainingSlots[0] || "",
      });
      // get the max seats for the first slot
      const firstSlot = remainingSlots[0];
      try {
        //console.log("Meeting ID:", meetingID);
        const response = await fetchSeats(meetingID, formData.meetingDate, firstSlot);
        const remainingSeats = response.data.seats;
        console.log("Remaining seats:", remainingSeats);
        setMaxSeats(remainingSeats);
      } catch (error) {
        console.error("Error fetching remaining seats for the slot:", error);
        toast.error("Error fetching remaining seats.");
      }
    } catch (error) {
      console.error("Error fetching slots for the date:", error);
      toast.error("Error fetching available slots.");
    }
  };

  // When is a slot selected, we need to update the max of seats available
  const handleSlotChange = async (e) => {
    const selectedSlot = e.target.value;
    setFormData({
      ...formData,
      timeSlot: selectedSlot || "",
    });

    try {
      //console.log("Meeting ID:", meetingID);
      const response = await fetchSeats(meetingID, formData.meetingDate, selectedSlot);
      const remainingSeats = response.data.seats;
      console.log("Remaining seats:", remainingSeats);
      setMaxSeats(remainingSeats);
    } catch (error) {
      console.error("Error fetching remaining seats for the slot:", error);
      toast.error("Error fetching remaining seats.");
    }
  }

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
          onChange={handleSlotChange}
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
          value={formData.seats || ""}
          onChange={handleChange}
          placeholder="Enter the number of seats"
        />
      </div>

      {/* show a field to input name of the attendee (autocomplete if token is provided)  */}
      <div className="form-attendee">
        <InputField
          label="Name:"
          name="attendee"
          type="text"
          value={formData.attendee}
          onChange={handleChange}
          required={true}
        />
      </div>



      <div className="form-submit">
        <button type="submit">Book Meeting</button>
      </div>
    </form>
  );
};

export default BookingForm;
