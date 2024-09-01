import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

export default function Navbar() {
    return (
        <div className="navbar-main">
            <nav className="navbar">
                <div className="navbar-logo">
                    <img src="/festiverse-logo.png" alt="festiverse-logo" />
                </div>
                <ul className="navbar-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/events">Events</Link></li>
                    <li><Link to="/contactus">Contact</Link></li>
                </ul>
                <div className="navbar-actions">
                    <Link to="/login" className="action-btn">Log In</Link> {/* Updated Link */}
                    <Link to="/signup" className="action-btn signup-btn">Sign Up</Link> {/* Updated Link */}
                </div>
            </nav>
        </div>
    );
}
