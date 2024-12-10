import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Reviews = () => {
    const { movieId } = useParams();
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        // Fetch reviews for the specific movie
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`https://shark-app-ihz3p.ondigitalocean.app/api/movies/${movieId}/reviews`);
                setReviews(response.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };
        fetchReviews();
    }, [movieId]);

    return (
        <div>
            <h2>Reviews for Movie {movieId}</h2>
            {reviews.length === 0 ? (
                <p>No reviews yet.</p>
            ) : (
                <ul>
                    {reviews.map((review) => (
                        <li key={review.id}>
                            <Link to={`/comments/${review.id}`}>{review.title}</Link> {/* Navigate to review comments */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Reviews;
