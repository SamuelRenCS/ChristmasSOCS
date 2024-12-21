// Contributors: Samuel Ren

import React from "react";
import { Link } from "react-router-dom";
import styles from "./NavLinks.module.css";

const NavLinks = ({ links, isMobile = false, onLinkClick }) => {
  const linkClassName = isMobile
    ? styles.mobileLinkItem
    : styles.desktopLinkItem;

  const navLinksClassName = isMobile
    ? styles.mobileNavLinks
    : styles.desktopNavLinks;

  // If mobile and onLinkClick is provided, use it
  const handleClick =
    isMobile && onLinkClick ? (path) => () => onLinkClick(path) : undefined;

  return (
    <ul className={navLinksClassName}>
      {links.map((link) => (
        <li key={link.name} className={styles.navLinkItem}>
          {isMobile ? (
            <div onClick={handleClick(link.path)} className={linkClassName}>
              {link.name}
            </div>
          ) : (
            <Link to={link.path} className={linkClassName}>
              {link.name}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;
