import React, { useState } from 'react';
import logoSrc from '../../assets/logo.svg';
import styles from './NavbarLogo.module.css';

const NavbarLogo = () => {

    return (
    <div className={styles.logoContainer}>
        
        <a href="/">
        <img src={logoSrc} alt="Logo" className={styles.logoImage} />
        </a>
    </div>
    )
    
}


export default NavbarLogo;