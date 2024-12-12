import React from "react";

const InputField = ({ label, name, type, value, onChange, required, min }) => {
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
      />
    </label>
  );
};

export default InputField;