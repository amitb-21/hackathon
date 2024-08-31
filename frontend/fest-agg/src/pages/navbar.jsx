import React from 'react';
import './navbar.css';

export default function Navbar() {
    return (
        <div className="navbar-main">
            <nav className="navbar">
                <div className="navbar-logo">
                    <img src="/festiverse-logo.png"  alt="festiverse-logo" />
                </div>
                <ul className="navbar-links">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#event">Event</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
                <div className="navbar-actions">
                    <a href="#login" className="action-btn">Log In</a>
                    <a href="#signup" className="action-btn signup-btn">Sign Up</a>
                </div>
            </nav>
        </div>
    );
}
