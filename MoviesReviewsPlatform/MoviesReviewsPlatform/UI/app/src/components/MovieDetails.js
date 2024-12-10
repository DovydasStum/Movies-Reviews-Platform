import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const MovieDetails = () => {
    const { movieId } = useParams();
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        // Fetch movie details and reviews from API
        const fetchMovieDetails = async () => {
            try {
                const movieResponse = await axios.get(`https://shark-app-ihz3p.ondigitalocean.app/api/movies/${movieId}`);
                setMovie(movieResponse.data);

                const reviewsResponse = await axios.get(`https://shark-app-ihz3p.ondigitalocean.app/api/movies/${movieId}/reviews`);
                setReviews(reviewsResponse.data);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        };
        fetchMovieDetails();
    }, [movieId]);

    return (
        <div>
            {movie && (
                <>
                    <h2>{movie.name}</h2>
                    <p>{movie.description}</p>
                    <h3>Reviews</h3>
                    {reviews.length === 0 ? (
                        <p>No reviews yet.</p>
                    ) : (
                        <ul>
                            {reviews.map((review) => (
                                <li key={review.id}>
                                    <Link to={`/reviews/${movieId}/${review.id}`}>{review.title}</Link> {/* Navigate to review details */}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default MovieDetails;
