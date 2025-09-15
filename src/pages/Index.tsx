import { useState, useEffect } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { NoteSidebar } from '@/components/NoteSidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { MobileLayout } from '@/components/MobileLayout';
import { Note } from '@/types/note';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { notes, createNote, updateNote, deleteNote, exportNotes, importNotes } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCreateNote = () => {
    const newNote = createNote();
    setSelectedNote(newNote);
    toast({
      title: "Note created",
      description: "Your new note is ready for editing.",
    });
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    if (selectedNote?.id === id) {
      setSelectedNote(notes.length > 1 ? notes.find(n => n.id !== id) || null : null);
    }
    toast({
      title: "Note deleted",
      description: "Your note has been deleted.",
      variant: "destructive",
    });
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleExportNotes = () => {
    exportNotes();
    toast({
      title: "Notes exported",
      description: "Your notes have been downloaded as a JSON file.",
    });
  };

  const handleImportNotes = (importedNotes: Note[]) => {
    importNotes(importedNotes);
    toast({
      title: "Notes imported",
      description: `Successfully imported ${importedNotes.length} notes.`,
    });
  };

  // Select first note by default if none selected and notes exist
  if (!selectedNote && notes.length > 0) {
    setSelectedNote(notes[0]);
  }

  return isMobile ? (
    <MobileLayout
      notes={notes}
      selectedNote={selectedNote}
      onSelectNote={handleSelectNote}
      onCreateNote={handleCreateNote}
      onDeleteNote={handleDeleteNote}
      onExportNotes={handleExportNotes}
      onImportNotes={handleImportNotes}
      onUpdateNote={updateNote}
    />
  ) : (
    <div className="h-screen flex bg-background">
      <NoteSidebar
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onExportNotes={handleExportNotes}
        onImportNotes={handleImportNotes}
      />
      <NoteEditor
        note={selectedNote}
        onUpdateNote={updateNote}
      />
    </div>
  );
};

export default Index;
