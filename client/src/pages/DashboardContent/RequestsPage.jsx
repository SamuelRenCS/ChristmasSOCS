import React, { useState, useEffect } from "react";
import RequestItem from "../../components/RequestItem";
import styles from "../../styles/RequestPage.module.css";
import { fetchRequests, acceptRequest, rejectRequest } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const RequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  // Mock API call to fetch requests
  useEffect(() => {
    const getRequests = async () => {
      try {
        const response = await fetchRequests(user.id);
        console.log(response.requests);
        setRequests(response.requests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    getRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      const response = await acceptRequest(id);
      const approvedRequest = response.request;

      // Update the state to remove the accepted request
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== approvedRequest.id)
      );
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await rejectRequest(id);
      const deletedRequest = response.deletedRequest;

      // Update the state to remove the deleted request
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== deletedRequest.id)
      );
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className={styles.requestList}>
      <h2>Meeting Requests</h2>
      {requests.length > 0 ? (
        requests.map((request) => (
          <RequestItem
            key={request._id}
            request={request}
            onAccept={() => handleAccept(request._id)}
            onReject={() => handleReject(request._id)}
          />
        ))
      ) : (
        <p>No meeting requests at the moment.</p>
      )}
    </div>
  );
};

export default RequestsPage;
