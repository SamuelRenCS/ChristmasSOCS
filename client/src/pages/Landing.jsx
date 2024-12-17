import React from 'react';
import '../styles/Landing.css';
import Input from '../components/Input';
import Description from '../components/Description';
import exampleImage from "../assets/landing-page.png";
export default function Landing() {
    return (
        <>
        <div className='main-section'>
          <div className="info-section">
            <div className="booking-section">
              <h1>Book a meeting now!</h1>
              <form className="booking-form">
                <input
                  type="text"
                  placeholder="Enter Meeting Code"
                  className="meeting-code"
                  
                /> 
                <button className="book-button"><b>Book now</b></button>
              </form>
            </div>
            <div className="dashboard-section">
              <h1>Looking to create a meeting?</h1>
              <button className="dashboard-button"><b>Access Dashboard</b></button>
            </div>
          </div>
          {/* <div className="image-section">
            <img  src={mcgillImage} alt="McGill Campus" />
          </div> */}
          <div className="description-section">
            <h1>Welcome to McGill Meeting Scheduler</h1>
            <p>
              Welcome to McGill's Campus Connect! Our platform is designed exclusively for 
              McGill students and staff to simplify meeting management. Here’s what you can do:
            </p>
            <ul>
              <li>📅 <b>Book a Meeting:</b> Use our streamlined booking tool to join meetings effortlessly.</li>
              <li>📝 <b>Create a Meeting:</b> Set up and manage your own meetings with ease.</li>
              <li>🔍 <b>View Scheduled Meetings:</b> Keep track of all your upcoming meetings in one place.</li>
            </ul>
            <p>
              Whether you're collaborating with peers, faculty, or administrative staff, our 
              platform ensures a seamless and efficient experience. Start scheduling today!
            </p>
          </div>

          <div className="features-section">
            <Description
            image={exampleImage}
            title="Boost team collaboration and improve productivity"
            text="Simplify communication across teams and hit goals faster, with team management software that maximizes productivity and empowers everyone to work smarter together."
            />
            <Description
            image={exampleImage}
            title="Streamline meeting scheduling and management"
            text="Easily schedule and manage meetings with our intuitive platform, designed to simplify the process and keep everyone on the same page."
            reverse = {true}
            />
            <Description
            image={exampleImage}
            title="Stay organized and focused on your goals"
            text="Keep track of all your meetings and tasks in one place, so you can stay organized and focused on what matters most."
            />
          </div>
          
        </div>
        </>
    );
}