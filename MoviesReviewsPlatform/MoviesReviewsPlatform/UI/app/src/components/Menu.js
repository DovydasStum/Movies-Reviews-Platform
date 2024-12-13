import React, { useState } from "react";

function Menu() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="menu">
            <div className="menu-container">
                <div className="menu-logo">Home</div>
                <div className="menu-links desktop">
                    <a href="/movies" className="menu-link">Home</a>
                </div>
                <div className="hamburger mobile" onClick={toggleMenu}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </div>
            {isOpen && (
                <div className="mobile-menu">
                    <a href="/movies" className="menu-link">Home</a>
                </div>
            )}
        </nav>
    );
}

export default Menu;
