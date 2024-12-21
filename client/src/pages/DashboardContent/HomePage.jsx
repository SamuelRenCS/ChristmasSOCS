// Contributors: Shotaro Nakamura

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

  const getLocalDateString = (utcString) => {
    // Create date object in local time zone
    const date = new Date(utcString);
    // Format date in user's local time zone
    return date.toLocaleDateString("en-CA", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetchAllUserEvents(userId);

        // Sort meetings by date and time in local time zone
        const sortedMeetings = response.data.sort((a, b) => {
          return new Date(a.startTime) - new Date(b.startTime);
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
    const selectedLocalDate = selectedDate.toLocaleDateString("en-CA", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    const todayMeetings = meetings.filter((meeting) => {
      const meetingDateString = getLocalDateString(meeting.startTime);
      return meetingDateString === selectedLocalDate;
    });

    const sortedFilteredMeetings = todayMeetings.sort((a, b) => {
      return new Date(a.startTime) - new Date(b.startTime);
    });

    setFilteredMeetings(sortedFilteredMeetings);
  }, [selectedDate, meetings]);

  const onDateChange = (date) => {
    setSelectedDate(date);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const tileDateString = date.toLocaleDateString("en-CA", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      if (
        meetings.some(
          (meeting) => getLocalDateString(meeting.startTime) === tileDateString
        )
      ) {
        return styles.highlightDate;
      }
    }
    return null;
  };

  const formatLocalTime = (utcTimeString) => {
    return new Date(utcTimeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  const getDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationInMs = end - start;
    const hours = Math.floor(durationInMs / 3600000);
    const minutes = Math.floor((durationInMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={styles.dashboardSection}>
      <h1 className={styles.greeting}>Welcome, {user.firstName}!</h1>
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
          <h2>
            {selectedDate.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            })}
          </h2>
          {filteredMeetings.length > 0 ? (
            <ul>
              {filteredMeetings.map((meeting, index) => (
                <li key={index} className={styles.meetingItem}>
                  <b>{formatLocalTime(meeting.startTime)}</b>
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
