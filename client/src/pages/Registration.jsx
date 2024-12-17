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
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showStrengthBar, setShowStrengthBar] = useState(false);


  const validate = () => {
    const validationErrors = {};
  
    // First Name validation (only letters, no numbers/symbols)
    if (!formData.firstName.trim()) {
      validationErrors.firstName = "First Name is required.";
    } else if (!/^[A-Za-z]+$/.test(formData.firstName.trim())) {
      validationErrors.firstName = "First Name must only contain letters.";
    }
  
    // Last Name validation (only letters, no numbers/symbols)
    if (!formData.lastName.trim()) {
      validationErrors.lastName = "Last Name is required.";
    } else if (!/^[A-Za-z]+$/.test(formData.lastName.trim())) {
      validationErrors.lastName = "Last Name must only contain letters.";
    }
  
    // Email validation (valid email structure)
    if (!formData.email.trim()) {
        validationErrors.email = "Email is required.";
      } else if (!/^[\w\.-]+@(mail\.mcgill\.ca|mcgill\.ca)$/.test(formData.email)) {
        validationErrors.email = "Email must be a valid McGill email (e.g., @mail.mcgill.ca or @mcgill.ca).";
      }
  
    // Password validation (strong rules)
    if (!formData.password) {
      validationErrors.password = "Password is required.";
    } else {
      const passwordRules = [];
      if (formData.password.length < 8) {
        passwordRules.push("at least 8 characters");
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordRules.push("one uppercase letter");
      }
      if (!/[a-z]/.test(formData.password)) {
        passwordRules.push("one lowercase letter");
      }
      if (!/[0-9]/.test(formData.password)) {
        passwordRules.push("one number");
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        passwordRules.push("one special character");
      }
  
      if (passwordRules.length > 0) {
        validationErrors.password = `Password must include ${passwordRules.join(", ")}.`;
      }
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
    if (name === "password") {
        let score = 0;
        setShowStrengthBar(true);
    
        if (value.length >= 8) score += 25; 
        if (/[A-Z]/.test(value)) score += 25; 
        if (/[0-9]/.test(value)) score += 25; 
        if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score += 25; 
    
        setPasswordStrength(score);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    console.log(validationErrors);
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
        <h2 >Create an Account</h2>
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
            
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              placeholder="Enter last name"
              formType="register"
              onChange={handleChange}
            />
            
          </div>
          {errors.firstName && (
                <p className="error-text">{errors.firstName}</p>
            )}
            {errors.lastName && (
                <p className="error-text">{errors.lastName}</p>
            )}
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
          {showStrengthBar && (
          <div className="password-strength-bar">
            <div
                className="progress"
                style={{
                width: `${passwordStrength}%`,
                backgroundColor:
                    passwordStrength < 50
                    ? "red"
                    : passwordStrength < 75
                    ? "orange"
                    : "green",
                }}
            ></div>
          </div>
            )}
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
