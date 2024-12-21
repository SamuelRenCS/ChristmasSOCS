// Contributors: Shotaro Nakamura, Samuel Ren

import React, { useState, useEffect } from "react";
import styles from "../../styles/NotificationsPage.module.css";
import {
  fetchNotifications,
  deleteNotification,
  deleteAllNotifications,
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { timeAgo } from "../../utils/timeUtils";

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const getNotifications = async () => {
    try {
      const response = await fetchNotifications(user.id);
      setNotifications(response);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const handleClearNotifications = async () => {
    await deleteAllNotifications(user.id);
    await getNotifications();
  };

  const handleDeleteNotification = async (id) => {
    await deleteNotification(id);
    await getNotifications();
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
          <div key={notification._id} className={styles.notificationItem}>
            <div className={styles.info}>
              <h3 className={styles.notificationTitle}>{notification.title}</h3>
              <p className={styles.message}>{notification.message}</p>
              <p>{timeAgo(notification.date)}</p>
            </div>
            <div className={styles.deleteButton}>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteNotification(notification._id)}
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
