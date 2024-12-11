import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Movies from "./components/Movies";
import Reviews from "./components/Reviews";
import Comments from "./components/Comments";

// Helper function to check if the user is logged in
const isAuthenticated = () => {
    // Check for the access token in localStorage (or sessionStorage)
    return !!localStorage.getItem("accessToken");
};

// Protected Route component
const ProtectedRoute = ({ element, ...rest }) => {
    return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Login and Register pages are accessible to anyone */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/movies" element={<ProtectedRoute element={<Movies />} />} />
            <Route path="/movies/:movieId/reviews" element={<ProtectedRoute element={<Reviews />} />} />
            <Route path="/movies/:movieId/reviews/:reviewId/comments" element={<ProtectedRoute element={<Comments />} />} />
        </Routes>
    );
}

export default App;
