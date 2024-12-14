import React from "react";
import { Link } from "react-router-dom";
import styles from "./AuthButtons.module.css";

const AuthButtons = ({ isAuthenticated, onLogout }) => {
  if (isAuthenticated) {
    return (
      <button className={styles.logoutButton} onClick={onLogout}>
        Logout
      </button>
    );
  }

  return (
    <div className={styles.authButtonContainer}>
      <Link to="/login" className={styles.loginButton}>
        Login
      </Link>
      <Link to="/register" className={styles.registerButton}>
        Register
      </Link>
    </div>
  );
};

export default AuthButtons;
