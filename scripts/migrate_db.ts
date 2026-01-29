
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        console.log('Starting migration...');

        // Check if columns exist first to avoid errors
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            console.log('Adding "fileData" column...');
            await client.query(`
            ALTER TABLE notes 
            ADD COLUMN IF NOT EXISTS "fileData" BYTEA;
        `);

            console.log('Adding "mimeType" column...');
            await client.query(`
            ALTER TABLE notes 
            ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
        `);

            await client.query('COMMIT');
            console.log('Migration completed successfully.');
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Migration failed, rolled back.', e);
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await pool.end();
    }
}

migrate();
