import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "../../styles/HomePage.module.css";

const HomePage = () => {
  const [meetings, setMeetings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredMeetings, setFilteredMeetings] = useState([]);

  // Mock meetings data (replace this with API call to fetch meetings)
  useEffect(() => {
    const fetchMeetings = async () => {
      const mockData = [
        {
          title: "Team Sync",
          date: "2024-12-19",
          time: "10:00 AM",
          location: "Conference Room A",
        },
        {
          title: "Client Meeting",
          date: "2024-12-18",
          time: "2:00 PM",
          location: "Zoom",
        },
        {
          title: "Project Review",
          date: "2024-12-18",
          time: "4:00 PM",
          location: "Office Room 5",
        },
      ];
      setMeetings(mockData);
    };

    fetchMeetings();
  }, []);

  // Filter meetings for the selected date
  useEffect(() => {
    const selectedDateString = selectedDate.toISOString().split("T")[0];
    const todayMeetings = meetings.filter(
      (meeting) => meeting.date === selectedDateString
    );
    setFilteredMeetings(todayMeetings);
  }, [selectedDate, meetings]);

  // Function to handle date selection
  const onDateChange = (date) => {
    setSelectedDate(date);
  };

  // Highlight dates with meetings
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateString = date.toISOString().split("T")[0];
      if (meetings.some((meeting) => meeting.date === dateString)) {
        return styles.highlightDate;
      }
    }
    return null;
  };

  return (
    <div className={styles.dashboardSection}>
      <h1>Welcome, User!</h1>
      <div className={styles.mainContent}>
          <div className={styles.calendarSection}>
            <div className={styles.calendarHeader}>
              <h2>Your Meetings</h2>
              <p>Select a date to view your meetings.</p>
            </div>
            <Calendar
              onChange={onDateChange}
              value={selectedDate}
              tileClassName={tileClassName}
              className={styles.customCalendar}
            />
          </div>

          <div className={styles.meetingsSection}>
            <h2>Meetings Times {selectedDate.toDateString()}</h2>
            {filteredMeetings.length > 0 ? (
              <ul>
                {filteredMeetings.map((meeting, index) => (
                  <li key={index} className={styles.meetingItem}>
                    <b>{meeting.time}</b> <br />
                    <span>Subject: {meeting.title}</span><br />
                    <span>Student: {meeting.student}</span><br />
                    <span>Location: {meeting.location}</span><br />
                    <span>Duration: {meeting.duration}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No meetings scheduled.</p>
            )}
          </div>
        </div>
        

    </div>

  );
};

export default HomePage;
