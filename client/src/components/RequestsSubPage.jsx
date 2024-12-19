import React, { useState, useEffect } from "react";
import RequestItem from "./RequestItem";
import styles from "./RequestsSubPage.module.css";

const RequestsSubPage = ({
  requests,
  handleAccept,
  handleReject,
  handleCancel,
  requestType,
}) => {
  console.log(requestType);

  // const handleAccept = async (id) => {
  //   try {
  //     const response = await acceptRequest(id);
  //     const approvedRequest = response.request;

  //     // Update the incoming requests state to remove the accepted request
  //     setIncomingRequests((prevRequests) =>
  //       prevRequests.filter((req) => req.id !== approvedRequest.id)
  //     );
  //   } catch (error) {
  //     console.error("Error accepting request:", error);
  //   }
  // };

  // const handleReject = async (id) => {
  //   try {
  //     const response = await rejectRequest(id);
  //     const deletedRequest = response.deletedRequest;

  //     // Update the state to remove the deleted request
  //     setIncomingRequests((prevRequests) =>
  //       prevRequests.filter((req) => req.id !== deletedRequest.id)
  //     );
  //   } catch (error) {
  //     console.error("Error rejecting request:", error);
  //   }
  // };

  return (
    <div className={styles.requestList}>
      <h2>{`${requestType} Requests`}</h2>
      {requests.length > 0 ? (
        requests.map((request) => (
          <RequestItem
            key={request.id}
            request={request}
            onAccept={() => handleAccept(request._id)}
            onReject={() => handleReject(request._id)}
            itemType={requestType}
          />
        ))
      ) : (
        <p>{`No ${requestType} requests at the moment.`}</p>
      )}
    </div>
  );
};

export default RequestsSubPage;
