import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import InputField from "../common/InputField";
import Button from "../common/Button";
import styles from "./RequestForm.module.css";
import { fetchUser, createRequest } from "../../api/api";
import ErrorPage from "../../pages/ErrorPage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import TextAreaField from "../common/TextAreaField";

const RequestForm = ({ hostID }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isValidHost, setIsValidHost] = useState(true);

  // Helper function to format date and time
  const formatDate = (date) => date.toLocaleDateString("en-CA");
  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });

  // Set initial values for date and time
  const now = new Date();
  const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // State for form fields
  const [formData, setFormData] = useState({
    host: "",
    title: "",
    date: formatDate(fiveMinutesLater),
    startTime: formatTime(fiveMinutesLater),
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

    if (!formData.date.trim()) {
      return "Date is required";
    }

    // Date validation
    if (formData.date < formatDate(now)) {
      return "Date cannot be in the past";
    }

    // Time validation;
    const currentDateTime = `${formatDate(now)}T${formatTime(now)}`;
    const startDateTime = `${formData.date}T${formData.startTime}`;
    const endDateTime = `${formData.date}T${formData.endTime}`;

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
    setFormData((prevState) => {
      const updatedFormState = { ...prevState, [name]: value };

      // If the start time is after the end time, update the end time to be the same as the start time
      if (name === "startTime" && updatedFormState.endTime < value) {
        updatedFormState.endTime = value;
      }

      // If the end time is before the start time, do not allow the change
      if (name === "endTime" && updatedFormState.startTime > value) {
        updatedFormState.endTime = updatedFormState.startTime;
      }

      // If the date is in the past, update the date to be the current date
      if (name === "date" && value < formatDate(now)) {
        updatedFormState.date = formatDate(now);
      }

      return updatedFormState;
    });
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
          min={formatDate(now)}
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
