import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Note } from '@/types';

export async function GET() {
    try {
        const notes = db.prepare('SELECT * FROM notes ORDER BY dateAdded DESC').all();
        // Parse tags back to array
        const parsedNotes = notes.map((n: any) => ({
            ...n,
            tags: n.tags ? JSON.parse(n.tags) : [],
            isPinned: false // Default
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
            author: 'You'
        };

        const stmt = db.prepare(`
            INSERT INTO notes (id, title, subject, type, summary, tags, fileUrl, fileName, dateAdded, author)
            VALUES (@id, @title, @subject, @type, @summary, @tags, @fileUrl, @fileName, @dateAdded, @author)
        `);

        stmt.run(newNote);

        return NextResponse.json({ success: true, note: { ...newNote, tags: ['User Upload'] } });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
    }
}
