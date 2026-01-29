import React from 'react';
import styles from './NoteCard.module.css';
import { Note } from '@/types';

interface NoteCardProps {
    note: Note;
    onCommentClick?: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onCommentClick }) => {
    const [likes, setLikes] = React.useState(note.likes || 0);

    const handleClick = () => {
        if (note.fileUrl) {
            window.open(note.fileUrl, '_blank');
        } else {
            console.log("No file URL for this note");
        }
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/notes/${note.id}/like`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setLikes(data.likes);
            }
        } catch (err) {
            console.error("Failed to like");
        }
    };

    const handleComment = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onCommentClick) onCommentClick(note);
    };

    return (
        <div className={styles.card} onClick={handleClick} style={note.fileUrl ? { cursor: 'pointer' } : { cursor: 'default' }}>
            <div className={styles.thumbnailContainer}>
                {note.type === 'image' && note.fileUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={note.fileUrl}
                        alt={note.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '2.5rem' }}>
                        {note.type === 'pdf' && <span>📕</span>}
                        {note.type === 'docx' && <span>📝</span>}
                        {note.type === 'ppt' && <span>📊</span>}
                        {note.type === 'text' && <span>📄</span>}
                        {note.type === 'image' && <span>🖼️</span>}
                    </div>
                )}
                <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                    {/* Like Button */}
                    <button className={styles.actionBtn} onClick={handleLike} aria-label="Like">
                        ❤️ <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>{likes > 0 ? likes : ''}</span>
                    </button>
                    {/* Comment Button */}
                    <button className={styles.actionBtn} onClick={handleComment} aria-label="Comment">💬</button>
                </div>
            </div>

            <div className={styles.content}>
                <span className={styles.subjectBadge}>{note.subject}</span>
                <h3 className={styles.title} style={note.fileUrl ? { textDecoration: 'underline', textDecorationColor: '#D97706' } : {}}>{note.title}</h3>
                {note.summary && <p className={styles.summary}>{note.summary}</p>}

                <div className={styles.footer}>
                    <span>{note.type.toUpperCase()} • {note.fileSize || 'Unknown'}</span>
                    <span>{new Date(note.dateAdded).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default NoteCard;
