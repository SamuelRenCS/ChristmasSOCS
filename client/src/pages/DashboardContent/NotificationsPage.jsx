import React, { useState, useEffect } from "react";
import styles from "../../styles/NotificationsPage.module.css";


const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    
    const fetchNotifications = async () => {
      const mockNotifications = [
        {
          id: 1,
          user: "John Doe",
          message: "Meeting Cancelled",
          date: "2024-12-18T14:00:00Z",
        },
        {
          id: 2,
          user: "Jane Smith",
          message: "Meeting Cancelled",
          date: "2024-12-19T10:00:00Z",
        },
        {
          id: 3,
          user: "Jane Smith",
          message: "Meeting Cancelled",
          date: "2024-12-19T10:00:00Z",
        },
      ];

      setNotifications(mockNotifications);
    };

    fetchNotifications();
  }, []);

  const handleClearNotifications = () => {
    setNotifications([]); // Clear all notifications
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    ); // Delete individual notification by id
  };

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.header}>
        <h2>Notifications</h2>
        <button
          className={styles.clearButton}
          onClick={handleClearNotifications}
        >
          Clear All
        </button>
      </div>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div key={notification.id} className={styles.notificationItem}>
            <div className={styles.info}>
            <p>
              <b>User:</b> {notification.user}
            </p>
            <p>
              <b>Message:</b> {notification.message}
            </p>
            <p>
              <b>Date:</b>{" "}
              {new Date(notification.date).toLocaleString()}
            </p>
            </div>
            <div className={styles.deleteButton}>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteNotification(notification.id)}
              >
                &#10006;
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No notifications available.</p>
      )}
    </div>
  );
};

export default NotificationsPage;
