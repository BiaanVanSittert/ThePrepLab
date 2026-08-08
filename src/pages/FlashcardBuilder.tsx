import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { TextArea } from '../components/ui/TextArea';
import { Input } from '../components/ui/Input';
import { Flashcard } from '../components/ui/Flashcard';
import { Plus, Trash2 } from 'lucide-react';

export function FlashcardBuilder() {
  const { knowledgeBase, flashcards, addFlashcard, removeFlashcard } = useAppStore();
  
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleAdd = () => {
    if (front.trim() && back.trim()) {
      addFlashcard({ front, back });
      setFront('');
      setBack('');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-8rem)]">
      {/* Left Pane: Knowledge Base Reference */}
      <div className="flex-1 flex flex-col space-y-4">
        <h2 className="text-xl font-semibold">Reference Material</h2>
        <div className="flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-4">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
            {knowledgeBase || "Your knowledge base is empty. Head over to the Knowledge Base tab to add some content."}
          </p>
        </div>
      </div>

      {/* Right Pane: Builder */}
      <div className="flex-1 flex flex-col space-y-6">
        <h2 className="text-xl font-semibold">Create Flashcard</h2>
        
        <div className="space-y-4 bg-muted/10 border border-border p-4 rounded-xl">
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
          <Button onClick={handleAdd} className="w-full gap-2">
            <Plus className="w-4 h-4" /> Add Card
          </Button>
        </div>

        {/* Existing Cards Preview */}
        <div className="flex-1 overflow-auto space-y-4 pr-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Deck ({flashcards.length})</h3>
          <div className="grid grid-cols-1 gap-4">
            {flashcards.map(card => (
              <div key={card.id} className="relative group">
                <Flashcard front={card.front} back={card.back} className="h-48" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background"
                  onClick={(e) => { e.stopPropagation(); removeFlashcard(card.id); }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
