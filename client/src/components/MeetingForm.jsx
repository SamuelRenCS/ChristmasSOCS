import React, { useState } from "react";
import { createMeeting } from "../api/api";
import CalendarDateInput from "./CalendarDateInput";
import InputField from "./InputField";
import SelectField from "./SelectField";
import TextareaField from "./TextAreaField";
import './MeetingForm.css';

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const MeetingForm = () => {

  const navigate = useNavigate();
  const { token } = useAuth(); // get the token from AuthContext

  const [formData, setFormData] = useState({

    // Retrieve the host's name from the token
    host: token ? token.user : "", //TODO: ChECK THIS

    title: "",
    meetingDate: "",
    startTime: "",
    endTime: "",
    repeat: "None",
    interval: "15 min",
    seats: "",
    location: "",
    description: "",
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
      const response = await createMeeting(formData);

      if (!response) {
        toast.error("Failed to create the meeting.");
        return;
      }

      toast.success("Meeting created successfully");
      console.log(formData);

      // redirect to dashboard after successful meeting creation with some delay
      setTimeout(() => navigate("/dashboard"), 200);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Meeting creation failed";
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="meeting-form">
      <div className="form-title">
        <InputField
          label="Meeting Title:"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required={true}
        />
      </div>

      <div className="form-date">
        <CalendarDateInput
          label="Date:"
          value={formData.meetingDate}
          onChange={handleDateChange}
        />
      </div>

      <div className="form-time">
        <InputField
          label="Start Time:"
          name="startTime"
          type="time"
          value={formData.startTime}
          onChange={handleChange}
          required={true}
        />
      </div>

      <div className="form-time">
        <InputField
          label="End Time:"
          name="endTime"
          type="time"
          value={formData.endTime}
          onChange={handleChange}
          required={true}
        />
      </div>

      <div className="form-repeat">
        <SelectField
          label="Repeat:"
          name="repeat"
          value={formData.repeat}
          onChange={handleChange}
          options={["None", "Daily", "Weekly"]}
        />
      </div>

      <div className="form-interval">
        <SelectField
          label="Interval:"
          name="interval"
          value={formData.interval}
          onChange={handleChange}
          options={["15 min", "30 min", "1 hour"]}
        />
      </div>

      <div className="form-seats">
        <InputField
            label="Seats Available:"
            name="seats"
            type="number"
            value={formData.seats}
            onChange={handleChange}
            required={true}
            min="1"
        />
      </div>

      <div className="form-location">
        <InputField
          label="Location:"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          required={true}
        />
      </div>

      <div className="form-description">
        <TextareaField
          label="Description (Optional):"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="form-submit">
        <button type="submit">Create Meeting</button>
      </div>
    </form>
  );
};

export default MeetingForm;