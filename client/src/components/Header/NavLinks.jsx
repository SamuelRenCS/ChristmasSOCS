import React from 'react';
import styles from './NavLinks.module.css';

const NavLinks = ({ links, isMobile = false }) => {
  const linkClassName = isMobile ? styles.mobileLinkItem : styles.desktopLinkItem;

  return (
    <ul className={isMobile ? styles.mobileNavLinks : styles.desktopNavLinks}>
      {links.map((link) => (
        <li key={link.name} className={styles.navLinkItem}>
          <a 
            href={link.href} 
            className={linkClassName}
          >
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;