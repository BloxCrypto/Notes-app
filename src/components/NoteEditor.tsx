import { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from '@/types/note';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Check, Clock } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
}

const languages = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'lua', label: 'Lua' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'xml', label: 'XML' },
  { value: 'sql', label: 'SQL' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

export const NoteEditor = ({ note, onUpdateNote }: NoteEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const contentSaveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setLanguage(note.language || 'plaintext');
    }
  }, [note]);

  const debouncedSave = useCallback((noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setSaveStatus('saving');
    onUpdateNote(noteId, updates);
    setTimeout(() => setSaveStatus('saved'), 500);
  }, [onUpdateNote]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (note) {
      setSaveStatus('saving');
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }
      titleSaveTimeoutRef.current = setTimeout(() => {
        debouncedSave(note.id, { title: value });
      }, 800);
    }
  };

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    if (note) {
      setSaveStatus('saving');
      if (contentSaveTimeoutRef.current) {
        clearTimeout(contentSaveTimeoutRef.current);
      }
      contentSaveTimeoutRef.current = setTimeout(() => {
        debouncedSave(note.id, { content: newContent });
      }, 1000);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (note) {
      onUpdateNote(note.id, { language: value });
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Select a note to edit</h2>
          <p className="text-muted-foreground">
            Choose a note from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border p-6 pb-4">
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title..."
          className="text-2xl font-semibold border-0 p-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Last modified: {note.updatedAt.toLocaleDateString()} at{' '}
              {note.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {saveStatus === 'saving' && (
                <>
                  <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
                  <span className="text-muted-foreground">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">Saved</span>
                </>
              )}
            </div>
          </div>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleContentChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            padding: { top: 20, bottom: 20 },
          }}
        />
      </div>
    </div>
  );
};