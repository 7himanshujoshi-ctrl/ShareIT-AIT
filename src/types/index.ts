export type NoteType = 'pdf' | 'docx' | 'image' | 'ppt' | 'text';

export interface Note {
    id: string;
    title: string;
    subject: string;
    type: NoteType;
    tags: string[];
    summary: string;
    dateAdded: string;
    author: string;
    thumbnailUrl?: string; // Mock URL for now
    fileUrl?: string;
    fileSize?: string;
    isPinned?: boolean;
    likes?: number;
}

export interface Comment {
    id: string;
    noteId: string;
    text: string;
    author: string;
    dateAdded: string;
}
