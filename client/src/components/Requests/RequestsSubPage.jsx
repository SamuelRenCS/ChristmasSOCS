// Contributors: Samuel Ren

import React, { useState, useEffect } from "react";
import RequestItem from "./RequestItem";
import { fetchRequests, acceptRequest, rejectRequest } from "../../api/api";
import styles from "./RequestsSubPage.module.css";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const RequestsSubPage = ({ requestType }) => {
  const { user } = useAuth();
  const [currentRequests, setCurrentRequests] = useState([]);

  // Fetch requests based on the request type
  const getRequests = async () => {
    try {
      const response = await fetchRequests(user.id);
      const requests = response.data[`${requestType.toLowerCase()}Requests`];
      setCurrentRequests(requests);
    } catch (error) {
      console.error(`Error fetching ${requestType} requests:`, error);
    }
  };

  useEffect(() => {
    getRequests();
  }, [requestType]);

  const handleAccept = async (id) => {
    try {
      const response = await acceptRequest(id);
      await getRequests();

      // Notify user of request acceptance
      toast.success(response.message);
    } catch (error) {
      toast.error("Error accepting request");
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await rejectRequest(id);
      await getRequests();

      // Notify user of request rejection
      toast.success(response.message);
    } catch (error) {
      toast.error("Error cancelling request");
      console.error("Error cancelling request:", error);
    }
  };

  return (
    <div className={styles.requestList}>
      <h2>{`${requestType} Requests`}</h2>
      {currentRequests.length > 0 ? (
        currentRequests.map((request) => (
          <RequestItem
            key={request._id}
            request={request}
            onAccept={() => handleAccept(request._id)}
            onReject={() => handleReject(request._id)}
            itemType={requestType}
          />
        ))
      ) : (
        <p>{`No ${requestType.toLowerCase()} requests at the moment.`}</p>
      )}
    </div>
  );
};

export default RequestsSubPage;
