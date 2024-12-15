import React from "react";
import styles from "./Footer.module.css";

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.linksBlock}>
      <div className={styles.footerSection}>
        <h4>Quick Links</h4>
        <ul className={styles.footerList}>
          <li>
            <a
              className={styles.footerLink}
              href="https://www.cs.mcgill.ca/about/facilities/"
            >
              Facilities
            </a>
          </li>
          <li>
            <a
              className={styles.footerLink}
              href="https://www.cs.mcgill.ca/about/"
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>
      <div className={styles.footerSection}>
        <h4>Explore</h4>
        <ul className={styles.footerList}>
          <li>
            <a
              className={styles.footerLink}
              href="https://www.cs.mcgill.ca/news/"
            >
              News
            </a>
          </li>
          <li>
            <a
              className={styles.footerLink}
              href="https://www.cs.mcgill.ca/events/"
            >
              Events
            </a>
          </li>
          <li>
            <a
              className={styles.footerLink}
              href="https://www.cs.mcgill.ca/employment/faculty/"
            >
              Careers
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className={styles.footerCredits}>
      <p>© McGill University 2024</p>
    </div>
  </footer>
);

export default Footer;
