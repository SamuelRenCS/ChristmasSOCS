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
  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    if (highlightedDates.includes(formattedDate)) {
      onChange(formattedDate);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = date.toISOString().split("T")[0];
      const classes = [];

      if (highlightedDates.includes(formattedDate)) {
        classes.push("highlight");
      }

      if (value && date.toISOString().split("T")[0] === value) {
        classes.push("selected");
      }

      return classes.length > 0 ? classes.join(" ") : null;
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = date.toISOString().split("T")[0];
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
