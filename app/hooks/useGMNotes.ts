'use client';

import { useLocalStorage } from '@mantine/hooks';

export interface GMNote {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  category?: 'session' | 'campaign' | 'npc' | 'location' | 'plot' | 'other';
}

export function useGMNotes() {
  const [notes, setNotes] = useLocalStorage<GMNote[]>({
    key: 'pf2e-gm-notes',
    defaultValue: [],
    serialize: JSON.stringify,
    deserialize: (str) => {
      try {
        if (!str) return [];
        const parsed = JSON.parse(str);
        // Restore Date objects
        return parsed.map((note: GMNote & { createdAt?: string; updatedAt?: string }) => ({
          ...note,
          createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
          updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
        }));
      } catch {
        return [];
      }
    },
  });

  const addNote = (note: Omit<GMNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: GMNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((current) => [...current, newNote]);
    return newNote;
  };

  const updateNote = (noteId: string, updates: Partial<Omit<GMNote, 'id' | 'createdAt'>>) => {
    setNotes((current) => 
      current.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    );
  };

  const removeNote = (noteId: string) => {
    setNotes((current) => current.filter(note => note.id !== noteId));
  };

  const getNoteById = (noteId: string) => {
    return notes.find(note => note.id === noteId);
  };

  const getNotesByCategory = (category: GMNote['category']) => {
    return notes.filter(note => note.category === category);
  };

  const searchNotes = (query: string) => {
    const searchTerm = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  };

  const clearAllNotes = () => {
    setNotes([]);
  };

  return {
    notes,
    setNotes,
    addNote,
    updateNote,
    removeNote,
    getNoteById,
    getNotesByCategory,
    searchNotes,
    clearAllNotes,
  };
}