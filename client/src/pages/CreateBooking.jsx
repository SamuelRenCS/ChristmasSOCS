import { useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { useParams } from "react-router-dom";
import styles from "../styles/CreateBooking.module.css";
import BookingForm from "../components/BookingForm";
const CreateBooking = () => {
  const { token } = useParams();

  return (
    <div className={styles["create-meeting"]}>
      <Header />
      <div className={styles["form-container"]}>
        <h2>Book a meeting</h2>
        <BookingForm token={token} />
      </div>
      <div className={styles["img-container"]}>
        <img src="/Mcgill.jpg" alt="Meeting" />
      </div>
      <Footer />
    </div>
  );
};

export default CreateBooking;
