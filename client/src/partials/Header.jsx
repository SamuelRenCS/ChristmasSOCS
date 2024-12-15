import React, { useState } from "react";
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

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Meetings", path: "/meetings" },
    { name: "Private", path: "/private" },
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
            <NavLinks links={navLinks} />
            <AuthButtons
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
            />
          </div>

          {/* for mobile view */}
          <button
            className={styles.mobileMenuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰
          </button>

          {isMobileMenuOpen && (
            <MobileMenu
              links={navLinks}
              isAuthenticated={isAuthenticated}
              onClose={() => setIsMobileMenuOpen(false)}
              onLogout={handleLogout}
            />
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
