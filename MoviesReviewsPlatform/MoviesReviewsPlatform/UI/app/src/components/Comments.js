import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Comments = () => {
    const { reviewId } = useParams();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        // Fetch comments for the specific review
        const fetchComments = async () => {
            try {
                const response = await axios.get(`https://shark-app-ihz3p.ondigitalocean.app/api/movies/reviews/${reviewId}/comments`);
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };
        fetchComments();
    }, [reviewId]);

    const handleAddComment = async () => {
        try {
            await axios.post(`https://shark-app-ihz3p.ondigitalocean.app/api/movies/reviews/${reviewId}/comments`, { text: newComment });
            setNewComment('');
            // Optionally, reload comments
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    return (
        <div>
            <h2>Comments</h2>
            {comments.length === 0 ? (
                <p>No comments yet.</p>
            ) : (
                <ul>
                    {comments.map((comment) => (
                        <li key={comment.id}>{comment.text}</li>
                    ))}
                </ul>
            )}
            <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment"
            />
            <button onClick={handleAddComment}>Add Comment</button>
        </div>
    );
};

export default Comments;
