import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiUrl from '../config/url';
import { jwtDecode } from 'jwt-decode';
import "../components/Design/Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigate = useNavigate();

    const validateInput = () => {
        let isValid = true;

        if (!username.trim()) {
            setUsernameError("Username is required");
            isValid = false;
        } else {
            setUsernameError("");
        }

        if (!password) {
            setPasswordError("Password is required");
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            isValid = false;
        } else {
            setPasswordError("");
        }

        return isValid;
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateInput()) {
            return;
        }

        const response = await fetch(`${apiUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            const accessToken = data.accessToken;
            const decodedToken = jwtDecode(accessToken);
            const userId = decodedToken.sub;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("userId", userId);

            navigate("/movies");
        } else {
            setErrorMessage("Invalid username or password");
        }
    };

    return (
        <div className="login-container">
            <img
                src="movie.png"
                alt="Login illustration"
                className="login-image"
            />

            <div className="brand">
                Movies Reviews Platform
            </div>

            <form className="login-form" onSubmit={handleLogin}>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field"
                    />
                    {usernameError && <div className="error-text">{usernameError}</div>}
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />
                    {passwordError && <div className="error-text">{passwordError}</div>}
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
            <p className="register-link">
                Don't have an account? <a href="/register">Register</a>
            </p>
        </div>
    );
}

export default Login;
