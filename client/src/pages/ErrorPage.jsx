import React from "react";
import styles from "../styles/ErrorPage.module.css";

const ErrorPage = ({
  message = "An unexpected error occurred.",
  title = "Oops! Something went wrong",
  buttonText = "Go Back Home",
  onButtonClick,
}) => {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      // Default navigation (you'll need to implement this based on your routing)
      window.location.href = "/";
    }
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorBox}>
        <div className={styles.errorIcon}>!</div>

        <h1 className={styles.errorTitle}>{title}</h1>

        <p className={styles.errorMessage}>{message}</p>

        <button onClick={handleButtonClick} className={styles.errorButton}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
