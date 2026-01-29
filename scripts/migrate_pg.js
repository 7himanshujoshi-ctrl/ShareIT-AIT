const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    console.log('Connecting to Cloud DB...');
    try {
        // Create Notes Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                subject TEXT NOT NULL,
                type TEXT NOT NULL,
                summary TEXT,
                tags TEXT,
                "fileUrl" TEXT,
                "fileName" TEXT,
                "dateAdded" TEXT NOT NULL,
                author TEXT NOT NULL,
                likes INTEGER DEFAULT 0
            );
        `);
        console.log('Verified notes table.');

        // Create Comments Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                "noteId" TEXT NOT NULL,
                text TEXT NOT NULL,
                author TEXT NOT NULL,
                "dateAdded" TEXT NOT NULL,
                FOREIGN KEY("noteId") REFERENCES notes(id) ON DELETE CASCADE
            );
        `);
        console.log('Verified comments table.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
