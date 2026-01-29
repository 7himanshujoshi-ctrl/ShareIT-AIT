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
    console.log("POST /api/notes: Request received");
    try {
        const body = await request.json();
        console.log("POST /api/notes: Body parsed. Title:", body.title, "Content Length (approx):", JSON.stringify(body).length);

        const { title, subject, summary, type, fileUrl, fileName, fileContent } = body;

        // Generate ID early to use in fileUrl
        const id = Date.now().toString();
        let finalFileUrl = fileUrl || '';
        let fileBuffer = null;
        let mimeType = null;

        if (fileContent) {
            fileBuffer = Buffer.from(fileContent, 'base64');
            // Determine mime type based on file extension (simple mapping)
            const ext = fileName?.split('.').pop()?.toLowerCase();
            if (ext) {
                const mimeTypes: Record<string, string> = {
                    'pdf': 'application/pdf',
                    'doc': 'application/msword',
                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'ppt': 'application/vnd.ms-powerpoint',
                    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'txt': 'text/plain'
                };
                mimeType = mimeTypes[ext] || 'application/octet-stream';
            }
            finalFileUrl = `/api/files/${id}`;
        }

        const newNote = {
            id,
            title,
            subject,
            type,
            summary: summary || '',
            tags: JSON.stringify(['User Upload']),
            fileUrl: finalFileUrl,
            fileName: fileName || '',
            dateAdded: new Date().toISOString(),
            author: 'You',
            likes: 0
        };

        await query(
            `INSERT INTO notes (id, title, subject, type, summary, tags, "fileUrl", "fileName", "dateAdded", author, likes, "fileData", "mimeType")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
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
                newNote.likes,
                fileBuffer,
                mimeType
            ]
        );

        return NextResponse.json({ success: true, note: { ...newNote, tags: ['User Upload'] } });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
    }
}
