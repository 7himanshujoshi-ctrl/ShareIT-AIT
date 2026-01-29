import React, { useState, useRef } from 'react';
import styles from './UploadModal.module.css';
import { NoteType } from '@/types';

// Default subjects (Restoring engineering list locally)
const SUBJECTS = [
    'Engineering Mathematics-II',
    'Engineering Physics',
    'Engineering Chemistry',
    'Programming in C',
    'Basic Electrical Engineering',
    'Engineering Drawing & Graphics',
    'Communication Skills',
    'Environmental Science',
    'Design Thinking',
    'General'
];

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; subject: string; summary: string; type: NoteType; fileUrl?: string; fileName?: string }) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [summary, setSummary] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            // Auto-fill title if empty
            if (!title) {
                setTitle(e.target.files[0].name.split('.')[0]);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select a file to upload.");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            let noteType: NoteType = 'pdf'; // Default
            const ext = selectedFile.name.split('.').pop()?.toLowerCase();
            if (ext === 'doc' || ext === 'docx') noteType = 'docx';
            if (ext === 'ppt' || ext === 'pptx') noteType = 'ppt';
            if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) noteType = 'image';
            if (ext === 'txt') noteType = 'text';

            onSubmit({
                title,
                subject,
                summary,
                type: noteType,
                fileUrl: data.fileUrl,
                fileName: selectedFile.name
            });

            // Reset
            setTitle('');
            setSummary('');
            setSelectedFile(null);
            onClose();

        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Upload Note</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Title</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Unit 3 Thermodynamics Details"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Subject</label>
                        <select
                            className={styles.select}
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                        >
                            {SUBJECTS.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Summary</label>
                        <textarea
                            className={styles.textarea}
                            value={summary}
                            onChange={e => setSummary(e.target.value)}
                            placeholder="Brief description of the note contents..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Attachment</label>
                        <div
                            className={styles.fileDropzone}
                            onClick={() => fileInputRef.current?.click()}
                            style={selectedFile ? { borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.05)' } : {}}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                            />
                            {selectedFile ? (
                                <p style={{ fontWeight: 600, color: 'var(--success)' }}>Selected: {selectedFile.name}</p>
                            ) : (
                                <>
                                    <p>Drag and drop or click to upload file</p>
                                    <small style={{ color: '#9CA3AF' }}>PDF, DOCX, PPT, JPG supported</small>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isUploading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isUploading}>
                            {isUploading ? 'Uploading...' : 'Share Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;
