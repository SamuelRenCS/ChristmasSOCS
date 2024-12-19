import React, { useEffect } from "react";
import "../styles/ViewMeeting.css";
import Container from "../components/Container";
import TimeSlot from "../components/TimeSlot";
import CalendarDateInput from "../components/CalendarDateInput";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMeeting, deleteMeeting, fetchMeetingSlot } from "../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ViewMeeting = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const [highlightedDates, setHighlightedDates] = useState([]);
  const [meetingDate, setMeetingDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

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
        console.log("Meeting details", response.data);
        console.log("Formatted dates", formattedDates);
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
      } catch (error) {
        console.log("Error fetching meeting details", error);
      }
    };
    fetchMeetingDetails();
  }, [meetingId]);

  const [timeSlots, setTimeSlots] = useState([
    { time: "15:00 to 15:15", student: "Eric", isBooked: true },
  ]);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // Track confirmation state

  const handleDateChange = async (date) => {
    try {
      const response = await fetchMeetingSlot(meetingId, date);
      console.log("Meeting slots:", response.data);
    } catch (error) {
      console.error("Error fetching slots for the date:", error);
      toast.error("Error fetching available slots.");
    }
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
    <main className="main">
      <div className="top-section">
        <div className="title">
          <h1>Monday Office Hours for COMP 307</h1>
        </div>
      </div>
      <div className="content">
        <div className="left-section">
          <Container
            padding={"20px"}
            height={"auto"}
            maxHeight={"700px"}
            overflow={"auto"}
          >
            <h3>Available Time Slots</h3>
            <CalendarDateInput
              label="Date:"
              value={meetingDate}
              onChange={handleDateChange}
              highlightedDates={highlightedDates}
            />
          </Container>
        </div>
        <div className="right-section">
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
                student={slot.student}
                isBooked={slot.isBooked}
              ></TimeSlot>
            ))}
          </Container>
          <div className="share">
            <button className="shareButton">Share Meeting</button>
            <button
              className="deleteButton"
              onClick={handleDelete}
              onBlur={handleCancelDelete}
            >
              {isConfirmingDelete ? "Confirm Delete" : "Delete Meeting"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ViewMeeting;
