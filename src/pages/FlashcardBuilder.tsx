import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { TextArea } from '../components/ui/TextArea';
import { Input } from '../components/ui/Input';
import { Flashcard } from '../components/ui/Flashcard';
import { Plus, Trash2, FolderPlus, Check, X, Edit2, Search, BookOpen, Layers } from 'lucide-react';
import { toast } from 'sonner';

// Custom Hook for precise undo/redo
function useHistoryState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const historyRef = useRef<T[]>([initialState]);
  const pointerRef = useRef<number>(0);

  const set = useCallback((newState: T) => {
    const history = historyRef.current;
    const pointer = pointerRef.current;
    
    // Check for massive deletion hint
    if (typeof initialState === 'object' && initialState !== null) {
      const oldState = history[pointer] as any;
      const newS = newState as any;
      if (oldState?.front && !newS?.front && oldState.front.length > 20) {
        toast("Accidentally deleted?", { description: "Press Ctrl+Z to undo." });
      }
      if (oldState?.back && !newS?.back && oldState.back.length > 20) {
        toast("Accidentally deleted?", { description: "Press Ctrl+Z to undo." });
      }
    }

    const newHistory = history.slice(0, pointer + 1);
    newHistory.push(newState);
    historyRef.current = newHistory;
    pointerRef.current = newHistory.length - 1;
    setState(newState);
  }, [initialState]);

  const undo = useCallback(() => {
    if (pointerRef.current > 0) {
      pointerRef.current -= 1;
      setState(historyRef.current[pointerRef.current]);
    }
  }, []);

  const redo = useCallback(() => {
    if (pointerRef.current < historyRef.current.length - 1) {
      pointerRef.current += 1;
      setState(historyRef.current[pointerRef.current]);
    }
  }, []);

  const reset = useCallback((val: T) => {
    historyRef.current = [val];
    pointerRef.current = 0;
    setState(val);
  }, []);

  return [state, set, undo, redo, reset] as const;
}

