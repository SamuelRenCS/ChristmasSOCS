import { useState } from 'react';
import Header from '../partials/Header';
import Footer from '../partials/Footer';
import '../styles/CreateMeeting.css';
import MeetingForm from '../components/MeetingForm';
const CreateMeeting = () => {
  

  return (
    <div className="create-meeting">
      <Header />
      <div className="form-container">
        <h2>Create a New Meeting</h2>
        <MeetingForm />
      </div>
      <div className="img-container">
        <img src="/Mcgill.jpg" alt="Meeting" />
      </div>
      <Footer />
    </div>
  );
};

export default CreateMeeting;

