import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const res = await query(
            'SELECT * FROM comments WHERE "noteId" = $1 ORDER BY "dateAdded" DESC',
            [params.id]
        );
        return NextResponse.json(res.rows);
    } catch (error) {
        console.error("Comments Fetch Error:", error);
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

        await query(
            `INSERT INTO comments (id, "noteId", text, author, "dateAdded") 
             VALUES ($1, $2, $3, $4, $5)`,
            [newComment.id, newComment.noteId, newComment.text, newComment.author, newComment.dateAdded]
        );

        return NextResponse.json(newComment);
    } catch (error) {
        console.error("Comment Post Error:", error);
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}
