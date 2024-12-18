import React, { useState } from "react";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { toast } from "react-toastify";
import styles from "./UserProfile.module.css";

const UserProfile = ({ user, onUpdatePassword }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthLabel, setPasswordStrengthLabel] = useState("Weak");
  const [passwordRules, setPasswordRules] = useState({
    hasLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const validatePasswordChange = () => {
    const validationErrors = {};

    // New Password validation (strong rules)
    if (!passwordData.newPassword) {
      validationErrors.newPassword = "New Password is required.";
    } else {
      const passwordRules = [];
      if (passwordData.newPassword.length < 8) {
        passwordRules.push("at least 8 characters");
      }
      if (!/[A-Z]/.test(passwordData.newPassword)) {
        passwordRules.push("one uppercase letter");
      }
      if (!/[0-9]/.test(passwordData.newPassword)) {
        passwordRules.push("one number");
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)) {
        passwordRules.push("one special character");
      }

      if (passwordRules.length > 0) {
        validationErrors.newPassword = `Password must include ${passwordRules.join(
          ", "
        )}.`;
      }
    }

    // Confirm Password validation
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      validationErrors.confirmNewPassword = "Passwords do not match.";
    }

    return validationErrors;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "newPassword") {
      const hasLength = value.length >= 8;
      const hasUppercase = /[A-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const strengthScore =
        (hasLength ? 25 : 0) +
        (hasUppercase ? 25 : 0) +
        (hasNumber ? 25 : 0) +
        (hasSpecialChar ? 25 : 0);

      setPasswordStrength(strengthScore);
      setPasswordRules({ hasLength, hasUppercase, hasNumber, hasSpecialChar });

      if (strengthScore < 50) {
        setPasswordStrengthLabel("Weak");
      } else if (strengthScore < 100) {
        setPasswordStrengthLabel("Good");
      } else {
        setPasswordStrengthLabel("Strong");
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validatePasswordChange();
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      toast.error("Please fix validation errors.");
      return;
    }

    try {
      await onUpdatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Reset form and clear validation
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordErrors({});
      setPasswordStrength(0);
      setPasswordStrengthLabel("Weak");
      setPasswordRules({
        hasLength: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
      setShowPasswordValidation(false);
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>User Profile</h1>
      </div>
      <div className={styles.profileDetails}>
        <div className={styles.detailGroup}>
          <h3>Personal Information</h3>
          <p>
            <strong>First Name:</strong> {user.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>
      <div className={styles.passwordSection}>
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordSubmit}>
          <InputField
            label="Current Password"
            type="password"
            name="currentPassword"
            placeholder="Enter current password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
          />
          <InputField
            label="New Password"
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            onFocus={() => setShowPasswordValidation(true)}
          />
          {passwordErrors.newPassword && (
            <p className={styles.errorText}>{passwordErrors.newPassword}</p>
          )}
          {showPasswordValidation && (
            <ul className={styles.passwordRules}>
              <li
                style={{
                  color: passwordStrengthLabel === "Weak" ? "red" : "green",
                }}
              >
                Password Strength: {passwordStrengthLabel}
              </li>
              <li style={{ color: passwordRules.hasLength ? "green" : "red" }}>
                {passwordRules.hasLength ? "✔" : "✖"} At least 8 characters
              </li>
              <li
                style={{ color: passwordRules.hasUppercase ? "green" : "red" }}
              >
                {passwordRules.hasUppercase ? "✔" : "✖"} One uppercase letter
              </li>
              <li style={{ color: passwordRules.hasNumber ? "green" : "red" }}>
                {passwordRules.hasNumber ? "✔" : "✖"} One number
              </li>
              <li
                style={{
                  color: passwordRules.hasSpecialChar ? "green" : "red",
                }}
              >
                {passwordRules.hasSpecialChar ? "✔" : "✖"} One special character
              </li>
            </ul>
          )}
          <InputField
            label="Confirm New Password"
            type="password"
            name="confirmNewPassword"
            placeholder="Confirm new password"
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
          />
          {passwordErrors.confirmNewPassword && (
            <p className={styles.errorText}>
              {passwordErrors.confirmNewPassword}
            </p>
          )}
          <Button type="submit" text="Update Password" />
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
