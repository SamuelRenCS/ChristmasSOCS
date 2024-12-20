import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import InputField from "../InputField";
import Button from "../Button";
import styles from "./RequestForm.module.css";
import { fetchUser, createRequest } from "../../api/api";
import ErrorPage from "../../pages/ErrorPage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import TextAreaField from "../TextAreaField";

const RequestForm = ({ hostID }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isValidHost, setIsValidHost] = useState(true);

  // Helper function to format date and time
  const formatDate = (date) => date.toISOString().split("T")[0];
  const formatTime = (date) =>
    date.toTimeString().split(":").slice(0, 2).join(":");

  // Set initial values for date and time
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // State for form fields
  const [formData, setFormData] = useState({
    host: "",
    title: "",
    date: formatDate(now),
    startTime: formatTime(now),
    endTime: formatTime(oneHourLater),
    numberOfSeats: 1,
    location: "",
    description: "",
  });

  // Validation function
  const validateForm = () => {
    // Title validation
    if (!formData.title.trim()) {
      return "Title is required";
    }

    // Location validation
    if (!formData.location.trim()) {
      return "Location is required";
    }

    // Date validation
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("Selected date:", selectedDate);
    console.log("Today:", today);

    if (selectedDate < today) {
      return "Date cannot be in the past";
    }

    // Time validation
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    const currentDateTime = new Date();

    if (startDateTime < currentDateTime) {
      return "Start time cannot be in the past";
    }

    if (endDateTime <= startDateTime) {
      return "End time must be after start time";
    }

    // Number of seats validation
    const seats = parseInt(formData.numberOfSeats);
    if (isNaN(seats) || seats < 1) {
      return "Number of seats must be at least 1";
    }

    return "Valid";
  };

  // start by getting host info with the hostID
  useEffect(() => {
    const fetchHost = async () => {
      try {
        const response = await fetchUser(hostID);

        setFormData((prevState) => ({
          ...prevState,
          host: response.firstName + " " + response.lastName,
        }));
      } catch (error) {
        // Not a valid host ID, display error page
        setIsValidHost(false);
      }
    };

    fetchHost();
  }, [hostID]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationStatus = validateForm();

    if (validationStatus !== "Valid") {
      toast.error(validationStatus);
      return;
    }

    const startDateTime = new Date(
      `${formData.date}T${formData.startTime}`
    ).toISOString();
    const endDateTime = new Date(
      `${formData.date}T${formData.endTime}`
    ).toISOString();

    const formattedData = {
      requester: user.id,
      host: hostID,
      title: formData.title,
      location: formData.location,
      startDate: startDateTime,
      endDate: endDateTime,
      numberOfSeats: formData.numberOfSeats,
      description: formData.description,
    };

    try {
      const response = await createRequest(formattedData);
      toast.success(response.message);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // If host is not valid, render the error page
  if (!isValidHost) {
    return (
      <ErrorPage
        message="The host you're trying to request from does not exist."
        title="Host Not Found"
        buttonText="Back to Dashboard"
        onButtonClick={() => {
          // Navigate to hosts list or wherever appropriate
          navigate("/dashboard");
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.container}>
        <InputField label="Host" name="host" value={formData.host} readOnly />

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
      </div>
      <div className={styles.container}>
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
          label="Number of Seats"
          type="number"
          name="numberOfSeats"
          value={formData.numberOfSeats}
          onChange={handleInputChange}
          min="1"
          required={true}
        />

        <TextAreaField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter description"
        />

        <Button type="submit" text="Submit Request" onClick={handleSubmit} />
      </div>
    </form>
  );
};

export default RequestForm;
