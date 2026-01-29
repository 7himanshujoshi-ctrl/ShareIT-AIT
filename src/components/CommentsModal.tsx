import React, { useState, useEffect } from 'react';
import { Comment } from '@/types';
import styles from './UploadModal.module.css'; // Reusing modal styles for consistency

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    noteId: string;
    noteTitle: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, noteId, noteTitle }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && noteId) {
            fetchComments();
        }
    }, [isOpen, noteId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/notes/${noteId}/comments`);
            const data = await res.json();
            if (Array.isArray(data)) setComments(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`/api/notes/${noteId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newComment })
            });

            if (res.ok) {
                const addedComment = await res.json();
                setComments([addedComment, ...comments]);
                setNewComment("");
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose} style={{ zIndex: 2000 }}>
            <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Comments: {noteTitle}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px', background: '#F9FAFB', borderRadius: '8px', marginBottom: '16px' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#6B7280' }}>Loading...</p>
                    ) : comments.length > 0 ? (
                        comments.map(c => (
                            <div key={c.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.author}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(c.dateAdded).toLocaleDateString()}</span>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: '#374151', margin: 0 }}>{c.text}</p>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>No comments yet. Be the first!</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>Post</button>
                </form>
            </div>
        </div>
    );
};

export default CommentsModal;
