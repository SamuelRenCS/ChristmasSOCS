// Contributors: Shotaro Nakamura, Samuel Ren

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

  // Format ISO string to local date
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Format ISO string to local time
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetchUserBookings(userId);
        setMeetings(response.data);
        setLoading(false);

        const now = new Date();

        setNotifications(
          response.data
            .map((meeting) => {
              const startDateTime = new Date(meeting.startTime);

              return {
                title: meeting.title,
                id: meeting.id,
                location: meeting.location,
                date: formatDate(meeting.startTime),
                start: formatTime(meeting.startTime),
                end: formatTime(meeting.endTime),
                isPast: startDateTime < now,
                // Store original date time for sorting
                dateTime: startDateTime,
              };
            })
            .sort((a, b) => {
              // Sort by date/time, most recent first
              return b.dateTime - a.dateTime;
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
        const response = await deleteBooking(bookingId, userId);
        toast.success("Booking cancelled successfully");
        setNotifications(
          notifications.filter((booking) => booking.id !== bookingId)
        );
        setConfirmingDeleteId(null);
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error("Failed to cancel booking");
      }
    } else {
      setConfirmingDeleteId(bookingId);
    }
    setTimeout(() => {
      setConfirmingDeleteId(null);
    }, 4000);
  };

  const handleCancelDelete = () => {
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
            className={`${styles.notificationItem} ${
              notification.isPast ? styles.pastMeeting : ""
            }`}
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
                  onClick={() => handleCancelClick(notification.id)}
                  onBlur={handleCancelDelete}
                >
                  {confirmingDeleteId === notification.id
                    ? "CONFIRM"
                    : "CANCEL"}
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
