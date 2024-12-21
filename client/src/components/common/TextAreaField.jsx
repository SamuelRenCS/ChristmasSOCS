// Contributors: Samuel Ren

import React from "react";
import styles from "./TextAreaField.module.css";

const TextAreaField = ({ label, name, value, onChange, placeholder }) => {
  return (
    <div className={styles.textAreaWrapper}>
      <label className={styles.label}>{label}</label>
      <textarea
        className={styles.textArea}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      ></textarea>
    </div>
  );
};

export default TextAreaField;
