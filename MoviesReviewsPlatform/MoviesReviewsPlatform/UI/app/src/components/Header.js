import React from "react";
import { useNavigate } from "react-router-dom";
import "../components/Design/Header.css";

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();

        navigate("/login");
    };

    return (
        <header className="header">
            <div className="brand">My Movies App</div>
            <nav>
                <button onClick={handleLogout} className="logoutButton">
                    Logout
                </button>
            </nav>
        </header>
    );
};

export default Header;
