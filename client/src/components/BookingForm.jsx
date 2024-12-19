import React, { useState } from "react";
import { useEffect } from "react";

import { createBooking } from "../api/api";
import { fetchMeeting } from "../api/api"; // onload to get the general meeting details
import { fetchMeetingSlot } from "../api/api";
import { fetchSeats } from "../api/api";

import CalendarDateInput from "./CalendarDateInput";
import InputField from "./InputField";
import SelectField from "./SelectField";
import Button from "./Button";
import ErrorPage from "../pages/ErrorPage";
import styles from "./BookingForm.module.css";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BookingForm = ({ token }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetingID, setMeetingID] = useState("");

  const [availableSlots, setAvailableSlots] = useState([]);
  const [maxSeats, setMaxSeats] = useState(0);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [hostID, setHostID] = useState("");
  const [tokenPopup, setTokenPopup] = useState({ show: false, token: "" });

  const [isValidToken, setIsValidToken] = useState(true);

  const [formData, setFormData] = useState({
    // Retrieve the first and last name from the user context
    attendee: user ? `${user.firstName} ${user.lastName}` : "",
    meetingID: "",
    userID: user ? `${user.id}` : "",
    meetingDate: "",
    timeSlot: "",
    seats: "",
  });

  useEffect(() => {
    // Fetch the meeting data on load
    const fetchMeetingDetails = async () => {
      try {
        // pass token as a string
        const response = await fetchMeeting(token);
        // res.status(200).json({ data: { title, host, date, startTime, endTime, location, description, interval, seatsPerSlot, repeat, endDate, dates } });
        const {
          title,
          host,
          startDate,
          endDate,
          location,
          description,
          interval,
          seatsPerSlot,
          repeat,
          endRepeatDate,
          formattedDates,
          meetingID,
        } = response.data;

        setMeetingID(meetingID);
        console.log("Meeting details:", response.data);
        console.log("Formatted dates:", formattedDates);
        setHighlightedDates(formattedDates);

        console.log("Host:", host);

        // set the host
        setHostID(host._id);

        //keep the date part of the datetime
        const dateObj = new Date(startDate);

        // Prepopulate form fields
        setFormData({
          attendee: user ? `${user.firstName} ${user.lastName}` : "",
          meetingID: meetingID,
          meetingDate: dateObj.toISOString().split("T")[0],
          userID: user ? `${user.id}` : "",
        });
      } catch (error) {
        setIsValidToken(false);
      }
    };

    fetchMeetingDetails();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value || "" });
  };

  const handleDateChange = async (date) => {
    try {
      const response = await fetchMeetingSlot(meetingID, date);
      const remainingSlots = response.data.finalSlots;
      console.log("Available slots:", remainingSlots);
      setAvailableSlots(remainingSlots);

      // Directly use the date passed to the function instead of relying on state
      const firstSlot = remainingSlots[0];

      // Update form data in one go
      setFormData((prevData) => ({
        ...prevData,
        meetingDate: date,
        timeSlot: firstSlot || "",
      }));

      // Fetch seats for the first slot
      if (firstSlot) {
        const seatsResponse = await fetchSeats(meetingID, date, firstSlot);
        const remainingSeats = seatsResponse.data.seats;
        console.log("Remaining seats:", remainingSeats);
        setMaxSeats(remainingSeats);
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
      const response = await fetchSeats(
        meetingID,
        formData.meetingDate,
        selectedSlot
      );
      const remainingSeats = response.data.seats;
      console.log("Remaining seats:", remainingSeats);
      setMaxSeats(remainingSeats);
    } catch (error) {
      console.error("Error fetching remaining seats for the slot:", error);
      toast.error("Error fetching remaining seats.");
    }
  };

  // validate form
  const validateForm = () => {
    if (!formData.attendee) {
      return "Name is required";
    }

    if (!formData.meetingDate) {
      return "Date is required";
    }

    if (!formData.timeSlot) {
      return "Time slot is required";
    }

    if (!formData.seats || formData.seats < 1) {
      return "Number of seats is required and at least 1";
    }

    if (formData.seats > maxSeats) {
      return "Number of seats exceeds the remaining seats";
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

    try {
      const response = await createBooking(formData);
      if (!response) {
        toast.error("Failed to create the booking.");
        return;
      }

      const message = response.data;
      toast.success(message);

      // Redirect to the dashboard after successful booking after 2 seconds

      setTokenPopup({ show: true, msg: "Booking created successfully!" });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Booking creation failed";
      toast.error(errorMessage);
    }
  };

  const closePopup = () => {
    setTokenPopup({ show: false, token: "" });
    navigate("/dashboard"); // Navigate to the dashboard
  };

  const handleRequestRedirection = () => {
    navigate(`/requests/new/${hostID}`);
  };

  // return an error page if the token is invalid
  if (!isValidToken) {
    return (
      <ErrorPage
        message="The meeting you are trying to book does not exit. Please make sure the token is correct and try again."
        title="Meeting Not Found"
        buttonText="Back to Home"
        onButtonClick={() => {
          // Navigate to hosts list or wherever appropriate
          navigate("/");
        }}
      />
    );
  }

  return (
    <>
      <form className={styles.bookingForm}>
        <div className={styles.leftColumn}>
          <div className={styles.formDate}>
            <CalendarDateInput
              label="Date:"
              value={formData.meetingDate}
              onChange={handleDateChange}
              highlightedDates={highlightedDates}
            />
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.formAttendee}>
            <InputField
              label="Name:"
              name="attendee"
              type="text"
              value={formData.attendee}
              onChange={handleChange}
              required={true}
            />
          </div>
          <div className={styles.formSlot}>
            <SelectField
              label="Time slot:"
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleSlotChange}
              options={availableSlots}
              width="125px"
            />
          </div>

          <div className={styles.formSeats}>
            <InputField
              label="Number of seats:"
              name="seats"
              type="number"
              min="1"
              max={maxSeats}
              value={formData.seats || ""}
              onChange={handleChange}
              placeholder="1"
            />
          </div>

          <div className={styles.formActions}>
            <Button type="submit" text="Book now" onClick={handleSubmit} />
          </div>
        </div>
      </form>
      <div className={styles.requestContainer}>
        <p className={styles.text}>Can't find a suitable time slot?</p>
        <Button
          text="Request a new meeting"
          onClick={handleRequestRedirection}
          danger={true}
        />
      </div>
      {tokenPopup.show && (
        <div className={styles["token-popup"]}>
          <div className={styles["popup-content"]}>
            <p>{tokenPopup.msg}</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingForm;
