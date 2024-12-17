import React from "react";
import InputField from "../components/InputField";
import CalendarDateDblInput from "../components/CalendarDateDblInput";
import Button from "../components/Button";

export default function TestingPage() {
  return (
    <div>
      <h1>Testing Page</h1>
      <InputField
        label="Test Input Field"
        name="test"
        type="text"
        placeholder="placeholder"
      />
      <Button text="Test Button" />
    </div>
  );
}
