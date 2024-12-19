import React, { useEffect } from "react";
import "../styles/ViewMeeting.css";
import Container from "../components/Container";
import TimeSlot from "../components/TimeSlot";
import CalendarDateInput from "../components/CalendarDateInput";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMeetingWithID, deleteMeeting } from "../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ViewMeeting = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  useEffect(() => {
    // Fetch the meeting data on load
    const fetchMeetingDetails = async () => {
      try {
        // pass token as a string
        const response = await fetchMeetingWithID(meetingId);
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
          dates,
        } = response.data;
        console.log("Meeting details", response.data);
      } catch (error) {
        console.log("Error fetching meeting details", error);
      }
    };
    fetchMeetingDetails();
  }, [meetingId]);

  const [timeSlots, setTimeSlots] = useState([
    { time: "15:00 to 15:15", student: "Eric", isBooked: true },
    { time: "15:15 to 15:30", student: null, isBooked: false },
    { time: "15:30 to 15:45", student: "Samuel", isBooked: true },
    { time: "15:45 to 16:00", student: "Daniel", isBooked: true },
    { time: "16:00 to 16:15", student: "Shotaro", isBooked: true },
    { time: "16:15 to 16:30", student: null, isBooked: false },
    { time: "16:45 to 17:00", student: null, isBooked: false },
  ]);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // Track confirmation state

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
              value="2021-11-25"
              onChange={() => {}}
              highlightedDates={["2021-11-25"]}
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
            <h3>Location: ENGMC 327</h3>
            <p>
              <strong>Description:</strong> Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Phasellus fringilla, purus placerat
              sollicitudin interdum, neque lacus consequat magna.
            </p>
            <p>From 15:00 to 18:30 EST</p>
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
