import React, { useState } from "react";
import { register } from "../api/api.js";
import "../styles/Login.css";
//import mcgillImage from './images/mcgill.jpg';
import Input from "../components/Input";
import Button from "../components/Button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const validationErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      validationErrors.firstName = "First Name is required.";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      validationErrors.lastName = "Last Name is required.";
    }

    // Email validation
    if (!formData.email.trim()) {
      validationErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Email is invalid.";
    }

    // Password validation
    if (!formData.password) {
      validationErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters.";
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      validationErrors.password = "Password must include at least one special character.";
    }

    // Confirm Password validation
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    return validationErrors;
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix validation errors.");
      return;
    }

    setErrors({}); // Clear errors if validation passes


    // basic client-side validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    console.log("Form submitted:", formData);

    try {
      const response = await register(formData);

      // Registration successful show toast notification
      toast.success(response.message);

      // redirect to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 200);
    } catch (error) {
      // show toast notification for error
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 style={{ margin: "0px", padding: "0px" }}>Create an Account</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row" style={{ display: "flex", gap: "10px" }}>
            <Input
              label="First Name"
              type="text"
              name="firstName"
              placeholder="Enter first name"
              formType="register"
              onChange={handleChange}
            />
            {errors.firstName && (
                <p className="error-text">{errors.firstName}</p>
            )}
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              placeholder="Enter last name"
              formType="register"
              onChange={handleChange}
            />
            {errors.lastName && (
                <p className="error-text">{errors.lastName}</p>
            )}
          </div>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Enter email"
            formType="register"
            onChange={handleChange}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter password"
            formType="register"
            onChange={handleChange}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter password"
            formType="register"
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword}</p>
          )}
          <Button type="submit" text="Register" />
        </form>
      </div>
      {/* <div className="image-box">
                       <img src={mcgillImage} alt="McGill Campus" />
                     </div> */}
    </div>
  );
}

export default Registration;
