import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/CreateMeeting.css';
import MeetingForm from '../components/MeetingForm';
const CreateMeeting = () => {
  

  return (
    <div className="create-meeting">
      <Navbar />
      <div className="form-container">
        <h2>Create a New Meeting</h2>
        <MeetingForm />
      </div>
      <div className="img-container">
        <img src="../public/Mcgill.jpg" alt="Meeting" />
      </div>
      <Footer />
    </div>
  );
};

export default CreateMeeting;
