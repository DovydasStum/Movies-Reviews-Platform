import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Design/Header.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();

        navigate("/login");
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* Vectoric icon */}
                <div className="brand">
                    <FontAwesomeIcon icon={faFilm} className="brand-icon" />
                    Movies Reviews Platform
                </div>

                {/* Desktop Menu */}
                <nav className="menu desktop">
                    <a href="/movies" className="menu-link">Home</a>
                    <button onClick={handleLogout} className="logoutButton">
                        Logout
                    </button>
                </nav>

                {/* Hamburger Icon (Mobile) */}
                <div className="hamburger mobile" onClick={toggleMenu}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="mobile-menu">
                    <a href="/movies" className="menu-link">Home</a>
                    <button onClick={handleLogout} className="logoutButton">
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;
