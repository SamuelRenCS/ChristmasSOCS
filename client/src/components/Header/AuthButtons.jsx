import React from 'react';
import styles from './AuthButtons.module.css';

const AuthButtons = ({ isAuthenticated, onLogout }) => {
  if (isAuthenticated) {
    return (
      <button 
        className={styles.logoutButton}
        onClick={onLogout}
      >
        Logout
      </button>
    );
  }

  return (
    <div className={styles.authButtonContainer}>
      <a href="/login" className={styles.loginButton}>
        Login
      </a>
      <a href="/register" className={styles.registerButton}>
        Register
      </a>
    </div>
  );
};

export default AuthButtons;