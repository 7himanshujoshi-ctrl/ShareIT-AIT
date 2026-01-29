const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'shareit.db');
console.log('Opening DB at:', dbPath);
const db = new Database(dbPath);

console.log('Applying migrations...');

// 1. Ensure Likes column exists
try {
    db.exec(`ALTER TABLE notes ADD COLUMN likes INTEGER DEFAULT 0`);
    console.log('Added likes column.');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('Likes column already exists.');
    } else {
        console.error('Error adding likes column:', error.message);
    }
}

// 2. Ensure Comments table exists
try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        noteId TEXT NOT NULL,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        dateAdded TEXT NOT NULL,
        FOREIGN KEY(noteId) REFERENCES notes(id) ON DELETE CASCADE
      )
    `);
    console.log('Comments table verified.');
} catch (error) {
    console.error('Error creating comments table:', error.message);
}

console.log('Migration complete.');
db.close();
