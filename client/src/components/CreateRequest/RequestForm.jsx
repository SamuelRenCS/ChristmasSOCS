import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import InputField from "../InputField";
import Button from "../Button";
import styles from "./RequestForm.module.css";

const RequestForm = () => {
  // Helper function to format date and time
  const formatDate = (date) => date.toISOString().split("T")[0];
  const formatTime = (date) =>
    date.toTimeString().split(":").slice(0, 2).join(":");

  // Set initial values for date and time
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // State for form fields
  const [formData, setFormData] = useState({
    host: "Anonymous", // Default host
    title: "",
    date: formatDate(now),
    startTime: formatTime(now),
    endTime: formatTime(oneHourLater),
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const startDateTime = new Date(
      `${formData.date}T${formData.startTime}`
    ).toISOString();
    const endDateTime = new Date(
      `${formData.date}T${formData.endTime}`
    ).toISOString();

    const formattedData = {
      requester: "",
      host: formData.host,
      title: formData.title,
      location: formData.location,
      startDate: startDateTime,
      endDate: endDateTime,
      numberOfSlots: formData.numberOfSlots,
    };

    console.log("Form submitted:", formattedData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <InputField
        label="Host"
        name="host"
        value={formData.host}
        onChange={handleInputChange}
        readOnly
      />

      <InputField
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="Enter title"
        required={true}
      />

      <InputField
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleInputChange}
        placeholder="Enter location"
        required={true}
      />

      <InputField
        label="Select Date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleInputChange}
        required={true}
      />

      <div className={styles.timeInputContainer}>
        <InputField
          label="Start Time"
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleInputChange}
          required={true}
        />
        <InputField
          label="End Time"
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleInputChange}
          required={true}
        />
      </div>

      <InputField
        label="Number of Slots"
        type="number"
        name="numberOfSlots"
        value={formData.numberOfSlots}
        onChange={handleInputChange}
        min="1"
        required={true}
      />

      <Button type="submit" text="Submit Request" onClick={handleSubmit} />
    </form>
  );
};

export default RequestForm;
