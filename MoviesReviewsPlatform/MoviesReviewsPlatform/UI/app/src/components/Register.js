import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import apiUrl from '../config/url';
import "../components/Design/Register.css";

const Register = ({ onRegister }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    const validateInputs = () => {
        const errors = {};

        // Username validation
        if (username.length < 3) {
            errors.username = "Username must be at least 3 characters long.";
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = "Invalid email format.";
        }

        // Password validation
        if (password.length < 8) {
            errors.password = "Password must be at least 8 characters long.";
        } else if (!/[A-Z]/.test(password)) {
            errors.password = "Password must contain at least one uppercase letter.";
        } else if (!/[a-z]/.test(password)) {
            errors.password = "Password must contain at least one lowercase letter.";
        } else if (!/[0-9]/.test(password)) {
            errors.password = "Password must contain at least one number.";
        } else if (!/[!@#$%^&*]/.test(password)) {
            errors.password = "Password must contain at least one special character.";
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateInputs()) {
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/accounts`, {
                username,
                email,
                password
            });

            const data = response.data;
            console.log(data);

            navigate("/login");
        } catch (err) {
            setError('Registration failed. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="register-container">
            <h1 className="register-heading">Create an account</h1>
            <form className="register-form" onSubmit={handleRegister}>
                <div className="input-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="input-field"
                    />
                    {validationErrors.username && <p className="error-message">{validationErrors.username}</p>}
                </div>
                <div className="input-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input-field"
                    />
                    {validationErrors.email && <p className="error-message">{validationErrors.email}</p>}
                </div>
                <div className="input-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input-field"
                    />
                    {validationErrors.password && <p className="error-message">{validationErrors.password}</p>}
                </div>
                <div className="input-group">
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="input-field"
                    />
                    {validationErrors.confirmPassword && <p className="error-message">{validationErrors.confirmPassword}</p>}
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="register-button">Register</button>
            </form>
            <p className="login-link">
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    );
};

export default Register;
