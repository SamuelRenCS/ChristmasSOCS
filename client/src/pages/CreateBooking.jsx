import { useState } from 'react';
import Header from '../partials/Header';
import Footer from '../partials/Footer';
import '../styles/CreateBooking.css';
import BookingForm from '../components/BookingForm';
const CreateMeeting = () => {
  

  return (
    <div className="create-meeting">
      <Header />
      <div className="form-container">
        <h2>Book a meeting</h2>
        <BookingForm />
      </div>
      <div className="img-container">
        <img src="/Mcgill.jpg" alt="Meeting" />
      </div>
      <Footer />
    </div>
  );
};

export default CreateMeeting;

