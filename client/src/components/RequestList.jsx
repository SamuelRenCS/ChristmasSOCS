import React, { useState, useEffect } from "react";
import RequestItem from "./RequestItem";
import styles from "./RequestList.module.css";

const RequestList = () => {
  const [requests, setRequests] = useState([]);

  // Mock API call to fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      const mockRequests = [
        {
          id: "1",
          title: "Team Sync-Up",
          requesterName: "John Doe",
          meetingTime: "2024-12-18T14:00:00Z",
          purpose: "Discuss project updates",
        },
        {
          id: "2",
          title: "Budget Review",
          requesterName: "Jane Smith",
          meetingTime: "2024-12-19T10:00:00Z",
          purpose: "Finalize next quarter's budget",
        },
      ];
      setRequests(mockRequests);
    };

    fetchRequests();
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
            key={request.id}
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

export default RequestList;
