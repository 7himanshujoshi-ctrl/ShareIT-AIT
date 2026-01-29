"use client";

import React, { useState, useEffect, useMemo } from 'react';
import MasonryGrid from "@/components/MasonryGrid";
import NoteCard from "@/components/NoteCard";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import UploadModal from "@/components/UploadModal";
import CommentsModal from "@/components/CommentsModal";
import { Note, NoteType } from "@/types";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotes(data);
      }
    } catch (e) {
      console.error("Failed to fetch notes", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Extract unique subjects dynamically from real data
  const subjects = useMemo(() => {
    return Array.from(new Set(notes.map(n => n.subject))).sort();
  }, [notes]);

  // Filter notes based on search query and selected subject
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSubject = selectedSubject ? note.subject === selectedSubject : true;

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        note.title.toLowerCase().includes(query) ||
        note.subject.toLowerCase().includes(query) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)));

      return matchesSubject && matchesSearch;
    });
  }, [notes, searchQuery, selectedSubject]);

  const handleNoteSubmit = async (data: { title: string; subject: string; summary: string; type: NoteType; fileUrl?: string; fileName?: string }) => {
    // Save to DB via API
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        fetchNotes(); // Refresh list from DB
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        alert("Failed to save note: " + (err.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Error saving note. Please try again.");
    }
  };

  return (
    <div className="container">
      <header style={{ padding: '48px 0 32px 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>ShareItAIT</h1>
        <p style={{ fontSize: '1.25rem', color: '#6B7280', maxWidth: '600px', margin: '0 auto 32px auto' }}>
          Your smart knowledge base. Upload, organize, and share notes instantly.
        </p>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {subjects.length > 0 && (
            <FilterBar
              categories={subjects}
              selected={selectedSubject}
              onSelect={setSelectedSubject}
            />
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ marginBottom: '32px' }}
          >
            + Upload Note
          </button>
        </div>
      </header>

      <main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Loading library...</div>
        ) : filteredNotes.length > 0 ? (
          <MasonryGrid>
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onCommentClick={(n) => setActiveNote(n)}
              />
            ))}
          </MasonryGrid>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
            <p>{notes.length === 0 ? "Library is empty. Upload a note to get started!" : "No notes found matching your criteria."}</p>
          </div>
        )}
      </main>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNoteSubmit}
      />

      {activeNote && (
        <CommentsModal
          isOpen={!!activeNote}
          onClose={() => setActiveNote(null)}
          noteId={activeNote.id}
          noteTitle={activeNote.title}
        />
      )}
    </div>
  );
}
