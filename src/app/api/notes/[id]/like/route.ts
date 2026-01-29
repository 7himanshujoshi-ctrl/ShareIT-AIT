import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        // Postgres allows RETURNING clause
        const res = await query(
            'UPDATE notes SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING likes',
            [params.id]
        );

        if (res.rows.length > 0) {
            return NextResponse.json({ success: true, likes: res.rows[0].likes });
        } else {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Like error:', error);
        return NextResponse.json({ error: 'Failed to like note' }, { status: 500 });
    }
}
