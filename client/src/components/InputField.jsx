import React from "react";
import styles from "./InputField.module.css";

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onClick,
  onChange,
  required = false,
  min,
  max,
  placeholder,
  className,
  isDate,
  ...rest
}) => {
  const getClassName = (type, isDate) => {
    if (isDate) return styles.date;

    switch (type) {
      case "time":
        return styles.time;
      case "number":
        return styles.number;
      default:
        return styles.input;
    }
  };

  return (
    <div className={styles.inputWrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onClick={onClick}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        className={getClassName(type, isDate)}
        {...rest}
      />
    </div>
  );
};

export default InputField;