export function FlashcardBuilder() {
  const { 
    docs, 
    activeDocId, 
    setActiveDocId, 
    decks, 
    addDeck, 
    updateDeckTitle, 
    removeDeck, 
    restoreDeck, 
    addFlashcardToDeck, 
    updateFlashcardInDeck, 
    removeFlashcardFromDeck, 
    enableShortcuts 
  } = useAppStore();
  const isWeb = import.meta.env.VITE_APP_MODE === 'web';
  
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || 'new');
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [isRenamingDeck, setIsRenamingDeck] = useState(false);
  const [deckRenameInput, setDeckRenameInput] = useState('');
  
  // Reference search state
  const [refSearchQuery, setRefSearchQuery] = useState('');

  // Editing card state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Undo/Redo Engine
  const [{ front, back }, setForm, undo, redo, resetForm] = useHistoryState({ front: '', back: '' });
  const setFront = (val: string) => setForm({ front: val, back });
  const setBack = (val: string) => setForm({ front, back: val });

  // Smart Highlighter State
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSeenShortcutHint = useRef(false);

  const activeDeck = decks.find(d => d.id === selectedDeckId);
  const activeDoc = docs.find(d => d.id === activeDocId) || docs[0];

  const handleAddDeck = () => {
    if (newDeckTitle.trim()) {
      const id = addDeck(newDeckTitle.trim());
      setNewDeckTitle('');
      setSelectedDeckId(id);
      toast.success("Deck created!");
    }
  };

  const handleStartRenameDeck = () => {
    if (activeDeck) {
      setDeckRenameInput(activeDeck.title);
      setIsRenamingDeck(true);
    }
  };

  const handleSaveRenameDeck = () => {
    if (activeDeck && deckRenameInput.trim()) {
      updateDeckTitle(activeDeck.id, deckRenameInput.trim());
      setIsRenamingDeck(false);
      toast.success("Deck renamed");
    }
  };

  const handleDeleteDeck = () => {
    if (!activeDeck) return;
    const deckToDelete = activeDeck;
    removeDeck(deckToDelete.id);
    setSelectedDeckId(decks.filter(d => d.id !== deckToDelete.id)[0]?.id || 'new');
    toast("FlashDeck deleted", {
      action: {
        label: "Undo",
        onClick: () => restoreDeck(deckToDelete)
      }
    });
  };

  const handleSaveCard = () => {
    if (!selectedDeckId || !front.trim() || !back.trim()) return;

    if (editingCardId) {
      updateFlashcardInDeck(selectedDeckId, editingCardId, { front: front.trim(), back: back.trim() });
      setEditingCardId(null);
      resetForm({ front: '', back: '' });
      toast.success("Card updated!");
    } else {
      addFlashcardToDeck(selectedDeckId, { front: front.trim(), back: back.trim() });
      resetForm({ front: '', back: '' });
      toast.success("Card added to deck!");
    }
  };

  const handleStartEditCard = (card: { id: string; front: string; back: string }) => {
    setEditingCardId(card.id);
    resetForm({ front: card.front, back: card.back });
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    resetForm({ front: '', back: '' });
  };

  // Keyboard Shortcuts & Undo/Redo Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo / Redo
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

      // Highlighter Shortcuts (Ctrl+F, Ctrl+B) - Only intercept when text is actually selected!
      if (enableShortcuts && !isWeb && e.ctrlKey) {
        const selection = window.getSelection()?.toString().trim();
        if (selection && selection.length > 0) {
          if (e.key.toLowerCase() === 'f') {
            e.preventDefault();
            setFront(selection);
            toast.success("Piped to Front", { duration: 1500 });
          }
          if (e.key.toLowerCase() === 'b') {
            e.preventDefault();
            setBack(selection);
            toast.success("Piped to Back", { duration: 1500 });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcuts, isWeb, undo, redo, front, back, setFront, setBack]);

  // Handle Text Selection for Highlighter
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !textRef.current?.contains(selection.anchorNode)) {
        setPopoverStyle(null);
        return;
      }

      const text = selection.toString().trim();
      if (text) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setPopoverStyle({
          top: Math.max(10, rect.top - 50),
          left: Math.max(100, Math.min(window.innerWidth - 150, rect.left + rect.width / 2)),
          position: 'fixed',
        });
        setSelectedText(text);

        if (!hasSeenShortcutHint.current && enableShortcuts && !isWeb) {
          hasSeenShortcutHint.current = true;
          toast("Shortcut Tip", { 
            description: "Highlight text and press Ctrl+F (Front) or Ctrl+B (Back) to pipe instantly!" 
          });
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [enableShortcuts, isWeb]);

  // Filtered reference text
  const rawReferenceText = activeDoc?.content || '';

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-8rem)] pb-12">
      
      {/* Smart Highlighter Popover */}
      {popoverStyle && (
        <div 
          style={{ ...popoverStyle, transform: 'translateX(-50%)' }}
          className="z-50 flex gap-2 bg-background/95 backdrop-blur border border-border shadow-2xl rounded-xl p-2 animate-in fade-in zoom-in duration-200"
        >
          <Button size="sm" onClick={() => { setFront(selectedText); setPopoverStyle(null); }}>
            Set Front
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setBack(selectedText); setPopoverStyle(null); }}>
            Set Back
          </Button>
        </div>
      )}

      {/* Left Pane: Knowledge Base Reference */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Reference Notes</h2>
          </div>
          {docs.length > 1 && (
            <select
              value={activeDoc?.id}
              onChange={(e) => setActiveDocId(e.target.value)}
              className="text-xs bg-muted/40 border border-border rounded-lg px-2 py-1 max-w-[200px] truncate"
            >
              {docs.map(doc => (
                <option key={doc.id} value={doc.id} className="dark:bg-[#0a0a0a]">
                  {doc.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search inside notes */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within notes..."
            value={refSearchQuery}
            onChange={(e) => setRefSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-8 py-2 rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {refSearchQuery && (
            <button 
              onClick={() => setRefSearchQuery('')} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">Highlight any text below to pipe it into your flashcard!</p>
        
        <div ref={textRef} className="flex-1 overflow-auto rounded-xl border border-border bg-muted/10 p-6 shadow-inner max-h-[60vh] lg:max-h-[70vh]">
          {rawReferenceText ? (
            <p className="whitespace-pre-wrap text-sm text-foreground/90 font-mono leading-relaxed selection:bg-primary/30">
              {rawReferenceText}
            </p>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Your Knowledge Base is empty. Go to the <span className="font-semibold text-primary">Knowledge Base</span> tab to add your study notes!
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Flashcard Builder */}
      <div className="flex-1 flex flex-col space-y-6">
        
        {/* Deck Header & Controls */}
        <div className="space-y-3 bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" /> Active FlashDeck
            </h2>
            {activeDeck && selectedDeckId !== 'new' && (
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs gap-1"
                  onClick={handleStartRenameDeck}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Rename
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs text-red-500 hover:text-red-600 gap-1"
                  onClick={handleDeleteDeck}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Deck
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <select 
              value={selectedDeckId} 
              onChange={(e) => {
                setSelectedDeckId(e.target.value);
                setEditingCardId(null);
                resetForm({ front: '', back: '' });
                setIsRenamingDeck(false);
              }}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="new" className="dark:bg-[#0a0a0a]">➕ Create New FlashDeck</option>
              {decks.map(d => (
                <option key={d.id} value={d.id} className="dark:bg-[#0a0a0a]">{d.title} ({d.cards.length} cards)</option>
              ))}
            </select>
          </div>

          {/* Rename Box */}
          {isRenamingDeck && activeDeck && (
            <div className="flex items-center gap-2 pt-2 animate-in fade-in">
              <Input
                value={deckRenameInput}
                onChange={(e) => setDeckRenameInput(e.target.value)}
                placeholder="New Deck Name"
                className="h-9 text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveRenameDeck} className="gap-1 h-9">
                <Check className="w-3.5 h-3.5" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsRenamingDeck(false)} className="h-9">
                Cancel
              </Button>
            </div>
          )}

          {/* Create New Deck Inline */}
          {selectedDeckId === 'new' && (
            <div className="flex gap-2 pt-2">
              <Input 
                placeholder="Enter new deck title (e.g., Organic Chemistry)..." 
                value={newDeckTitle} 
                onChange={(e) => setNewDeckTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDeck()}
              />
              <Button onClick={handleAddDeck} variant="primary" className="gap-2 shrink-0">
                <FolderPlus className="w-4 h-4" /> Create Deck
              </Button>
            </div>
          )}
        </div>

        {/* Card Creation / Editing Form */}
        {selectedDeckId !== 'new' && (
          <div className="space-y-4 bg-muted/10 border border-border p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">
                {editingCardId ? (
                  <span className="text-primary flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> Editing Card
                  </span>
                ) : (
                  "Create Flashcard"
                )}
              </h3>
              {editingCardId && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-xs h-7">
                  Cancel Edit
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Front (Question or Term)</label>
              <Input 
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="e.g., What is the speed of light in a vacuum?" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Back (Answer or Definition)</label>
              <TextArea 
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="e.g., 299,792,458 meters per second" 
                className="min-h-[90px]"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSaveCard} 
                disabled={!front.trim() || !back.trim()} 
                className="w-full gap-2"
              >
                {editingCardId ? (
                  <>
                    <Check className="w-4 h-4" /> Save Card Changes
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Card to Deck
                  </>
                )}
              </Button>
              {editingCardId && (
                <Button variant="secondary" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Existing Cards Preview */}
        {selectedDeckId !== 'new' && activeDeck && (
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cards in Deck ({activeDeck.cards.length})
              </h3>
            </div>

            {activeDeck.cards.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                No cards in this deck yet. Use the form above to add your first card!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[45vh] overflow-y-auto pr-2">
                {activeDeck.cards.map((card, idx) => {
                  const isCurrentlyEditing = editingCardId === card.id;
                  return (
                    <div 
                      key={card.id} 
                      className={`relative group rounded-xl transition-all ${
                        isCurrentlyEditing ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                      }`}
                    >
                      <Flashcard front={card.front} back={card.back} className="h-44" />
                      
                      <div className="absolute top-3 left-3 bg-background/80 backdrop-blur px-2 py-0.5 rounded text-xs text-muted-foreground font-mono">
                        #{idx + 1}
                      </div>

                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/90 backdrop-blur rounded-lg p-1 border border-border shadow-sm">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1.5 h-auto text-xs gap-1"
                          onClick={(e) => { 
                            e.stopPropagation();
                            handleStartEditCard(card);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1.5 h-auto text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (editingCardId === card.id) handleCancelEdit();
                            removeFlashcardFromDeck(selectedDeckId, card.id);
                            toast("Flashcard deleted", {
                              action: {
                                label: "Undo",
                                onClick: () => addFlashcardToDeck(selectedDeckId, { front: card.front, back: card.back })
                              }
                            });
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
