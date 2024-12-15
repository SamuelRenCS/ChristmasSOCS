import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarDateInput = ({ label, value, onChange }) => {
  

  // Handle date change from calendar
  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split("T")[0]; // Format the date as "YYYY-MM-DD"
    onChange(formattedDate); // Pass the formatted date to the parent component
  };

  return (
    <div className="calendar-date-input">
      <label>
        {label}
        <input
          type="text"
          value={value}
         
          onChange={() => {}} // Prevent manual changes to the input
          readOnly // Make the input field non-editable
          placeholder="Select a date"
        />
      </label>
      {(
        <div className="calendar-container">
          <Calendar
            onChange={handleDateChange}
            value={value ? new Date(value) : new Date()} // Ensure the calendar has a valid date value
          />
        </div>
      )}
    </div>
  );
};

export default CalendarDateInput;