import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Input from "../Input";
import Button from "../Button";
import styles from "./RequestForm.module.css";

const RequestForm = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    host: "Anonymous", // Default host
    date: new Date(),
    startTime: "",
    endTime: "",
    numberOfSlots: 1,
    location: "",
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle calendar date change
  const handleDateChange = (date) => {
    setFormData((prevState) => ({
      ...prevState,
      date,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log("Form submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Host"
        name="host"
        value={formData.host}
        onChange={handleInputChange}
        formType="request"
      />

      <div className={styles.calendarContainer}>
        <label style={{ display: "block", marginBottom: "10px" }}>
          Select Date
        </label>
        <Calendar
          onChange={handleDateChange}
          value={formData.date}
          minDate={new Date()} // Prevent selecting past dates
        />
      </div>

      <div className={styles.timeInputContainer}>
        <Input
          label="Start Time"
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleInputChange}
          formType="request"
        />
        <Input
          label="End Time"
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleInputChange}
          formType="request"
        />
      </div>

      <Input
        label="Number of Slots"
        type="number"
        name="numberOfSlots"
        value={formData.numberOfSlots}
        onChange={handleInputChange}
        min="1"
        formType="request"
      />

      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleInputChange}
        formType="request"
        placeholder="Enter location"
      />

      <Button type="submit" text="Submit Request" onClick={handleSubmit} />
    </form>
  );
};

export default RequestForm;
