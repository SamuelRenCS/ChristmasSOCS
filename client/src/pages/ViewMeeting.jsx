import React from "react";
import "../styles/ViewMeeting.css";
import Button from "../components/Button";
import Container from "../components/Container";
import TimeSlot from "../components/TimeSlot";

const ViewMeeting = () => {
  const timeSlots = [
    { time: "15:00 to 15:15", student: "Eric", isBooked: true },
    { time: "15:15 to 15:30", student: null, isBooked: false },
    { time: "15:30 to 15:45", student: "Samuel", isBooked: true },
    { time: "15:45 to 16:00", student: "Daniel", isBooked: true },
    { time: "16:00 to 16:15", student: "Shotaro", isBooked: true },
    { time: "16:15 to 16:30", student: null, isBooked: false },
    { time: "16:45 to 17:00", student: null, isBooked: false },
  ];
  return (
    <main className="main">
      <div className="top-section">
        <div className="title">
          <h1>Monday Office Hours for COMP 307</h1>
          <h1>Week of November 25</h1>
        </div>
        <div className="share">
          <Button type={"submit"} text={"Share URL"}></Button>
        </div>
      </div>
      <div className="content">
        <div className="left-section">
          {/* Time Slots */}
          <Container height={"75%"} padding={"20px"} overflow={"auto"}>
            {timeSlots.map((slot, index) => (
              <TimeSlot
                time={slot.time}
                student={slot.student}
                isBooked={slot.isBooked}
              ></TimeSlot>
            ))}
          </Container>
        </div>
        <div className="right-section">
          {/* Meeting Details */}
          <Container height={"60%"} padding={"20px"} overflow={"auto"}>
            <h3>Location: ENGMC 327</h3>
            <p>
              <strong>Description:</strong> Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Phasellus fringilla, purus placerat
              sollicitudin interdum, neque lacus consequat magna.
            </p>
            <p>From 15:00 to 18:30 EST</p>
          </Container>
          <button className="delete">Delete Meeting</button>
        </div>
      </div>
    </main>
  );
};

export default ViewMeeting;
