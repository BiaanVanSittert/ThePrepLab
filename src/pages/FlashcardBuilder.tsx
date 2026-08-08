import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { TextArea } from '../components/ui/TextArea';
import { Input } from '../components/ui/Input';
import { Flashcard } from '../components/ui/Flashcard';
import { Plus, Trash2, FolderPlus } from 'lucide-react';
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
      if (oldState.front && !newS.front && oldState.front.length > 20) {
        toast("Accidentally deleted?", { description: "Press Ctrl+Z to undo." });
      }
      if (oldState.back && !newS.back && oldState.back.length > 20) {
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

  return [state, set, undo, redo] as const;
}

export function FlashcardBuilder() {
  const { knowledgeBase, decks, addDeck, addFlashcardToDeck, removeFlashcardFromDeck, enableShortcuts } = useAppStore();
  const isWeb = import.meta.env.VITE_APP_MODE === 'web';
  
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');
  const [newDeckTitle, setNewDeckTitle] = useState('');

  // Undo/Redo Engine
  const [{ front, back }, setForm, undo, redo] = useHistoryState({ front: '', back: '' });
  const setFront = (val: string) => setForm({ front: val, back });
  const setBack = (val: string) => setForm({ front, back: val });

  // Smart Highlighter State
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const textRef = useRef<HTMLDivElement>(null);
  const hasSeenShortcutHint = useRef(false);

  const handleAddDeck = () => {
    if (newDeckTitle.trim()) {
      addDeck(newDeckTitle);
      setNewDeckTitle('');
    }
  };

  const handleAddCard = () => {
    if (selectedDeckId && front.trim() && back.trim()) {
      addFlashcardToDeck(selectedDeckId, { front, back });
      setForm({ front: '', back: '' });
    }
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

      // Highlighter Shortcuts (Ctrl+F, Ctrl+B)
      if (enableShortcuts && !isWeb && e.ctrlKey) {
        if (e.key.toLowerCase() === 'f') {
          e.preventDefault();
          const selection = window.getSelection()?.toString().trim();
          if (selection) {
            setFront(selection);
            toast.success("Piped to Front", { duration: 1500 });
          }
        }
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          const selection = window.getSelection()?.toString().trim();
          if (selection) {
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
          top: rect.top - 50 + window.scrollY,
          left: rect.left + rect.width / 2 + window.scrollX,
        });
        setSelectedText(text);

        if (!hasSeenShortcutHint.current && enableShortcuts && !isWeb) {
          hasSeenShortcutHint.current = true;
          toast("Shortcut Tip", { 
            description: "You can also use Ctrl+F and Ctrl+B to pipe highlighted text!" 
          });
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [enableShortcuts, isWeb]);

  const activeDeck = decks.find(d => d.id === selectedDeckId);

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-8rem)]">
      
      {/* Smart Highlighter Popover */}
      {popoverStyle && (
        <div 
          style={{ ...popoverStyle, transform: 'translateX(-50%)' }}
          className="absolute z-50 flex gap-2 bg-background border border-border shadow-xl rounded-lg p-2 animate-in fade-in zoom-in duration-200"
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
        <h2 className="text-xl font-semibold">Reference Material</h2>
        <p className="text-xs text-muted-foreground">Highlight any text below to quickly add it to your flashcard!</p>
        <div ref={textRef} className="flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-6 shadow-inner">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground font-mono leading-relaxed selection:bg-primary/30">
            {knowledgeBase || "Your knowledge base is empty. Head over to the Knowledge Base tab to add some content."}
          </p>
        </div>
      </div>

      {/* Right Pane: Builder */}
      <div className="flex-1 flex flex-col space-y-6">
        <h2 className="text-xl font-semibold">Deck Selection</h2>
        
        <div className="flex gap-4">
          <select 
            value={selectedDeckId} 
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="" disabled>Select a deck...</option>
            {decks.map(d => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2">
          <Input 
            placeholder="New Deck Title" 
            value={newDeckTitle} 
            onChange={(e) => setNewDeckTitle(e.target.value)}
          />
          <Button onClick={handleAddDeck} variant="outline" className="gap-2">
            <FolderPlus className="w-4 h-4" /> Create
          </Button>
        </div>

        {selectedDeckId && (
          <>
            <h2 className="text-xl font-semibold mt-4">Create Flashcard</h2>
            <div className="space-y-4 bg-muted/10 border border-border p-4 rounded-xl shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-medium">Front</label>
                <Input 
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="Question or Term" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Back</label>
                <TextArea 
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Answer or Definition" 
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={handleAddCard} disabled={!front || !back} className="w-full gap-2">
                <Plus className="w-4 h-4" /> Add Card to Deck
              </Button>
            </div>

            {/* Existing Cards Preview */}
            <div className="flex-1 overflow-auto space-y-4 pr-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cards in Deck ({activeDeck?.cards.length || 0})</h3>
              <div className="grid grid-cols-1 gap-4">
                {activeDeck?.cards.map(card => (
                  <div key={card.id} className="relative group">
                    <Flashcard front={card.front} back={card.back} className="h-48" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background"
                      onClick={(e) => { e.stopPropagation(); removeFlashcardFromDeck(selectedDeckId, card.id); }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
