//import React from 'react';
//import ReactDOM from 'react-dom/client';
//import './index.css';
//import App from './App';
//import reportWebVitals from './reportWebVitals';

//const root = ReactDOM.createRoot(document.getElementById('root'));
//root.render(
//  <React.StrictMode>
//    <App />
//  </React.StrictMode>
//);

//// If you want to start measuring performance in your app, pass a function
//// to log results (for example: reportWebVitals(console.log))
//// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App'; // Home Page or main component for all routes
import Login from './components/Login'; // Login page component
import Movies from './components/Movies'; // Movies listing page
import MovieDetails from './components/MovieDetails'; // Movie details page (Reviews)
import Reviews from './components/Reviews'; // Reviews page
import Comments from './components/Comments'; // Comments page
import { BrowserRouter } from 'react-router-dom';

//const root = ReactDOM.createRoot(document.getElementById('root'));
//root.render(
//    <React.StrictMode>
//        <Router>
//            <Routes>
//                {/* Public Routes */}
//                <Route path="/login" element={<Login />} />  {/* Login page route */}

//                {/* Protected Routes (after login) */}
//                <Route path="/" element={<App />}>
//                    <Route path="movies" element={<Movies />} />  {/* Movies page */}
//                    <Route path="movies/:movieId" element={<MovieDetails />} />  {/* Movie details page */}
//                    <Route path="reviews/:movieId" element={<Reviews />} />  {/* Reviews page */}
//                    <Route path="comments/:reviewId" element={<Comments />} />  {/* Comments page */}
//                </Route>
//            </Routes>
//        </Router>
//    </React.StrictMode>
//);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

