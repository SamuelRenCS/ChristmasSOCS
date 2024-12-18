import React from "react";
import RequestForm from "../components/CreateRequest/RequestForm";
import styles from "../styles/CreateRequest.module.css";

const CreateRequest = () => {
  return (
    <div className={styles["create-request"]}>
      <div className={styles["form-container"]}>
        <h2>Create a New Request</h2>
        <RequestForm />
      </div>
      <div className={styles["img-container"]}>
        <img src="/Mcgill.jpg" alt="Meeting" />
      </div>
    </div>
  );
};

export default CreateRequest;
