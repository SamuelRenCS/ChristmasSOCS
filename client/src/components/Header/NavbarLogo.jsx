// Contributors: Samuel Ren

import React, { useState } from "react";
import logoSrc from "../../assets/logo.svg";
import styles from "./NavbarLogo.module.css";
import { Link } from "react-router-dom";

const NavbarLogo = () => {
  return (
    <div className={styles.logoContainer}>
      <Link to="/">
        <img src={logoSrc} alt="Logo" className={styles.logoImage} />
      </Link>
    </div>
  );
};

export default NavbarLogo;
