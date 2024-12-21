// Contributors: Samuel Ren

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./AuthButtons.module.css";

const AuthButtons = ({ isAuthenticated, onLogout, onClose }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
    if (onClose) onClose();
  };

  const handleRegisterClick = () => {
    navigate("/register");
    if (onClose) onClose();
  };

  if (isAuthenticated) {
    return (
      <button className={styles.logoutButton} onClick={onLogout}>
        Logout
      </button>
    );
  }

  return (
    <div className={styles.authButtonContainer}>
      <button className={styles.loginButton} onClick={handleLoginClick}>
        Login
      </button>
      <button className={styles.registerButton} onClick={handleRegisterClick}>
        Register
      </button>
    </div>
  );
};

export default AuthButtons;
