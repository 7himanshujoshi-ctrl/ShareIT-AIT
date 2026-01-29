import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const stmt = db.prepare('UPDATE notes SET likes = COALESCE(likes, 0) + 1 WHERE id = ?');
        const info = stmt.run(params.id);

        if (info.changes > 0) {
            const updatedNote = db.prepare('SELECT likes FROM notes WHERE id = ?').get(params.id);
            return NextResponse.json({ success: true, likes: (updatedNote as any).likes });
        } else {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Like error:', error);
        return NextResponse.json({ error: 'Failed to like note' }, { status: 500 });
    }
}
