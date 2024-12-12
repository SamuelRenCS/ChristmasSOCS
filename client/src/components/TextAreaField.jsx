import React from "react";

const TextAreaField = ({ label, name, value, onChange }) => {
  return (
    <label>
      {label}
      <textarea name={name} value={value} onChange={onChange}></textarea>
    </label>
  );
};

export default TextAreaField;