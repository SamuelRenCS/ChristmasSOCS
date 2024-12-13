import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarDateDblInput = ({ label, value, onChange, showEndDate, endDate, onEndDateChange }) => {
  const [showCalendarFor, setShowCalendarFor] = useState(null); // 'start' or 'end'

  // Handle date change based on active calendar
  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split("T")[0]; // Format the date as "YYYY-MM-DD"
    if (showCalendarFor === "start") {
      onChange(formattedDate);
    } else if (showCalendarFor === "end") {
      onEndDateChange(formattedDate);
    }
    setShowCalendarFor(null); // Close the calendar after selection
  };

  return (
    <div className="calendar-date-input">
      <label>
        {label}
        <input
          type="text"
          value={value}
          onClick={() => setShowCalendarFor("start")} // Open calendar for start date
          readOnly
          placeholder="Select a date"
        />
      </label>
      {showEndDate && (
        <label>
          End Date:
          <input
            type="text"
            value={endDate}
            onClick={() => setShowCalendarFor("end")} // Open calendar for end date
            readOnly
            placeholder="Select an end date"
          />
        </label>
      )}
      {showCalendarFor && (
        <div className="calendar-container">
          <Calendar
            onChange={handleDateChange}
            value={
              showCalendarFor === "start"
                ? value
                  ? new Date(value)
                  : new Date()
                : endDate
                ? new Date(endDate)
                : new Date()
            }
          />
        </div>
      )}
    </div>
  );
};

export default CalendarDateDblInput;