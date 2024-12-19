import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchUserMeetings } from "../../api/api";


import styles from "../../styles/MeetingsList.module.css";
//import { fetchUser } from "../../api/api";


const MeetingsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const userId = user ? user.id : "";
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Used to navigate to other pages

  // On load fetch all meetings
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
    navigate(`/meetings/${meetingId}`);
  };


  const handleGetIDClick = (meetingId) => {
    const meetingToken = meetingId;
    navigator.clipboard.writeText(meetingToken).then(() => {
      toast.success("Meeting ID copied to clipboard!");
    }).catch((error) => {
      console.error("Error copying ID to clipboard: ", error);
      toast.error("Failed to copy meeting ID.");
    });
  };

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.header}>
        <h2>My Meetings</h2>
        
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
              <button className={styles.viewButton} onClick={() => handleViewClick(notification.id)}>
                VIEW
              </button>
              <button className={styles.urlButton} onClick={() => handleGetIDClick(notification.id)}>
                GET ID
              </button>
            </div>
           
          </div>
        ))
      ) : (
        <p>No meetings created.</p>
      )}
    </div>
  );
  


};

export default MeetingsPage;
