import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "./RequestItem.module.css";

const RequestItem = ({ request, onAccept, onReject }) => {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = () => {
    onAccept(request.id);
    setIsAccepted(true);
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
          <strong>Time:</strong>{" "}
          {new Date(request.meetingTime).toLocaleString()}
        </p>
        <p>
          <strong>Purpose:</strong> {request.purpose}
        </p>
      </div>

      {/* Action Buttons */}
      <div className={styles.requestActions}>
        {isAccepted ? (
          <button className={styles.acceptedButton} disabled>
            ACCEPTED
          </button>
        ) : (
          <button className={styles.acceptButton} onClick={handleAccept}>
            ACCEPT
          </button>
        )}
        <button
          className={styles.rejectButton}
          onClick={() => onReject(request.id)}
        >
          REJECT
        </button>
      </div>
    </div>
  );
};

RequestItem.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    requesterName: PropTypes.string.isRequired,
    meetingTime: PropTypes.string.isRequired,
    purpose: PropTypes.string.isRequired,
  }).isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default RequestItem;
