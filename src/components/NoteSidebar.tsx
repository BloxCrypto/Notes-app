import { useState, useRef } from 'react';
import { Search, Plus, FileText, Trash2, Download, Upload } from 'lucide-react';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface NoteSidebarProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onExportNotes: () => void;
  onImportNotes: (notes: Note[]) => void;
}

export const NoteSidebar = ({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onExportNotes,
  onImportNotes,
}: NoteSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedNotes = JSON.parse(content);
        
        // Validate the imported data
        if (Array.isArray(importedNotes)) {
          const validNotes = importedNotes.map((note: any) => ({
            ...note,
            id: note.id || Date.now().toString() + Math.random(),
            createdAt: new Date(note.createdAt || Date.now()),
            updatedAt: new Date(note.updatedAt || Date.now()),
            language: note.language || 'plaintext',
          }));
          onImportNotes(validNotes);
        }
      } catch (error) {
        console.error('Failed to import notes:', error);
        alert('Failed to import notes. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPreview = (content: string) => {
    return content.split('\n')[0].slice(0, 60) + (content.length > 60 ? '...' : '');
  };

  return (
    <div className="w-80 bg-muted/30 border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Notes</h1>
          <div className="flex items-center gap-1">
            <Button 
              onClick={handleImportClick}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              title="Import notes"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button 
              onClick={onExportNotes}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              title="Export notes"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              onClick={onCreateNote}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "group relative p-3 rounded-lg cursor-pointer mb-2 transition-colors",
                  selectedNote?.id === note.id
                    ? "bg-note-active border border-primary/20"
                    : "hover:bg-note-hover"
                )}
                onClick={() => onSelectNote(note)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-sm truncate pr-2 text-foreground">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(note.updatedAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {getPreview(note.content) || 'No content'}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};