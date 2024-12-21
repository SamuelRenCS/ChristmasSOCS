// Contributors: Samuel Ren

import { useState } from "react";
import styles from "../styles/CreateMeeting.module.css";
import MeetingForm from "../components/MeetingForm/MeetingForm";
const CreateMeeting = () => {
  return (
    <div className={styles["create-meeting"]}>
      <div className={styles["form-container"]}>
        <h2>Create a New Meeting</h2>
        <MeetingForm />
      </div>
      <div className={styles["img-container"]}>
        <img src="/Mcgill.jpg" alt="Meeting" />
      </div>
    </div>
  );
};

export default CreateMeeting;
