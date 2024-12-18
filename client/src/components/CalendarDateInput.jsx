import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarDateInput = ({
  label,
  value,
  onChange,
  highlightedDates = [],
}) => {
  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split("T")[0]; // Format the date as "YYYY-MM-DD"
    if (highlightedDates.includes(formattedDate)) {
      onChange(formattedDate); // Pass the formatted date to the parent component
    }
  };

  // Highlight specific dates and selected date
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = date.toISOString().split("T")[0];
      const classes = [];
      
      // Highlight available dates
      if (highlightedDates.includes(formattedDate)) {
        classes.push("highlight");
      }
      
      // Highlight selected date
      if (value && date.toISOString().split("T")[0] === value) {
        classes.push("selected");
      }
      
      return classes.length > 0 ? classes.join(" ") : null;
    }
    return null;
  };

  // Disable dates that are not in the highlightedDates array
  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = date.toISOString().split("T")[0];
      return !highlightedDates.includes(formattedDate);
    }
    return false;
  };

  return (
    <div className="calendar-date-input">
      <label>
        {label}
        <input
          type="text"
          value={value}
          readOnly // Make the input field non-editable
          placeholder="Select a date"
        />
      </label>
      <div className="calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={value ? new Date(value) : null} // Ensure the calendar has a valid date value
          tileClassName={tileClassName} // Highlight dates
          tileDisabled={tileDisabled} // Restrict selection to highlighted dates
        />
      </div>
    </div>
  );
};

export default CalendarDateInput;