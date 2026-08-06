import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/comment-modal.css';

const CommentModal = ({ foodId, onClose, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');

  // Fetch comments
  useEffect(() => {
    if (!foodId) return;

    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/food/${foodId}/comments`,
          { withCredentials: true }
        );
        setComments(response.data.comments || []);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setError("Could not load comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [foodId]);

  // Handle posting a new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const response = await axios.post(
        `http://localhost:3000/api/food/${foodId}/comment`,
        { text: newComment },
        { withCredentials: true }
      );

      const addedComment = response.data.comment;
      setComments((prev) => [addedComment, ...prev]);
      setNewComment('');

      if (onCommentAdded) {
        onCommentAdded(foodId);
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing mode
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  // Save edited comment
  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const response = await axios.put(
        `http://localhost:3000/api/food/comment/${commentId}`,
        { text: editText },
        { withCredentials: true }
      );

      const updated = response.data.comment;
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? updated : c))
      );
      setEditingCommentId(null);
      setEditText('');
    } catch (err) {
      console.error("Failed to edit comment:", err);
      alert(err.response?.data?.message || "Failed to edit comment");
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await axios.delete(
        `http://localhost:3000/api/food/comment/${commentId}`,
        { withCredentials: true }
      );

      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  return (
    <div className="comment-modal-backdrop" onClick={onClose}>
      <div className="comment-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="comment-modal-header">
          <h3>Comments ({comments.length})</h3>
          <button className="comment-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="comment-modal-body">
          {loading ? (
            <div className="comment-loading">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="comment-empty">No comments yet. Be the first to comment!</div>
          ) : (
            comments.map((comment) => {
              const userName = comment.user?.fullName || comment.user?.name || comment.user?.email || "User";
              const avatarLetter = userName.charAt(0).toUpperCase();
              const isEditing = editingCommentId === comment._id;

              return (
                <div key={comment._id} className="comment-item">
                  <div className="comment-avatar">{avatarLetter}</div>
                  <div className="comment-details">
                    <div className="comment-author-row">
                      <span className="comment-author-name">{userName}</span>
                      <div className="comment-right-controls">
                        <span className="comment-time">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="comment-edit-box">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="comment-edit-input"
                        />
                        <div className="comment-edit-actions">
                          <button onClick={() => handleSaveEdit(comment._id)} className="comment-save-btn">Save</button>
                          <button onClick={() => setEditingCommentId(null)} className="comment-cancel-btn">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="comment-text">{comment.text}</p>
                        <div className="comment-owner-actions">
                          <button onClick={() => handleStartEdit(comment)} className="comment-action-link">Edit</button>
                          <button onClick={() => handleDelete(comment._id)} className="comment-action-link delete">Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Footer */}
        <form className="comment-modal-footer" onSubmit={handleSubmit}>
          {error && <div className="comment-error-msg">{error}</div>}
          <div className="comment-input-wrapper">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" disabled={submitting || !newComment.trim()}>
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;