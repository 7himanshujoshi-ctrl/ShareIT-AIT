const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'shareit.db'));

// 1. Get a note to test with
const note = db.prepare('SELECT * FROM notes LIMIT 1').get();

if (!note) {
    console.error('No notes found! Please upload a note first.');
    process.exit(1);
}

console.log('Testing with note:', note.title, `(${note.id})`);

// 2. Add a comment
const commentId = 'test-' + Date.now();
const commentStmt = db.prepare('INSERT INTO comments (id, noteId, text, author, dateAdded) VALUES (?, ?, ?, ?, ?)');
try {
    commentStmt.run(commentId, note.id, 'Test Comment from Script', 'TestBot', new Date().toISOString());
    console.log('Successfully inserted comment.');
} catch (e) {
    console.error('Failed to insert comment:', e.message);
}

// 3. Increment Like
try {
    db.prepare('UPDATE notes SET likes = COALESCE(likes, 0) + 1 WHERE id = ?').run(note.id);
    console.log('Successfully incemented like.');
} catch (e) {
    console.error('Failed to update likes:', e.message);
}

// 4. Verify Read
const updatedNote = db.prepare('SELECT likes FROM notes WHERE id = ?').get(note.id);
console.log('Current Likes:', updatedNote.likes);

const comments = db.prepare('SELECT * FROM comments WHERE noteId = ?').all(note.id);
console.log('Comments found:', comments.length);
console.log('First comment:', comments[0]?.text);

db.close();
