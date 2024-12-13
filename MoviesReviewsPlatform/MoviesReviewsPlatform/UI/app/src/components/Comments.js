import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import apiUrl from "../config/url";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../components/Design/Comments.css";

const Comments = () => {
    const { movieId, reviewId } = useParams();
    const [comments, setComments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentComment, setCurrentComment] = useState(null);
    const [commentData, setCommentData] = useState({ text: "" });

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchComments();
    }, [movieId, reviewId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${apiUrl}/movies/${movieId}/reviews/${reviewId}/comments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setComments(response.data || []);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${apiUrl}/movies/${movieId}/reviews/${reviewId}/comments/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchComments();
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleSave = async () => {
        // Validate if the comment text is empty
        if (!commentData.text.trim()) {
            alert("Comment cannot be empty! Please write something.");
            return;
        }

        try {
            if (currentComment) {
                // Updating an existing comment
                await axios.put(`${apiUrl}/movies/${movieId}/reviews/${reviewId}/comments/${currentComment.id}`, commentData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                // Creating a new comment
                await axios.post(`${apiUrl}/movies/${movieId}/reviews/${reviewId}/comments`, { ...commentData, userId }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            fetchComments();
            setShowModal(false);
            setCommentData({ text: "" });
        } catch (error) {
            console.error("Error saving comment:", error);
        }
    };

    const handleEdit = (comment) => {
        setCurrentComment(comment);
        setCommentData(comment);
        setShowModal(true);
    };

    const handleCreate = () => {
        setCurrentComment(null);
        setCommentData({ text: "" });
        setShowModal(true);
    };

    return (
        <div className="container">
            <Header />
            <div className="commentsHeader">
                <h2 className="heading">Comments for review {reviewId}</h2>
                <button className="createButton" onClick={handleCreate}>
                    Add new comment
                </button>
            </div>

            {comments.length === 0 ? (
                <p className="noComments">No comments available</p>
            ) : (
                <ul className="commentsList">
                    {comments.map((comment) => (
                        <li key={comment.id} className="commentItem">
                            <span className="commentDate">
                                Date: {new Date(comment.date).toLocaleDateString()}
                            </span>
                            <p className="commentText">{comment.text}</p>
                            <div className="buttonGroup">
                                <button onClick={() => handleEdit(comment)} className="editButton">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(comment.id)} className="deleteButton">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {showModal && (
                <div className="modal">
                    <div className="modalContent">
                        <h3>{currentComment ? "Edit Comment" : "Add New Comment"}</h3>
                        <textarea
                            placeholder="Write your comment here..."
                            value={commentData.text}
                            onChange={(e) => setCommentData({ ...commentData, text: e.target.value })}
                            className="modalInput"
                        ></textarea>
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

export default Comments;
