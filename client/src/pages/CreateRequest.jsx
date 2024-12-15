import React from "react";
import RequestForm from "../components/CreateRequest/RequestForm";
import styles from "../styles/CreateRequest.module.css";

const CreateRequest = () => {
  return (
    <div className={styles.requestForm}>
      <h1 className={styles.title}>Create Request</h1>
      <RequestForm />
    </div>
  );
};

export default CreateRequest;
