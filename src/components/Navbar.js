// src/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav style={styles.navbar}>
            <h1 style={styles.logo}>CycleSecure</h1>
            <div style={styles.navLinks}>
                <Link to="/" style={styles.link}>Home</Link>
                <Link to="/accident-data" style={styles.link}>Accident Data</Link>
                <Link to="/route-map" style={styles.link}>Route Map</Link>
                <Link to="/route-plan" style={styles.link}>Route Plan</Link> {/* Add this line */}
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#333',
        color: '#fff',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 1000,
    },
    logo: {
        fontSize: '24px',
    },
    navLinks: {
        display: 'flex',
        gap: '15px',
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '18px',
    },
};

export default NavBar;
