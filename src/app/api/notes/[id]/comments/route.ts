import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const comments = db.prepare('SELECT * FROM comments WHERE noteId = ? ORDER BY dateAdded DESC').all(params.id);
        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await request.json();
        const { text } = body;

        if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });

        const newComment = {
            id: Date.now().toString(),
            noteId: params.id,
            text,
            author: 'You',
            dateAdded: new Date().toISOString()
        };

        const stmt = db.prepare('INSERT INTO comments (id, noteId, text, author, dateAdded) VALUES (@id, @noteId, @text, @author, @dateAdded)');
        stmt.run(newComment);

        return NextResponse.json(newComment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}
