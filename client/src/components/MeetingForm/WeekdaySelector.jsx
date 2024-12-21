// Contributors: Samuel Ren

import React from "react";
import styles from "./WeekdaySelector.module.css";

const DAYS_OF_WEEK = [
  { id: 1, label: "M" },
  { id: 2, label: "T" },
  { id: 3, label: "W" },
  { id: 4, label: "T" },
  { id: 5, label: "F" },
  { id: 6, label: "S" },
  { id: 0, label: "S" },
];

const WeekdaySelector = ({
  repeatValue,
  selectedDays,
  onDayToggle,
  meetingDay, // This prop is already in the component
}) => {
  return (
    <div
      className={`${styles.weekDaySelector} ${
        repeatValue === "Weekly" ? "" : styles.hideInput
      }`}
    >
      <label className={styles.weekDayLabel}>Repeat On</label>
      <div className={styles.weekDayCheckboxes}>
        {DAYS_OF_WEEK.map((day) => (
          <label
            key={day.id}
            className={`${styles.dayCircle} ${
              selectedDays.includes(day.id) ? styles.selected : ""
            } ${day.id === meetingDay ? styles.locked : ""}`}
          >
            <input
              type="checkbox"
              checked={selectedDays.includes(day.id) || day.id === meetingDay}
              onChange={() => {
                if (day.id !== meetingDay) {
                  onDayToggle(day.id);
                }
              }}
              disabled={day.id === meetingDay}
              className={day.id === meetingDay ? styles.locked : ""}
            />
            <span>{day.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default WeekdaySelector;
