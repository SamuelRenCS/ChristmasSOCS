import React from "react";
import styles from "./SelectField.module.css";

const SelectField = ({ label, name, value, onChange, options, hidden }) => {
  return (
    <div
      className={`${styles.selectWrapper} ${hidden ? styles.hideInput : ""}`}
    >
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <select
        id={name}
        className={styles.select}
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
