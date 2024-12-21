// Contributors: Samuel Ren

import React from "react";
import styles from "./SelectField.module.css";

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  hidden,
  timeSlot,
}) => {
  return (
    <div
      className={`${styles.selectWrapper} ${hidden ? styles.hideInput : ""}`}
    >
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <select
        id={name}
        className={`${styles.select} ${timeSlot ? styles.timeSlot : ""}`}
        name={name}
        value={value}
        onChange={onChange}
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
