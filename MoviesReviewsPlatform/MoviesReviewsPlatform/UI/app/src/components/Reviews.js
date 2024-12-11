import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import "../components/Design/Reviews.css";
import apiUrl from "../config/url";

const Reviews = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentReview, setCurrentReview] = useState(null); // For editing a review
    const [reviewData, setReviewData] = useState({
        text: "",
        evaluation: 0, // Range: 1-5
    });

    const token = localStorage.getItem("accessToken"); // Get token from localStorage

    useEffect(() => {
        if (token) {
            loadReviews();
        } else {
            console.error("No access token found. Please log in.");
            navigate("/login"); // Redirect to login if token is not found
        }
    }, [movieId, token]);

    // Load reviews for the movie
    const loadReviews = async () => {
        try {
            const response = await axios.get(
                `${apiUrl}/movies/${movieId}/reviews`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the Authorization header with the token
                    },
                }
            );
            setReviews(response.data || []); // Set reviews data or an empty array if not available

        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    // Handle deleting a review
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${apiUrl}/movies/${movieId}/reviews/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the Authorization header with the token
                },
            });
            loadReviews(); // Reload the reviews after deletion
        } catch (error) {
            console.error("Error deleting review:", error);
        }
    };

    // Handle saving a new or updated review
    const handleSave = async () => {
        try {
            const reviewPayload = { ...reviewData, date: new Date().toISOString() };

            if (currentReview) {
                // Update review
                await axios.put(
                    `${apiUrl}/movies/${movieId}/reviews/${currentReview.id}`,
                    reviewPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else {
                // Create new review
                await axios.post(
                    `${apiUrl}/movies/${movieId}/reviews`,
                    reviewPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            loadReviews(); // Reload reviews after saving
            setShowModal(false); // Close modal
            setReviewData({
                text: "",
                evaluation: 0,
            });
        } catch (error) {
            console.error("Error saving review:", error);
        }
    };

    // Handle editing a review
    const handleEdit = (review) => {
        setCurrentReview(review);
        setReviewData({ text: review.text, evaluation: review.evaluation });
        setShowModal(true);
    };

    // Handle creating a new review
    const handleCreate = () => {
        setCurrentReview(null); // Reset current review
        setReviewData({
            text: "",
            evaluation: 0,
        });
        setShowModal(true); // Show modal for creating a review
    };

    return (
        <div className="container">
            <Header />
            <div className="reviewsHeader">
                <h2 className="heading">Reviews for Movie {movieId}</h2>
                <button className="createButton" onClick={handleCreate}>
                    Write Review
                </button>
            </div>
            {reviews.length === 0 ? (
                <p className="noReviews">No reviews yet.</p>
            ) : (
                <div className="reviewsGrid">
                    {reviews.map((review, index) => (
                        <div key={review.id || index} className="reviewCard">
                            <p className="reviewDate">
                                Date: {new Date(review.date).toLocaleDateString()}
                            </p>
                            <p className="reviewText">{review.text}</p>
                            <p className="reviewEvaluation">
                                Evaluation: {review.evaluation}/5
                            </p>
                            <div className="buttonGroup">
                                <button
                                    onClick={() => handleEdit(review)}
                                    className="editButton"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="deleteButton"
                                >
                                    Delete
                                </button>
                                <Link
                                    to={`/movies/${movieId}/reviews/${review.id}/comments`}
                                    className="commentsButton"
                                >
                                    Comments
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal">
                    <div className="modalContent">
                        <h3>{currentReview ? "Edit Review" : "Write a Review"}</h3>
                        <textarea
                            placeholder="Your review"
                            value={reviewData.text}
                            onChange={(e) =>
                                setReviewData({ ...reviewData, text: e.target.value })
                            }
                            className="modalInput"
                        ></textarea>
                        <input
                            type="number"
                            placeholder="Evaluation (1-5)"
                            min="1"
                            max="5"
                            value={reviewData.evaluation}
                            onChange={(e) =>
                                setReviewData({
                                    ...reviewData,
                                    evaluation: parseInt(e.target.value, 10),
                                })
                            }
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

export default Reviews;
