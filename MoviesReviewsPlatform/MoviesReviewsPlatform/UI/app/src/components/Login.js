import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Register from './Register';
import { Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const apiUrl = process.env.REACT_APP_API_URL;

        try {
            const response = await axios.post(`${apiUrl}/api/login`, {
                username,
                password,
            });

            // On successful login, store the access token and navigate to the dashboard or home page
            localStorage.setItem('accessToken', response.data.accessToken);
            navigate('/dashboard'); // Replace with your desired route
        } catch (err) {
            setError('Login failed. Please try again.');
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Login</button>
            </form>

            {/* Register Link/Button */}
            <div>
                <p>
                    Don't have an account?
                    {/* Use Link to navigate to the Register page */}
                    <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
