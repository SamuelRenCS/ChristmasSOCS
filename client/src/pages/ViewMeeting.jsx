import React, { useEffect } from "react";
import Container from "../components/common/Container";
import TimeSlot from "../components/ViewMeeting/TimeSlot";
import CalendarDateInput from "../components/common/CalendarDateInput";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchMeeting,
  deleteMeeting,
  fetchMeetingAllSlots,
  fetchToken,
} from "../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ViewMeeting.module.css";

const ViewMeeting = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const [highlightedDates, setHighlightedDates] = useState([]);
  const [meetingDate, setMeetingDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [interval, setInterval] = useState(0);
  const [tokenPopup, setTokenPopup] = useState({
    show: false,
    token: "",
    meetingId: null,
  });

  const getEndTime = (startTime, interval, endTime) => {
    // start time format is HH:MM AM/PM (e.g. 12:00 PM)
    // first convert to 24-hour format
    const [time, period] = startTime.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    // add the interval to the start time
    minutes += interval;
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    hours = hours % 24;

    // return the end time in 12-hour format
    let endPeriod = "AM";
    if (hours >= 12) {
      endPeriod = "PM";
    }
    if (hours > 12) {
      hours -= 12;
    }
    if (hours === 0) {
      hours = 12;
    }

    // make sure the returned time is less than the end time

    return `${hours}:${minutes.toString().padStart(2, "0")} ${endPeriod}`;
  };

  useEffect(() => {
    // Fetch the meeting data on load
    const fetchMeetingDetails = async () => {
      try {
        // pass token as a string
        const response = await fetchMeeting(meetingId);
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
        setHighlightedDates(formattedDates);

        //keep the date part of the datetime
        const dateObj = new Date(startDate);

        // set the meeting date
        setMeetingDate(dateObj.toISOString().split("T")[0]);

        // set the location
        setLocation(location);

        // set the description
        setDescription(description);

        // set the start time
        const startTime = new Date(startDate).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        setStartTime(startTime);

        // set the end time
        const endTime = new Date(endDate).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        setEndTime(endTime);

        // set the interval
        setInterval(interval);
      } catch (error) {
        console.log("Error fetching meeting details", error);
      }
    };
    fetchMeetingDetails();
  }, [meetingId]);

  const [timeSlots, setTimeSlots] = useState([]);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // Track confirmation state

  const handleDateChange = async (date) => {
    try {
      const response = await fetchMeetingAllSlots(meetingId, date);

      const slots = response.data.slots.map((slot) => {
        return {
          time: `${slot.time} to ${getEndTime(slot.time, interval, endTime)}`,
          seatsReserved: slot.totalSeats - slot.seatsAvailable,
          isBooked: slot.isBooked,
        };
      });

      setTimeSlots(slots);

      setMeetingDate(date);
    } catch (error) {
      console.error("Error fetching slots for the date:", error);
      toast.error("Error fetching available slots.");
    }
  };

  const handleGetIDClick = async (meetingId) => {
    try {
      const response = await fetchToken(meetingId);
      //console.log("Response: ", response);
      const meetingToken = response.data.token;
      //console.log("Meeting token: ", meetingToken);

      setTokenPopup({ show: true, token: meetingToken });
    } catch (error) {
      console.error("Error fetching token:", error);
      toast.error("Failed to fetch meeting token.");
    }
  };

  const closePopup = () => {
    setTokenPopup({ show: false, token: "", meetingId: null });
  };

  const handleDelete = () => {
    if (isConfirmingDelete) {
      // If already confirming, delete the meeting
      setIsConfirmingDelete(false); // Reset the state after deletion
      deleteMeeting(meetingId);

      toast.success("Meeting deleted successfully");

      // Redirect to the dashboard
      navigate("/dashboard");
    } else {
      // If not confirming, show the confirmation state
      setIsConfirmingDelete(true);
    }
    setTimeout(() => {
      setIsConfirmingDelete(false);
    }, 3000);
  };

  const handleCancelDelete = () => {
    // Cancel deletion and reset the button
    setIsConfirmingDelete(false);
  };

  return (
    <main className={styles.main}>
      <div className={styles["top-section"]}>
        <div className={styles.title}>
          <h1>Monday Office Hours for COMP 307</h1>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles["left-section"]}>
          <Container
            padding={"20px"}
            height={"auto"}
            maxHeight={"700px"}
            overflow={"auto"}
          >
            <h3>Available Time Slots</h3>
            <CalendarDateInput
              label="Date:"
              onChange={handleDateChange}
              highlightedDates={highlightedDates}
            />
          </Container>
        </div>
        <div className={styles["right-section"]}>
          {/* Meeting Details */}
          <Container
            maxHeight={"200px"}
            height={"auto"}
            padding={"20px"}
            overflow={"auto"}
          >
            <h3>Location: {location}</h3>
            <p>
              <strong>Description:</strong> {description}
            </p>
            <p>
              From {startTime} to {endTime} EST
            </p>
          </Container>
          <Container
            maxHeight={"300px"}
            height={"auto"}
            padding={"20px"}
            overflow={"auto"}
          >
            {timeSlots.map((slot) => (
              <TimeSlot
                key={slot.time}
                time={slot.time}
                seatsReserved={slot.seatsReserved}
                isBooked={slot.isBooked}
              ></TimeSlot>
            ))}
          </Container>
          <div className={styles.share}>
            <button className={styles.shareButton} onClick={handleGetIDClick}>
              Share Token
            </button>
            <button
              className={styles.deleteButton}
              onClick={handleDelete}
              onBlur={handleCancelDelete}
            >
              {isConfirmingDelete ? "Confirm Delete" : "Delete Meeting"}
            </button>
          </div>
        </div>
      </div>

      {tokenPopup.show && (
        <div className={styles["token-popup"]}>
          <div className={styles["popup-content"]}>
            <h3>Meeting Token</h3>
            <p className={styles.tokenText}>
              Copy the token below to share the meeting
            </p>
            <p className={styles.token}>
              {typeof tokenPopup.token === "string"
                ? tokenPopup.token
                : JSON.stringify(tokenPopup.token)}
            </p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ViewMeeting;
