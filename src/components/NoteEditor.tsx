import { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from '@/types/note';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, Check, Clock, Search, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { TypewriterText } from './TypewriterText';

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

// Common word suggestions for different contexts
const commonWords = [
  'function', 'component', 'interface', 'implement', 'because', 'therefore', 'however', 'although',
  'application', 'development', 'programming', 'technology', 'solution', 'project', 'feature',
  'requirement', 'specification', 'documentation', 'architecture', 'database', 'frontend',
  'backend', 'algorithm', 'optimization', 'performance', 'security', 'authentication',
  'authorization', 'configuration', 'deployment', 'environment', 'infrastructure', 'monitoring',
  'debugging', 'testing', 'validation', 'integration', 'migration', 'refactoring', 'enhancement'
];

const contextualWords = {
  javascript: ['const', 'let', 'var', 'function', 'arrow', 'async', 'await', 'promise', 'callback', 'closure', 'prototype', 'module', 'import', 'export'],
  typescript: ['interface', 'type', 'generic', 'enum', 'namespace', 'decorator', 'readonly', 'optional', 'union', 'intersection'],
  python: ['def', 'class', 'import', 'from', 'lambda', 'list', 'dict', 'tuple', 'set', 'comprehension', 'decorator', 'generator'],
  html: ['element', 'attribute', 'semantic', 'accessibility', 'responsive', 'meta', 'DOCTYPE', 'viewport'],
  css: ['selector', 'property', 'flexbox', 'grid', 'responsive', 'animation', 'transition', 'transform', 'pseudo'],
  markdown: ['heading', 'emphasis', 'strong', 'italic', 'link', 'image', 'table', 'codeblock', 'blockquote']
};

export const NoteEditor = ({ note, onUpdateNote }: NoteEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const contentSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  // Setup word suggestions and autocomplete
  const setupWordSuggestions = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Register completion provider for all languages
    const disposable = monaco.languages.registerCompletionItemProvider('*', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        // Get context-specific words
        const currentLanguage = model.getLanguageId();
        const languageWords = contextualWords[currentLanguage as keyof typeof contextualWords] || [];
        
        // Extract words from current content for personalized suggestions
        const contentWords = content
          .split(/\W+/)
          .filter(word => word.length > 3 && !commonWords.includes(word.toLowerCase()))
          .slice(0, 20); // Limit to recent words

        // Combine all suggestions
        const allSuggestions = [
          ...commonWords,
          ...languageWords,
          ...contentWords
        ];

        const suggestions = allSuggestions
          .filter(suggestion => suggestion.toLowerCase().includes(word.word.toLowerCase()))
          .slice(0, 15) // Limit suggestions
          .map(suggestion => ({
            label: suggestion,
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: suggestion,
            range: range,
            sortText: suggestion.startsWith(word.word) ? '0' + suggestion : '1' + suggestion
          }));

        return { suggestions };
      }
    });

    // Cleanup function
    return () => disposable.dispose();
  }, [content]);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    setupWordSuggestions(editor);
    
    // Enable additional editor features
    editor.addAction({
      id: 'trigger-suggest',
      label: 'Trigger Suggest',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space],
      run: () => {
        editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
      }
    });

    // Add search functionality
    editor.addAction({
      id: 'find-in-editor',
      label: 'Find',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
      run: () => {
        setShowSearch(true);
      }
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (editorRef.current && term) {
      const model = editorRef.current.getModel();
      if (model) {
        const matches = model.findMatches(term, false, false, true, null, true);
        if (matches.length > 0) {
          editorRef.current.setSelection(matches[0].range);
          editorRef.current.revealLineInCenter(matches[0].range.startLineNumber);
        }
      }
    }
  };

  const handleFindNext = () => {
    if (editorRef.current && searchTerm) {
      editorRef.current.trigger('keyboard', 'editor.action.nextMatchFindAction', {});
    }
  };

  const handleFindPrevious = () => {
    if (editorRef.current && searchTerm) {
      editorRef.current.trigger('keyboard', 'editor.action.previousMatchFindAction', {});
    }
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchTerm('');
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'closeFindWidget', {});
    }
  };

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
        <div className="text-center animate-fade-in">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            <TypewriterText 
              texts={[
                "Select a note to edit",
                "Start writing your thoughts",
                "Create something amazing"
              ]}
              speed={80}
              deleteSpeed={40}
              delay={1500}
            />
          </h2>
          <p className="text-muted-foreground mt-4">
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
        
        {showSearch && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in note..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 h-8"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFindPrevious}
                disabled={!searchTerm}
                className="h-8 w-8 p-0"
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFindNext}
                disabled={!searchTerm}
                className="h-8 w-8 p-0"
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSearch}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
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
            // Enhanced autocomplete settings
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true
            },
            parameterHints: { enabled: true },
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'allDocuments',
            // Show suggestions automatically
            suggestSelection: 'first',
            quickSuggestionsDelay: 100
          }}
        />
      </div>
    </div>
  );
};