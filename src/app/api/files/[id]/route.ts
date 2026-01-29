
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = params.id;

        const res = await query('SELECT "fileData", "mimeType", "fileName" FROM notes WHERE id = $1', [id]);

        if (res.rows.length === 0 || !res.rows[0].fileData) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileData = res.rows[0].fileData; // This is a Buffer
        const mimeType = res.rows[0].mimeType || 'application/octet-stream';
        const fileName = res.rows[0].fileName || 'file';

        // Create headers
        const headers = new Headers();
        headers.set('Content-Type', mimeType);
        headers.set('Content-Disposition', `inline; filename="${fileName}"`);

        return new NextResponse(fileData, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Error fetching file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
