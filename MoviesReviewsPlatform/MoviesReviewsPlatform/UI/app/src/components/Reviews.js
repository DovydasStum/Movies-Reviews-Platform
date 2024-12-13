import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import "../components/Design/Reviews.css";
import Footer from "../components/Footer";
import apiUrl from "../config/url";

const Reviews = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [reviewData, setReviewData] = useState({
        text: "",
        evaluation: 0,
    });

    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (token) {
            loadReviews();
        } else {
            console.error("No access token found. Please log in.");
            navigate("/login");
        }
    }, [movieId, token]);

    const loadReviews = async () => {
        try {
            const response = await axios.get(
                `${apiUrl}/movies/${movieId}/reviews`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setReviews(response.data || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${apiUrl}/movies/${movieId}/reviews/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            loadReviews();
        } catch (error) {
            console.error("Error deleting review:", error);
        }
    };

    const handleSave = async () => {
        // Validate if the review text is empty
        if (!reviewData.text.trim()) {
            alert("Review cannot be empty! Please write a review.");
            return;
        }

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

            loadReviews();
            setShowModal(false);
            setReviewData({
                text: "",
                evaluation: 0,
            });
        } catch (error) {
            console.error("Error saving review:", error);
        }
    };

    const handleEdit = (review) => {
        setCurrentReview(review);
        setReviewData({ text: review.text, evaluation: review.evaluation });
        setShowModal(true);
    };

    const handleCreate = () => {
        setCurrentReview(null);
        setReviewData({
            text: "",
            evaluation: 0,
        });
        setShowModal(true);
    };

    return (
        <div className="container">
            <Header />
            <div className="reviewsHeader">
                <h2 className="heading">Reviews for movie {movieId}</h2>
                <button className="createButton" onClick={handleCreate}>
                    Write Review
                </button>
            </div>
            {reviews.length === 0 ? (
                <p className="noReviews">No reviews yet.</p>
            ) : (
                <div className="reviewsList">
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
                                    View comments
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
            <Footer />
        </div>
    );
};

export default Reviews;
