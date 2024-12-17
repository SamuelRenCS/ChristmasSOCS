import React from "react";
import styles from "./Description.module.css"; // Import the CSS module
import Button from "./Button";

const Description = ({ image, title, text, reverse = false }) => {
  return (
    <div className={`${styles.descriptionSection} ${reverse ? styles.reverseOrder : ""}`}>
      {/* Left Side - Image */}
      <div className={styles.descriptionImage}>
        <img src={image} alt="Team projects overview" />
      </div>

      {/* Right Side - Text */}
      <div className={styles.descriptionContent}>
        <h2>{title}</h2>
        <p>{text}</p>
        <button className={styles.ctaButton}>Get Started →</button>
    
      </div>
    </div>
    
    
  );
}

export default Description;
