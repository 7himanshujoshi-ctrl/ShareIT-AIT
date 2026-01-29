import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const res = await query('SELECT * FROM notes ORDER BY "dateAdded" DESC');
        const notes = res.rows;
        // Parse tags back to array
        const parsedNotes = notes.map((n: any) => ({
            ...n,
            tags: n.tags ? JSON.parse(n.tags) : [],
            // Ensure consistent casing for frontend if DB returns lowercase
            fileUrl: n.fileUrl || n.fileurl,
            fileName: n.fileName || n.filename,
            dateAdded: n.dateAdded || n.dateadded,
            likes: n.likes || 0,
            isPinned: false
        }));
        return NextResponse.json(parsedNotes);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, subject, summary, type, fileUrl, fileName } = body;

        const newNote = {
            id: Date.now().toString(),
            title,
            subject,
            type,
            summary: summary || '',
            tags: JSON.stringify(['User Upload']),
            fileUrl: fileUrl || '',
            fileName: fileName || '',
            dateAdded: new Date().toISOString(),
            author: 'You',
            likes: 0
        };

        await query(
            `INSERT INTO notes (id, title, subject, type, summary, tags, "fileUrl", "fileName", "dateAdded", author, likes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                newNote.id,
                newNote.title,
                newNote.subject,
                newNote.type,
                newNote.summary,
                newNote.tags,
                newNote.fileUrl,
                newNote.fileName,
                newNote.dateAdded,
                newNote.author,
                newNote.likes
            ]
        );

        return NextResponse.json({ success: true, note: { ...newNote, tags: ['User Upload'] } });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
    }
}
