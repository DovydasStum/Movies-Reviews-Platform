import React from 'react';
//import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';

import Login from './components/Login';  // Import Login from components folder
import Movies from './components/Movies';  // Import MoviesPage from components folder
import Register from './components/Register';


//function App() {
//  return (
//    <div className="App">
//      <header className="App-header">
//        <img src={logo} className="App-logo" alt="logo" />
//        <p>
//          Edit <code>src/App.js</code> and save to reload.
//        </p>
//        <a
//          className="App-link"
//          href="https://reactjs.org"
//          target="_blank"
//          rel="noopener noreferrer"
//        >
//          Learn React
//        </a>
//      </header>
//    </div>
//  );
//}

//export default App;

const App = () => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const loadMovies = async () => {
            const response = await axios.get('https://shark-app-ihz3p.ondigitalocean.app/api/movies');
            //const response = await axios.get('http://localhost:5072/api/movies');
            console.log(response.data);
            setMovies(response.data || []);
        };

        loadMovies();
    }, []);

    return (
        <>
            {/* Check if movies array is empty */}
            {movies.length === 0 ? (
                <p>No movies</p>
            ) : (
                // Render movies if available
                movies.map((movie, i) => (
                    <p key={i}>{movie.name} - {movie.description}</p>
                ))
            )}
        </>
    );
}

export default App;



//const App = () => {
//    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
//    const navigate = useNavigate();  // Hook to navigate between routes

//    // Effect to handle login status
//    useEffect(() => {
//        if (isLoggedIn) {
//            navigate('/movies');  // Redirect to movies page after login
//        } else {
//            navigate('/login');  // Ensure user stays on the login page if not logged in
//        }
//    }, [isLoggedIn, navigate]);

//    return (
//        <div>
//            <nav>
//                <Link to="/login">Login</Link> | <Link to="/movies">Movies</Link>
//            </nav>
//            <Routes>
//                <Route path="/login" element={<Login onLogin={setIsLoggedIn} />} />
//                <Route path="/movies" element={isLoggedIn ? <Movies /> : <Login onLogin={setIsLoggedIn} />} />
//                <Route path="/register" element={<Register />} />
//            </Routes>
//        </div>
//    );
//};

//export default App;

