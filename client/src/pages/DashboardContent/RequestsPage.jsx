import React, { useState, useEffect } from "react";
import RequestItem from "../../components/RequestItem";
import styles from "../../styles/RequestPage.module.css";
import { fetchRequests } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const RequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  // Mock API call to fetch requests
  useEffect(() => {
    const getRequests = async () => {
      try {
        const response = await fetchRequests(user.id);
        setRequests(response.requests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    getRequests();
  }, []);

  const handleAccept = (id) => {
    console.log(`Request ${id} accepted`);
    setRequests((prevRequests) => prevRequests.filter((req) => req.id !== id));
  };

  const handleReject = (id) => {
    console.log(`Request ${id} rejected`);
    setRequests((prevRequests) => prevRequests.filter((req) => req.id !== id));
  };

  return (
    <div className={styles.requestList}>
      <h2>Meeting Requests</h2>
      {requests.length > 0 ? (
        requests.map((request) => (
          <RequestItem
            key={request._id}
            request={request}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ))
      ) : (
        <p>No meeting requests at the moment.</p>
      )}
    </div>
  );
};

export default RequestsPage;
