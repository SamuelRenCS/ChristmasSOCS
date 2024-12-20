import React, { useState } from "react";
import { createMeeting } from "../../api/api";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import TextAreaField from "../common/TextAreaField";
import styles from "./MeetingForm.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../common/Button";
import WeekdaySelector from "./WeekdaySelector";
import { AlignCenter } from "lucide-react";

const MeetingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
  const oneHourLater = new Date(fiveMinutesLater.getTime() + 60 * 60 * 1000);

  const [formData, setFormData] = useState({
    title: "",
    host: user ? user.id : "",
    startDate: formatDate(fiveMinutesLater), // Current date
    startTime: formatTime(fiveMinutesLater), // Current time
    endDate: formatDate(oneHourLater), // Same date as startDate
    endTime: formatTime(oneHourLater), // One hour after current time
    location: "",
    description: "",
    interval: "15 min",
    seatsPerSlot: "",
    repeat: "None",
    repeatDays: [],
    endRepeatDate: formatDate(oneHourLater), // same as endDate
    endRepeatTime: `23:59`, // default to midnight
    //token: "UNSET",
  });

  const [enableRepeat, setEnableRepeat] = useState(
    formData.startDate === formData.endDate
  );
  const [repeatValue, setRepeat] = useState("None");
  const [tokenPopup, setTokenPopup] = useState({ show: false, token: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };

      // If startDate changes and endDate is earlier, update endDate as well
      if (name === "startDate" && updatedFormData.endDate < value) {
        updatedFormData.endDate = value;
      }

      // make sure the end time is after the start time
      if (
        name === "startTime" &&
        updatedFormData.endTime < value &&
        updatedFormData.startDate === updatedFormData.endDate
      ) {
        updatedFormData.endTime = value;
      } else if (
        name === "endTime" &&
        updatedFormData.startDate === updatedFormData.endDate &&
        updatedFormData.startTime > value
      ) {
        // if the user tries to set the end time before the start time, set the end time to the start time
        updatedFormData.endTime = updatedFormData.startTime;
      }

      // make sure the start date is not before now
      if (name === "startDate" && value < formatDate(now)) {
        updatedFormData.startDate = formatDate(now);
      }

      // make sure the end date is not before the start date
      if (
        name === "endDate" &&
        new Date(value) < new Date(updatedFormData.startDate)
      ) {
        updatedFormData.endDate = updatedFormData.startDate;
      }

      // case where startDate changes to the same date as endDate, but the end time becomes earlier than the start time
      if (
        name === "startDate" &&
        updatedFormData.startDate === updatedFormData.endDate &&
        updatedFormData.startTime > updatedFormData.endTime
      ) {
        updatedFormData.endTime = updatedFormData.startTime;
      }

      // If endRepeatDate is earlier than endDate, update it as well
      if (enableRepeat) {
        if (
          (name === "startDate" || name === "endDate") &&
          updatedFormData.endRepeatDate < value
        ) {
          updatedFormData.endRepeatDate = value;
        }
      }

      // if the startDate and endDate are the same, enable repeat
      if (updatedFormData.startDate === updatedFormData.endDate) {
        setEnableRepeat(true);
      } else {
        setEnableRepeat(false);
        // if the repeat value is not None, set it to None
        updatedFormData.repeat = "None";
        setRepeat("None");
        updatedFormData.repeatDays = [];
      }

      return updatedFormData;
    });
  };

  const handleRepeatChange = (e) => {
    const { name, value } = e.target;
    const startDate = new Date(`${formData.startDate}T${formData.startTime}`);
    const meetingDay = startDate.getDay();

    setFormData({
      ...formData,
      [name]: value,
    });
    setRepeat(value);

    // if repeat is activated, set repeatDays to include the meeting day
    if (value === "Weekly") {
      setFormData((prev) => {
        return {
          ...prev,
          repeatDays: [meetingDay], // Force the meeting day to be selected
          endRepeatDate: prev.endDate,
        };
      });
    } else if (value === "None") {
      // If repeat is disabled, clear repeatDays
      setFormData((prev) => ({
        ...prev,
        repeatDays: [],
      }));
    } else {
      // If repeat is Daily, set repeatDays to include all days
      setFormData((prev) => {
        return {
          ...prev,
          repeatDays: [0, 1, 2, 3, 4, 5, 6], // All days of the week
          endRepeatDate: prev.endDate,
        };
      });
    }
  };

  const handleDayToggle = (dayId) => {
    setFormData((prev) => {
      const currentDays = prev.repeatDays || [];
      const updatedDays = currentDays.includes(dayId)
        ? currentDays.filter((day) => day !== dayId)
        : [...currentDays, dayId];

      return { ...prev, repeatDays: updatedDays };
    });
  };

  const validateForm = () => {
    if (!formData.title) {
      return "Title is required";
    }

    if (!formData.location) {
      return "Location is required";
    }

    if (formData.startDate === formData.endDate) {
      if (formData.startTime >= formData.endTime) {
        return "End time must be after start time";
      }
    }

    if (formData.startDate > formData.endDate) {
      return "End date must be after start date";
    }

    if (
      formData.repeat !== "None" &&
      formData.endRepeatDate < formData.endDate
    ) {
      return "End repeat date must be after end date";
    }

    if (formData.seatsPerSlot < 1) {
      return "Seats per slot must be at least 1";
    }

    return "Valid";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate form
    const validationStatus = validateForm();

    if (validationStatus !== "Valid") {
      toast.error(validationStatus);
      return;
    }

    // Map interval string to numeric value
    const intervalMapping = {
      "10 min": 10,
      "15 min": 15,
      "20 min": 20,
      "30 min": 30,
      "1 hour": 60,
      None:
        (new Date(formData.endDate + "T" + formData.endTime) -
          new Date(formData.startDate + "T" + formData.startTime)) /
        60000,
    };

    // Create dates using the local timezone
    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`
    ).toISOString();
    const endDateTime = new Date(
      `${formData.endDate}T${formData.endTime}`
    ).toISOString();
    const endRepeatDate = new Date(
      `${formData.endRepeatDate}T${formData.endRepeatTime}`
    ).toISOString();

    const formattedRepeatDays = [];

    // compute a list of dates for weekly repeating meetings
    for (const dayNumber of formData.repeatDays) {
      const startDate = new Date(startDateTime);
      const dayDiff = (dayNumber - startDate.getDay() + 7) % 7;
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + dayDiff);
      formattedRepeatDays.push(dayDate.toISOString());
    }

    const formattedData = {
      title: formData.title,
      host: formData.host,
      startDate: startDateTime,
      endDate: endDateTime,
      location: formData.location,
      description: formData.description,
      interval: intervalMapping[formData.interval], // Map to numeric value
      seatsPerSlot: formData.seatsPerSlot,
      repeat: formData.repeat,
      endRepeatDate: endRepeatDate,
      repeatDays: formattedRepeatDays,
    };

    console.log("Formatted data:", formattedData);

    try {
      const response = await createMeeting(formattedData);

      if (!response) {
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

  const closePopup = () => {
    setTokenPopup({ show: false, token: "" });
    navigate("/dashboard"); // Navigate to the dashboard
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles["meeting-form"]}>
        <div className={styles.sectionContainer}>
          <InputField
            label="Meeting Title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required={true}
          />

          <InputField
            label="Location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            required={true}
          />

          <div className={styles.dateInput}>
            <InputField
              label="Starts"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required={true}
              min={formatDate(now)}
            />

            <InputField
              label="hidden"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              required={true}
            />
          </div>

          <div className={styles.dateInput}>
            <InputField
              label="Ends"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required={true}
              min={formData.startDate}
            />
            <InputField
              label="hidden"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              required={true}
            />
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <div className={styles.selectors}>
            <SelectField
              label="Repeat"
              name="repeat"
              value={formData.repeat}
              onChange={handleRepeatChange}
              options={["None", "Daily", "Weekly"]}
              hidden={!enableRepeat}
            />

            <SelectField
              label="Interval"
              name="interval"
              value={formData.interval}
              onChange={handleChange}
              options={[
                "None",
                "10 min",
                "15 min",
                "20 min",
                "30 min",
                "1 hour",
              ]}
            />
          </div>

          {/* Weekly Day Selection */}
          <WeekdaySelector
            repeatValue={repeatValue}
            selectedDays={formData.repeatDays}
            onDayToggle={handleDayToggle}
            meetingDay={new Date(
              `${formData.startDate}T${formData.startTime}`
            ).getDay()} // Pass the meeting day
          />

          <div
            className={`${styles.dateInput} ${
              repeatValue !== "None" ? "" : styles.hideInput
            }`}
          >
            <InputField
              label="End Repeat"
              name="endRepeatDate"
              type="date"
              value={formData.endRepeatDate}
              onChange={handleChange}
              required={repeatValue !== "None"}
              min={formData.endDate}
            />
          </div>

          <div className={styles.dateInput}>
            <InputField
              label="Seats per slot"
              name="seatsPerSlot"
              type="number"
              value={formData.seatsPerSlot}
              onChange={handleChange}
              required={true}
              placeholder="1"
              min="1"
            />
          </div>

          <TextAreaField
            label="Description (Optional)"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description here..."
          />
          <div className={styles.buttonContainer}>
            <Button text="Create Meeting" onClick={handleSubmit} />
          </div>
        </div>
      </form>
      {tokenPopup.show && (
        <div className={styles["token-popup"]}>
          <div className={styles["popup-content"]}>
            <h3>Meeting Token</h3>
            <p className={styles.tokenText}>
              Copy the token below to share the meeting
            </p>
            <p className={styles.token}>{tokenPopup.token}</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default MeetingForm;
