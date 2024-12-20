import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "../../styles/HomePage.module.css";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

import { fetchAllUserEvents } from "../../api/api";

const HomePage = () => {
  const [meetings, setMeetings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const { user } = useAuth();
  const userId = user ? user.id : "";

  // Mock meetings data (replace this with API call to fetch meetings)
  useEffect(() => {
    const fetchMeetings = async () => {
      // Fetch reservations for the user
      try {
        const response = await fetchAllUserEvents(userId);
        // console.log("All Events: ", response.data);

        // Sort meetings by date and time
        const sortedMeetings = response.data.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          // Compare by date first
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }

          // If the dates are the same, compare by start time
          const timeA = new Date(a.startTime);
          const timeB = new Date(b.startTime);
          return timeA.getTime() - timeB.getTime();
        });

        setMeetings(sortedMeetings);
      } catch (error) {
        console.error("Error fetching meetings: ", error);
      }
    };

    fetchMeetings();
  }, []);

  // Filter meetings for the selected date
  useEffect(() => {
    const selectedDateString = selectedDate.toISOString().split("T")[0]; // Get 'yyyy-mm-dd' format
    const todayMeetings = meetings.filter((meeting) => {
      // Convert meeting.date to 'yyyy-mm-dd' format
      const meetingDateString = new Date(meeting.date)
        .toISOString()
        .split("T")[0];
      return meetingDateString === selectedDateString; // Compare only the date part
    });
    setFilteredMeetings(todayMeetings);
  }, [selectedDate, meetings]);

  // Function to handle date selection
  const onDateChange = (date) => {
    setSelectedDate(date);
  };

  // Highlight dates with meetings
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      // Convert the calendar tile date to 'yyyy-mm-dd'
      const dateString = date.toISOString().split("T")[0];

      // Loop through meetings and compare the date in 'yyyy-mm-dd' format
      if (
        meetings.some((meeting) => {
          const meetingDate = new Date(meeting.date); // Convert meeting.date to Date object
          const meetingDateString = meetingDate.toISOString().split("T")[0]; // Convert to 'yyyy-mm-dd'
          return meetingDateString === dateString;
        })
      ) {
        return styles.highlightDate; // Add a class to highlight the date
      }
    }
    return null; // No class if no events
  };

  const getDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationInMs = end - start; // Duration in milliseconds
    const hours = Math.floor(durationInMs / 3600000); // Hours
    const minutes = Math.floor((durationInMs % 3600000) / 60000); // Minutes
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={styles.dashboardSection}>
      <h1>Welcome, {user.firstName}!</h1>
      <div className={styles.mainContent}>
        <div className={styles.calendarSection}>
          <div className={styles.calendarHeader}>
            <h2>Your Meetings</h2>
            <p>Select a date to view your meetings that day.</p>
          </div>
          <Calendar
            onChange={onDateChange}
            value={selectedDate}
            tileClassName={tileClassName}
            className={styles.customCalendar}
          />
        </div>

        <div className={styles.meetingsSection}>
          <h2>{selectedDate.toDateString()}</h2>
          {filteredMeetings.length > 0 ? (
            <ul>
              {filteredMeetings.map((meeting, index) => (
                <li key={index} className={styles.meetingItem}>
                  <b>
                    {new Date(meeting.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </b>{" "}
                  <br />
                  <span>Title: {meeting.title}</span>
                  <br />
                  <span>Location: {meeting.location}</span>
                  <br />
                  <span>
                    Duration: {getDuration(meeting.startTime, meeting.endTime)}
                  </span>
                  <br />
                  {meeting.host ? (
                    <span>Host: {meeting.host}</span>
                  ) : meeting.attendees && meeting.attendees.length > 0 ? (
                    <span>Attendees: {meeting.attendees.join(", ")}</span>
                  ) : null}
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
