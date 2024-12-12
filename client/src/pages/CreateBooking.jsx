import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/CreateBooking.css';
import BookingForm from '../components/BookingForm';
const CreateMeeting = () => {
  

  return (
    <div className="create-meeting">
      <Navbar />
      <div className="form-container">
        <h2>Book a meeting</h2>
        <BookingForm />
      </div>
      <div className="img-container">
        <img src="../public/Mcgill.jpg" alt="Meeting" />
      </div>
      <Footer />
    </div>
  );
};

export default CreateMeeting;

