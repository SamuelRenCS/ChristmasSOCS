import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./CalendarDateDblInput.module.css";
import InputField from "./InputField";

const CalendarDateDblInput = ({
  label,
  value,
  onChange,
  showEndDate,
  endDate,
  onEndDateChange,
}) => {
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
    <div className={styles["calendar-date-input"]}>
      <InputField
        label={label}
        value={value}
        name={"start-date"}
        type={"text"}
        onClick={() => setShowCalendarFor("start")}
        readOnly
        placeholder="Select a date"
        isDate={true}
      />
      {showEndDate && (
        <InputField
          label={"End Date"}
          type={"text"}
          value={endDate}
          onClick={() => setShowCalendarFor("end")}
          readOnly
          placeholder={"Select an end date"}
        />
      )}
      {showCalendarFor && (
        <div className={styles["calendar-container"]}>
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
