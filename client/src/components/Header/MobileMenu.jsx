// Contributors: Samuel Ren

import React from "react";
import { useNavigate } from "react-router-dom";
import NavLinks from "./NavLinks";
import AuthButtons from "./AuthButtons";
import styles from "./MobileMenu.module.css";

const MobileMenu = ({ links, isAuthenticated, onClose, onLogout }) => {
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className={styles.mobileMenu}>
      {isAuthenticated && (
        <div className={styles.mobileLinks}>
          <NavLinks
            links={links}
            isMobile={true}
            onLinkClick={handleLinkClick}
          />
        </div>
      )}

      <div className={styles.mobileAuthContainer}>
        <AuthButtons
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default MobileMenu;
