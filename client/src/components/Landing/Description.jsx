// Contributors: Shotaro Nakamura

import React from "react";
import styles from "./Description.module.css"; // Import the CSS module

const Description = ({
  image,
  title,
  text,
  reverse = false,
  display,
  onClick,
}) => {
  const flexDirection =
    window.innerWidth <= 768 ? "column" : reverse ? "row-reverse" : "row";

  return (
    <div
      className={`${styles.descriptionSection} ${
        reverse ? styles.reverseOrder : ""
      }`}
      style={{ flexDirection }}
    >
      {/* Left Side - Image */}
      <div className={styles.descriptionImage}>
        <img src={image} alt="Team projects overview" />
      </div>

      {/* Right Side - Text */}
      <div className={styles.descriptionContent}>
        <h2>{title}</h2>
        <p>{text}</p>
        <button className={styles.ctaButton} onClick={onClick} style={display}>
          Get Started →
        </button>
      </div>
    </div>
  );
};

export default Description;
