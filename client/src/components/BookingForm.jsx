import React, { useState } from "react";
import CalendarDateInput from "./CalendarDateInput";
import InputField from "./InputField";
import SelectField from "./SelectField";
import TextareaField from "./TextAreaField";
import './BookingForm.css';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    meetingDate: "",
    timeSlot: "",
    seats: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      meetingDate: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //const response = await axios.post("http://localhost:5000/api/meetings", formData);
      alert("Booking created successfully!");
      console.log(formData);
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create the booking.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">

      <div className="form-date">
        <CalendarDateInput
          label="Date:"
          value={formData.meetingDate}
          onChange={handleDateChange}
        />
      </div>

      <div className="form-slot">
        <SelectField
          label="Time slot:"
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleChange}
          options={["02:30 PM", "02:45 PM", "03:00 PM", "03:15 PM"]}
        />
      </div>

      <div className="form-seats">
        <InputField
          label="Number of seats:"
          name="seats"
          type="number"
          min="1"
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