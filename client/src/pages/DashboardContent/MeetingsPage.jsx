import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { fetchUserMeetings } from "../../api/api";
import { fetchToken } from "../../api/api";
import Button from "../../components/Button";

import styles from "../../styles/MeetingsList.module.css";
//import { fetchUser } from "../../api/api";

const MeetingsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const userId = user ? user.id : "";
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenPopup, setTokenPopup] = useState({
    show: false,
    token: "",
    meetingId: null,
  });

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetchUserMeetings(userId);
        console.log("Meetings: ", response.data);
        setMeetings(response.data);
        setLoading(false);

        setNotifications(
          response.data.map((meeting) => ({
            title: meeting.title,
            id: meeting.id,
            location: meeting.location,
          }))
        );
      } catch (error) {
        console.error("Error fetching meetings: ", error);
        toast.error("Error fetching meetings");
      }
    };
    if (userId) fetchMeetings();
  }, [userId]);

  const handleViewClick = (meetingId) => {
    const meetingUrl = `/meetings/${meetingId}`;
    window.open(meetingUrl, "_blank");
  };

  const handleGetIDClick = async (meetingId) => {
    try {
      const response = await fetchToken(meetingId);
      console.log("Response: ", response);
      const meetingToken = response.data.token;
      console.log("Meeting token: ", meetingToken);

      setTokenPopup({ show: true, token: meetingToken });
    } catch (error) {
      console.error("Error fetching token:", error);
      toast.error("Failed to fetch meeting token.");
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(tokenPopup.token).then(() => {
      toast.info("Token copied to clipboard");
    });
  };

  const closePopup = () => {
    setTokenPopup({ show: false, token: "", meetingId: null });
  };

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.header}>
        <h2>My Meetings</h2>
        <Button text="Add Meeting" onClick={() => navigate("/meetings/new")} />
      </div>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div key={notification.id} className={styles.notificationItem}>
            <div className={styles.info}>
              <p>
                <b>Title:</b> {notification.title}
              </p>
              <p>
                <b>Location:</b> {notification.location}
              </p>
            </div>
            <div className={styles.requestActions}>
              <button
                className={styles.viewButton}
                onClick={() => handleViewClick(notification.id)}
              >
                VIEW
              </button>
              <button
                className={styles.urlButton}
                onClick={() => handleGetIDClick(notification.id)}
              >
                GET TOKEN
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No meetings created.</p>
      )}

      {tokenPopup.show && (
        <div className={styles["token-popup"]}>
          <div className={styles["popup-content"]}>
            <h3>Meeting Token</h3>
            <p>
              {typeof tokenPopup.token === "string"
                ? tokenPopup.token
                : JSON.stringify(tokenPopup.token)}
            </p>
            <button onClick={handleCopyToken}>Copy Token</button>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
