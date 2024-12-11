import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import apiUrl from "../config/url";
import Header from "../components/Header";
import "../components/Design/Movies.css";

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentMovie, setCurrentMovie] = useState(null);
    const [movieData, setMovieData] = useState({
        name: "",
        description: "",
        director: "",
        actors: "",
        releaseYear: "",
        duration: "",
        genre: "",
    });

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        loadMovies();
    }, []);

    const loadMovies = async () => {
        try {
            const response = await axios.get(`${apiUrl}/movies`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the Authorization header
                },
            });
            setMovies(response.data || []);
        } catch (error) {
            console.error("Error fetching movies:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${apiUrl}/movies/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the Authorization header
                },
            });
            loadMovies();
        } catch (error) {
            console.error("Error deleting movie:", error);
        }
    };

    const handleSave = async () => {
        try {
            // Ensure duration is formatted as "hh:mm:ss"
            const formattedDuration = formatDuration(movieData.duration);

            const moviePayload = { ...movieData, duration: formattedDuration, userId };
            console.log("payload: ", moviePayload);

            if (currentMovie) {
                // Update movie
                await axios.put(`${apiUrl}/movies/${currentMovie.id}`, moviePayload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                // Create new movie
                await axios.post(`${apiUrl}/movies`, moviePayload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            loadMovies();
            setShowModal(false);
            setMovieData({
                name: "",
                description: "",
                director: "",
                actors: "",
                releaseYear: "",
                duration: "",
                genre: "",
            });
        } catch (error) {
            console.error("Error saving movie:", error);
        }
    };

    const handleEdit = (movie) => {
        setCurrentMovie(movie);
        setMovieData(movie);
        setShowModal(true);
    };

    const handleCreate = () => {
        setCurrentMovie(null);
        setMovieData({
            name: "",
            description: "",
            director: "",
            actors: "",
            releaseYear: "",
            duration: "",
            genre: "",
        });
        setShowModal(true);
    };

    // Helper function to format duration into "hh:mm:ss"
    const formatDuration = (duration) => {
        // Assuming user input is in "hh:mm:ss" format already
        const timeParts = duration.split(":");
        if (timeParts.length === 2) {
            return `${timeParts[0]}:${timeParts[1]}:00`; // Assumes "mm:ss" format, add seconds as 00
        } else if (timeParts.length === 3) {
            return duration; // Valid "hh:mm:ss" format
        }
        return "00:00:00"; // Default if input is invalid
    };

    return (
        <div className="container">
            <Header />
            <div className="moviesHeader">
                <h2 className="heading">Movies List</h2>
                <button className="createButton" onClick={handleCreate}>
                    Add New Movie
                </button>
            </div>
            {movies.length === 0 ? (
                <p className="noMovies">No movies available</p>
            ) : (
                <div className="moviesGrid">
                    {movies.map((movie) => (
                        <div key={movie.id} className="movieCard">
                            <h3 className="movieTitle">{movie.name}</h3>
                            <p className="movieProperty">
                                <strong>Description:</strong> {movie.description}
                            </p>
                            <p className="movieProperty">
                                <strong>Director:</strong> {movie.director}
                            </p>
                            <p className="movieProperty">
                                <strong>Actors:</strong> {movie.actors}
                            </p>
                            <p className="movieProperty">
                                <strong>Release Year:</strong> {movie.releaseYear}
                            </p>
                            <p className="movieProperty">
                                <strong>Duration:</strong> {movie.duration}
                            </p>
                            <p className="movieProperty">
                                <strong>Genre:</strong> {movie.genre}
                            </p>
                            <div className="buttonGroup">
                                <button onClick={() => handleEdit(movie)} className="editButton">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(movie.id)} className="deleteButton">
                                    Delete
                                </button>
                                <Link to={`/movies/${movie.id}/reviews`} className="viewReviewsButton">
                                    View Reviews
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal">
                    <div className="modalContent">
                        <h3>{currentMovie ? "Edit Movie" : "Add New Movie"}</h3>
                        <input
                            type="text"
                            placeholder="Name"
                            value={movieData.name}
                            onChange={(e) => setMovieData({ ...movieData, name: e.target.value })}
                            className="modalInput"
                        />
                        <textarea
                            placeholder="Description"
                            value={movieData.description}
                            onChange={(e) => setMovieData({ ...movieData, description: e.target.value })}
                            className="modalInput"
                        ></textarea>
                        <input
                            type="text"
                            placeholder="Director"
                            value={movieData.director}
                            onChange={(e) => setMovieData({ ...movieData, director: e.target.value })}
                            className="modalInput"
                        />
                        <input
                            type="text"
                            placeholder="Actors"
                            value={movieData.actors}
                            onChange={(e) => setMovieData({ ...movieData, actors: e.target.value })}
                            className="modalInput"
                        />
                        <input
                            type="number"
                            placeholder="Release Year"
                            value={movieData.releaseYear}
                            onChange={(e) => setMovieData({ ...movieData, releaseYear: e.target.value })}
                            className="modalInput"
                        />
                        <input
                            type="text"
                            placeholder="Duration (hh:mm:ss)"
                            value={movieData.duration}
                            onChange={(e) => setMovieData({ ...movieData, duration: e.target.value })}
                            className="modalInput"
                        />
                        <input
                            type="text"
                            placeholder="Genre"
                            value={movieData.genre}
                            onChange={(e) => setMovieData({ ...movieData, genre: e.target.value })}
                            className="modalInput"
                        />
                        <div className="modalButtons">
                            <button onClick={handleSave} className="saveButton">
                                Save
                            </button>
                            <button onClick={() => setShowModal(false)} className="cancelButton">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Movies;
