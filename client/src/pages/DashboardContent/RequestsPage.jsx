import React, { useState, useEffect } from "react";
import styles from "../../styles/RequestPage.module.css";
import { fetchRequests, acceptRequest, rejectRequest } from "../../api/api";
import RequestsSubPage from "../../components/RequestsSubPage";
import { useAuth } from "../../context/AuthContext";

const RequestsPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("Confirmed");
  const [confirmedRequests, setConfirmedRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  //fetch requests
  useEffect(() => {
    const getRequests = async () => {
      try {
        // const response = await fetchRequests(user.id);
        // setConfirmedRequests(response.data.confirmedRequests);
        // setIncomingRequests(response.data.incomingRequests);
        // setOutgoingRequests(response.data.outgoingRequests);

        // Hardcoded requests for testing
        setConfirmedRequests([
          {
            id: 1,
            title: "Request 1",
            requesterName: "User 1",
            startDate: "2021-07-01T12:00:00Z",
            endDate: "2021-07-01T14:00:00Z",
            description: "Request 1 description",
            location: "Request 1 location",
          },
          {
            id: 2,
            title: "Request 2",
            requesterName: "User 2",
            startDate: "2021-07-02T12:00:00Z",
            endDate: "2021-07-02T14:00:00Z",
            description: "Request 2 description",
            location: "Request 2 location",
          },
        ]);

        setIncomingRequests([
          {
            id: 3,
            title: "Request 3",
            requesterName: "User 3",
            startDate: "2021-07-03T12:00:00Z",
            endDate: "2021-07-03T14:00:00Z",
            description: "Request 3 description",
            location: "Request 3 location",
          },
          {
            id: 4,
            title: "Request 4",
            requesterName: "User 4",
            startDate: "2021-07-04T12:00:00Z",
            endDate: "2021-07-04T14:00:00Z",
            description: "Request 4 description",
            location: "Request 4 location",
          },
        ]);

        setOutgoingRequests([
          {
            id: 5,
            title: "Request 5",
            requesterName: "User 5",
            startDate: "2021-07-05T12:00:00Z",
            endDate: "2021-07-05T14:00:00Z",
            description: "Request 5 description",
            location: "Request 5 location",
          },
          {
            id: 6,
            title: "Request 6",
            requesterName: "User 6",
            startDate: "2021-07-06T12:00:00Z",
            endDate: "2021-07-06T14:00:00Z",
            description: "Request 6 description",
            location: "Request 6 location",
          },
        ]);

        console.log("Requests fetched successfully");
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    getRequests();
  }, []);

  const menuItems = [
    {
      name: "Confirmed",
      label: "Confirmed",
      requests: confirmedRequests,
    },
    {
      name: "Incoming",
      label: "Incoming",
      requests: incomingRequests,
    },
    {
      name: "Outgoing",
      label: "Outgoing",
      requests: outgoingRequests,
    },
  ];

  return (
    <div className={styles.requestPageContainer}>
      <div className={styles.requestMenu}>
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={activeSection === item.name ? styles.active : ""}
            onClick={() => setActiveSection(item.name)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.requestContent}>
        <RequestsSubPage
          requests={
            menuItems.find((item) => item.name === activeSection).requests
          }
          // handleAccept={handleAccept}
          // handleReject={handleReject}
          // handleCancel={handleCancel}
          requestType={activeSection}
        />
      </div>
    </div>
  );
};

export default RequestsPage;
