import React from 'react';
import './Landing.css';

export default function Landing() {
    return (
        <>
        <main className="main-section">
          <div className="info-section">
            <div className="booking-section">
              <h1>Book a meeting now!</h1>
              <form className="booking-form">
                <input
                  type="text"
                  placeholder="Enter Meeting Code"
                  className="input-field"
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
        </main>
        </>
    );
}