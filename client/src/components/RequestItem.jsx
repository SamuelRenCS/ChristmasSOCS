import React, { useState } from "react";
import styles from "./RequestItem.module.css";

const RequestItem = ({ request, onAccept, onReject, itemType }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <div className={styles.requestItem}>
      {/* Request Details */}
      <div className={styles.requestInfo}>
        <h3>{request.title}</h3>
        <p>
          <strong>Requester:</strong> {request.requesterName}
        </p>
        <p>
          <strong>Time:</strong> {formatDate(request.startDate)} -{" "}
          {formatDate(request.endDate)}
        </p>
        <p>
          <strong>Description:</strong> {request.description}
        </p>
        <p>
          <strong>Location:</strong> {request.location}
        </p>
      </div>

      {/* Action Buttons */}
      <div className={styles.requestActions}>
        {itemType === "Incoming" && (
          <>
            <button onClick={onAccept} className={styles.acceptButton}>
              Accept
            </button>
            <button onClick={onReject} className={styles.rejectButton}>
              Reject
            </button>
          </>
        )}

        {itemType === "Outgoing" && (
          <p className={styles.pendingText}>Pending...</p>
        )}

        {itemType === "Confirmed" && (
          <button onClick={onReject} className={styles.rejectButton}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default RequestItem;
