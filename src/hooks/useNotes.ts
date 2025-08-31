import { useState, useEffect } from 'react';
import { Note } from '@/types/note';

const STORAGE_KEY = 'swift-notes';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        language: note.language || 'plaintext',
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      setNotes(parsedNotes);
    } else {
      // Create a welcome note
      const welcomeNote: Note = {
        id: '1',
        title: 'Welcome to Swift Notes',
        content: 'Start writing your thoughts here. This is a simple and elegant notes app where you can create, edit, and organize your notes.\n\nFeatures:\n• Clean, distraction-free writing\n• Auto-save functionality\n• Search through your notes\n• Elegant design\n\nClick the "+" button to create a new note!',
        language: 'plaintext',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([welcomeNote]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeNote]));
    }
  }, []);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
  };

  const createNote = (): Note => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      language: 'plaintext',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    const updatedNotes = notes.map(note =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    );
    saveNotes(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
  };

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
  };
};