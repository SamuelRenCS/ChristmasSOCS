import React from "react";

const InputField = ({ label, name, type, value, onChange, required, min, max }) => {
  return (
    <label>
      {label}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
      />
    </label>
  );
};

export default InputField;