import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'shareit.db');
const db = new Database(dbPath);

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL,
    summary TEXT,
    tags TEXT, -- Stored as JSON string
    fileUrl TEXT,
    fileName TEXT,
    dateAdded TEXT NOT NULL,
    author TEXT NOT NULL
  )
`);

// Add likes column if it doesn't exist (Migration)
try {
  db.exec(`ALTER TABLE notes ADD COLUMN likes INTEGER DEFAULT 0`);
} catch (error: any) {
  if (!error.message.includes('duplicate column name')) {
    console.error('Migration error:', error);
  }
}

// Comments Table
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

export default db;
