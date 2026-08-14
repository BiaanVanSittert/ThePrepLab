import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, KnowledgeDoc } from '../store/useAppStore';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2, Check, Upload, Search, Edit2, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function KnowledgeBase() {
  const { 
    docs, 
    activeDocId, 
    setActiveDocId, 
    addDoc, 
    updateDoc, 
    removeDoc 
  } = useAppStore();

  const activeDoc = docs.find(d => d.id === activeDocId) || docs[0];

  const [localContent, setLocalContent] = useState(activeDoc?.content || '');
  const [localTitle, setLocalTitle] = useState(activeDoc?.title || '');
  const [isRenaming, setIsRenaming] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [searchDocQuery, setSearchDocQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state when active doc changes
  useEffect(() => {
    if (activeDoc) {
      setLocalContent(activeDoc.content);
      setLocalTitle(activeDoc.title);
      setIsRenaming(false);
    }
  }, [activeDocId]);

  // Debounced auto-save for content
  const handleContentChange = (newText: string) => {
    setLocalContent(newText);
    setSaveStatus('saving');

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      if (activeDoc) {
        updateDoc(activeDoc.id, { content: newText });
        setSaveStatus('saved');
      }
    }, 400);
  };

  const handleTitleBlur = () => {
    if (activeDoc && localTitle.trim()) {
      updateDoc(activeDoc.id, { title: localTitle.trim() });
    }
    setIsRenaming(false);
  };

  const handleCreateNewDoc = () => {
    const newId = addDoc('Untitled Notes');
    setActiveDocId(newId);
    setIsRenaming(true);
    toast.success("New notebook created");
  };

  const handleDeleteDoc = (docToDelete: KnowledgeDoc) => {
    if (docs.length <= 1) {
      toast.error("You must keep at least one notebook document.");
      return;
    }
    removeDoc(docToDelete.id);
    toast("Notebook deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          useAppStore.setState(state => ({
            docs: [docToDelete, ...state.docs],
            activeDocId: docToDelete.id,
          }));
        }
      }
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (typeof text === 'string') {
        const title = file.name.replace(/\.[^/.]+$/, "");
        const newId = addDoc(title, text);
        setActiveDocId(newId);
        toast.success(`Imported "${file.name}" as new notebook!`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredDocs = docs.filter(d => 
    d.title.toLowerCase().includes(searchDocQuery.toLowerCase()) || 
    d.content.toLowerCase().includes(searchDocQuery.toLowerCase())
  );

  // Word & Character count stats
  const charCount = localContent.length;
  const wordCount = localContent.trim() ? localContent.trim().split(/\s+/).length : 0;
  const lineCount = localContent ? localContent.split('\n').length : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)] pb-12 animate-in fade-in duration-300">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        accept=".txt,.md,.text" 
        className="hidden" 
      />

      {/* Left Sidebar: Notebook Documents */}
      <div className="w-full lg:w-80 flex flex-col space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Notebooks</h2>
          </div>
          <Button size="sm" onClick={handleCreateNewDoc} className="gap-1 text-xs h-8">
            <Plus className="w-3.5 h-3.5" /> New Note
          </Button>
        </div>

        {/* Search Notebooks */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notebooks..."
            value={searchDocQuery}
            onChange={(e) => setSearchDocQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Notebook List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[40vh] lg:max-h-[65vh]">
          {filteredDocs.map(doc => {
            const isActive = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                  isActive 
                    ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30' 
                    : 'border-border bg-card hover:bg-muted/30'
                }`}
              >
                <div className="space-y-1 overflow-hidden">
                  <p className={`font-semibold text-sm truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {doc.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 font-mono">
                    {doc.content || 'Empty note...'}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 h-auto text-red-500 hover:bg-red-500/10 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDoc(doc);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 w-full text-xs"
        >
          <Upload className="w-3.5 h-3.5" /> Import File (.txt / .md)
        </Button>
      </div>

      {/* Main Editor Pane */}
      <div className="flex-1 flex flex-col space-y-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        
        {/* Editor Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2 flex-1">
            {isRenaming ? (
              <Input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                className="text-lg font-bold h-9"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsRenaming(true)}>
                <h1 className="text-2xl font-bold tracking-tight">{activeDoc?.title || 'Notebook'}</h1>
                <Edit2 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-full border ${
              saveStatus === 'saved' 
                ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400' 
                : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 animate-pulse'
            }`}>
              <Check className="w-3 h-3" />
              {saveStatus === 'saved' ? 'Auto-Saved' : 'Saving...'}
            </span>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 flex flex-col">
          <TextArea
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Paste your study notes, lecture transcripts, or textbook chapters here. Auto-saved as you type..."
            className="flex-1 min-h-[55vh] font-mono text-sm leading-relaxed border-0 focus-visible:ring-0 p-2 resize-none bg-transparent"
          />
        </div>

        {/* Editor Bottom Stats Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
            <span>•</span>
            <span>{lineCount} lines</span>
          </div>
          <span className="text-[11px]">Ready for Flashcard & Exam Builders</span>
        </div>

      </div>
    </div>
  );
}
