import { useState, useEffect } from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { Note } from '@/types/note';
import { NoteSidebar } from './NoteSidebar';
import { NoteEditor } from './NoteEditor';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

interface MobileLayoutProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onExportNotes: () => void;
  onImportNotes: (notes: Note[]) => void;
  onUpdateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
}

export const MobileLayout = ({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onExportNotes,
  onImportNotes,
  onUpdateNote,
}: MobileLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const handleSelectNote = (note: Note) => {
    onSelectNote(note);
    setShowEditor(true);
    setSidebarOpen(false);
  };

  const handleBackToList = () => {
    setShowEditor(false);
  };

  const handleCreateNote = () => {
    onCreateNote();
    setShowEditor(true);
    setSidebarOpen(false);
  };

  // Auto-show editor when a note is selected
  useEffect(() => {
    if (selectedNote && window.innerWidth < 1024) {
      setShowEditor(true);
    }
  }, [selectedNote]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background">
        {showEditor && selectedNote ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm truncate flex-1 mx-2">
              {selectedNote.title}
            </span>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold">Notes</h1>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <NoteSidebar
                  notes={notes}
                  selectedNote={selectedNote}
                  onSelectNote={handleSelectNote}
                  onCreateNote={handleCreateNote}
                  onDeleteNote={onDeleteNote}
                  onExportNotes={onExportNotes}
                  onImportNotes={onImportNotes}
                />
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1">
        <NoteSidebar
          notes={notes}
          selectedNote={selectedNote}
          onSelectNote={onSelectNote}
          onCreateNote={onCreateNote}
          onDeleteNote={onDeleteNote}
          onExportNotes={onExportNotes}
          onImportNotes={onImportNotes}
        />
        <NoteEditor note={selectedNote} onUpdateNote={onUpdateNote} />
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden flex-1">
        {showEditor && selectedNote ? (
          <NoteEditor note={selectedNote} onUpdateNote={onUpdateNote} />
        ) : (
          <div className="flex-1 p-4">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground mb-4">No notes yet</p>
                <Button onClick={handleCreateNote}>Create your first note</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border border-border bg-card cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectNote(note)}
                  >
                    <h3 className="font-medium text-sm mb-1 truncate">
                      {note.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {note.content.split('\n')[0].slice(0, 100) || 'No content'}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {note.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};