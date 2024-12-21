// Contributors: Samuel Ren

import React, { useState, useEffect } from "react";
import NavbarLogo from "../components/Header/NavbarLogo";
import NavLinks from "../components/Header/NavLinks";
import AuthButtons from "../components/Header/AuthButtons";
import MobileMenu from "../components/Header/MobileMenu";
import styles from "./Header.module.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Header = ({ hidden = false, isAppearable = false }) => {
  const { isAuthenticated, logout } = useAuth(); // Get directly from context

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check screen size and update mobile view state
  useEffect(() => {
    const checkScreenSize = () => {
      // Typical mobile breakpoint, adjust as needed
      setIsMobileView(window.innerWidth <= 1184);

      // Close mobile menu if screen becomes larger
      if (window.innerWidth > 1184) {
        setIsMobileMenuOpen(false);
      }
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup event listener
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "New Meeting", path: "/meetings/new" },
  ];

  const handleLogout = () => {
    logout(); // Clear authentication
  };

  return (
    <header>
      <nav
        className={`${styles.navbar} ${hidden ? styles.hidden : ""} ${
          isAppearable ? styles.appearable : ""
        }`}
      >
        <div className={styles.navbarContent}>
          <NavbarLogo />

          <div className={styles.desktopNavigation}>
            {isAuthenticated && <NavLinks links={navLinks} />}
            <AuthButtons
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
            />
          </div>

          {/* Mobile menu toggle - only show if in mobile view */}
          {isMobileView && (
            <button
              className={styles.mobileMenuToggle}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              ☰
            </button>
          )}
        </div>
      </nav>
      {/* Mobile menu - only render if in mobile view and menu is open */}
      {isMobileView && isMobileMenuOpen && (
        <MobileMenu
          links={navLinks}
          isAuthenticated={isAuthenticated}
          onClose={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
};

export default Header;
