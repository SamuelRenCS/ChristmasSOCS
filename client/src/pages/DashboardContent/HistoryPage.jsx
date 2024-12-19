import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

import { fetchUserBookings, deleteBooking } from "../../api/api";

import styles from "../../styles/History.module.css";

const HistoryPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const userId = user ? user.id : "";
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // On load fetch all meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetchUserBookings(userId);
        console.log("Meetings: ", response.data);
        setMeetings(response.data);
        setLoading(false);

        setNotifications(
          response.data
            .map((meeting) => ({
              title: meeting.title,
              id: meeting.id,
              location: meeting.location,
              date: meeting.date,
              start: meeting.startTime,
              end: meeting.endTime,
              isPast: new Date(meeting.date + " " + meeting.startTime) < new Date(), // Check if the meeting is in the past
            }))
            .sort((a, b) => {
              const dateA = new Date(a.date + " " + a.start);
              const dateB = new Date(b.date + " " + b.start);
        
              // First, compare by date (most recent first)
              if (dateA > dateB) return -1; // Reverse order
              if (dateA < dateB) return 1;
        
              // If dates are the same, compare by start time (most recent first)
              if (a.start > b.start) return -1; // Reverse order
              if (a.start < b.start) return 1;
        
              return 0; // If both date and start time are the same, return 0
            })
        );
      } catch (error) {
        console.error("Error fetching meetings: ", error);
        toast.error("Error fetching meetings");
      }
    };
    if (userId) fetchMeetings();
  }, [userId]);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

  const handleCancelClick = async (bookingId) => {
    if (confirmingDeleteId === bookingId) {
      try {
        console.log("Booking ID: ", bookingId);
        console.log("User ID: ", userId);
        const response = await deleteBooking(bookingId, userId);
        console.log("Response: ", response);
        toast.success("Booking cancelled successfully");
        // Remove the cancelled booking from the list
        setNotifications(notifications.filter((booking) => booking.id !== bookingId));
        setConfirmingDeleteId(null); 
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error("Failed to cancel booking");
      }
    }
    else {
      // If not confirming, show the confirmation state
      setConfirmingDeleteId(bookingId);
    }
    setTimeout(() => {
      setConfirmingDeleteId(null);
    }, 4000);
  }


  const handleCancelDelete = () => {
    // Cancel deletion and reset the button
    setConfirmingDeleteId(null);
  };

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.header}>
        <h2>All Bookings</h2>
      </div>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
          
            key={notification.id}
            className={`${styles.notificationItem} ${notification.isPast ? styles.pastMeeting : ""}`}
          >
            <div className={styles.info}>
              <p>
                <b>Title:</b> {notification.title}
              </p>
              <p>
                <b>Location:</b> {notification.location}
              </p>
              <p>
                <b>Date:</b> {notification.date}
              </p>
              <p>
                <b>Start:</b> {notification.start}
              </p>
              <p>
                <b>End:</b> {notification.end}
              </p>
            </div>
            <div className={styles.requestActions}>
              {!notification.isPast && (
                  <button
                  className={styles.cancelButton}
                  onClick={() => handleCancelClick(notification.id)} // Pass meeting ID
                onBlur={handleCancelDelete}>
                  {confirmingDeleteId === notification.id ? "CONFIRM" : "CANCEL"}
                </button>
                )}
            </div>
          </div>
        ))
      ) : (
        <p>No meetings created.</p>
      )}
    </div>
  );
};

export default HistoryPage;