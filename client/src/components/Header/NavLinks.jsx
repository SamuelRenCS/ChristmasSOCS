import React from "react";
import { Link } from "react-router-dom";
import styles from "./NavLinks.module.css";

const NavLinks = ({ links }) => {
  const linkClassName = styles.desktopLinkItem;

  return (
    <ul className={styles.desktopNavLinks}>
      {links.map((link) => (
        <li key={link.name} className={styles.navLinkItem}>
          <Link to={link.path} className={linkClassName}>
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;
