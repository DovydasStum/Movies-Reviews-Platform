import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiUrl from '../config/url';
import { jwtDecode } from 'jwt-decode'
import "../components/Design/Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Send login request to backend
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
            alert("Invalid credentials");
        }
    };

    return (
        <div className="login-container">
            <h1 className="login-heading">Login</h1>
            <form className="login-form" onSubmit={handleLogin}>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />
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
