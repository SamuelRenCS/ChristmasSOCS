import React from 'react';
import NavLinks from './NavLinks';
import AuthButtons from './AuthButtons';
import styles from './MobileMenu.module.css';

const MobileMenu = ({ links, isAuthenticated, onClose, onLogout }) => {
  return (
    <div className={styles.mobileMenu}>
      <button 
        className={styles.closeButton} 
        onClick={onClose}
      >
        &times;
      </button>
      <NavLinks links={links} isMobile={true} />
      <div className={styles.mobileAuthContainer}>
        <AuthButtons 
          isAuthenticated={isAuthenticated} 
          onLogout={() => {
            onLogout();
            onClose();
          }} 
        />
      </div>
    </div>
  );
};

export default MobileMenu;