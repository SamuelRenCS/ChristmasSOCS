// Contributors: Eric Cheng, Shotaro Nakamura, Samuel Ren

import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import InputField from "./InputField";
import styles from "./CalendarDateInput.module.css";

const CalendarDateInput = ({
  label,
  value,
  onChange,
  highlightedDates = [],
}) => {
  // Ensure the date is correctly formatted as 'yyyy-mm-dd' for comparisons
  const formatDate = (date) => date.toISOString().split("T")[0];

  const handleDateChange = (date) => {
    const formattedDate = formatDate(date);
    if (highlightedDates.includes(formattedDate)) {
      onChange(formattedDate);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = formatDate(date);
      const classes = [];

      // Add 'highlight' class if the date is in the highlightedDates array
      if (highlightedDates.includes(formattedDate)) {
        classes.push("highlight");
      }

      // Add 'selected' class if this date is the selected date
      if (value && formatDate(date) === value) {
        classes.push("selected");
      }

      return classes.length > 0 ? classes.join(" ") : null;
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = formatDate(date);
      return !highlightedDates.includes(formattedDate);
    }
    return false;
  };

  return (
    <div className={styles.calendarDateInput}>
      <InputField
        label={label}
        type="text"
        value={value}
        readOnly
        placeholder="Select a date"
      />
      <div className={styles.calendarContainer}>
        <Calendar
          onChange={handleDateChange}
          value={value ? new Date(value) : null}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled}
        />
      </div>
    </div>
  );
};

export default CalendarDateInput;
