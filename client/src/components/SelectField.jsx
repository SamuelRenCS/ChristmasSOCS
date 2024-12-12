import React from "react";

const SelectField = ({ label, name, value, onChange, options }) => {
  return (
    <label>
      {label}
      <select name={name} value={value} onChange={onChange}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SelectField;