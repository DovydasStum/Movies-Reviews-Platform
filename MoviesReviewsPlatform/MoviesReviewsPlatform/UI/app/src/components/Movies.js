import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Movies = () => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const loadMovies = async () => {
            try {
                //const response = await axios.get('https://shark-app-ihz3p.ondigitalocean.app/api/movies');
                const response = await axios.get('http://localhost:5432/api/movies');
                setMovies(response.data.resource || []);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        loadMovies();
    }, []);

    return (
        <div>
            <h2>Movies</h2>
            {movies.length === 0 ? (
                <p>No movies available</p>
            ) : (
                movies.map((movie, index) => (
                    <p key={index}>{movie.name} - {movie.description}</p>
                ))
            )}
        </div>
    );
};

export default Movies;
