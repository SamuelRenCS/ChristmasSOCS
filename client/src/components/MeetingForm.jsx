import React, { useState } from "react";
import { createMeeting } from "../api/api";
import CalendarDateDblInput from "./CalendarDateDblInput";
import InputField from "./InputField";
import SelectField from "./SelectField";
import TextareaField from "./TextAreaField";
import "./MeetingForm.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const MeetingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    host: user ? user.id : "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    interval: "15 min",
    seatsPerSlot: "",
    repeat: "None",
    endDate: "",
    //token: "UNSET",
  });

  const [tokenPopup, setTokenPopup] = useState({ show: false, token: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date: date });
  };

  const handleEndDateChange = (date) => {
    setFormData({ ...formData, endDate: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Map interval string to numeric value
    const intervalMapping = {
      "10 min": 10,
      "15 min": 15,
      "20 min": 20,
      "30 min": 30,
      "1 hour": 60,
    };

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    const formattedData = {
      ...formData,
      startTime: startDateTime,
      endTime: endDateTime,
      interval: intervalMapping[formData.interval], // Map to numeric value
    };

    try {
      const response = await createMeeting(formattedData);

      if (!response) {
        //console.log(response);

        toast.error("Error creating meeting");
        return;
      }

      setTokenPopup({ show: true, token: response.msgToken });
      toast.success("Meeting created successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Meeting creation failed";
      toast.error(errorMessage);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(tokenPopup.token).then(() => {
      toast.info("Token copied to clipboard");
    });
  };

  const closePopup = () => {
    setTokenPopup({ show: false, token: "" });
    navigate("/dashboard"); // Navigate to the dashboard
  };

  return (
    <>
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
          <CalendarDateDblInput
            label="Date:"
            value={formData.date}
            onChange={handleDateChange}
            showEndDate={formData.repeat !== "None"} // Show end date field if repeat is selected
            endDate={formData.endDate}
            onEndDateChange={handleEndDateChange}
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
            options={["10 min", "15 min", "20 min", "30 min", "1 hour"]}
          />
        </div>

        <div className="form-seats">
          <InputField
            label="Seats Available:"
            name="seatsPerSlot"
            type="number"
            value={formData.seatsPerSlot}
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

      {tokenPopup.show && (
        <div className="token-popup">
          <div className="popup-content">
            <h3>Meeting Token</h3>
            <p>{tokenPopup.token}</p>
            <button onClick={handleCopyToken}>Copy Token</button>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default MeetingForm;
