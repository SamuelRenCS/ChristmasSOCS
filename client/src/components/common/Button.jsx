import React from "react";
import styles from "./Button.module.css";
export default function Button({ type, text, onClick, danger }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${danger ? styles.danger : ""}`}
    >
      {text}
    </button>
  );
}
