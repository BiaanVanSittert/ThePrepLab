import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Flashcard } from '../components/ui/Flashcard';
import { Check, X, RefreshCcw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function StudyMode() {
  const { decks, removeDeck } = useAppStore();
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState({ remembered: 0, forgotten: 0 });

  const isWeb = import.meta.env.VITE_APP_MODE === 'web';

  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-semibold">No FlashDecks found</h2>
        <p className="text-muted-foreground">Create a deck first to start studying!</p>
        <Link to="/flashcards">
          <Button>Go to Builder</Button>
        </Link>
      </div>
    );
  }

  // Deck Selection Screen
  if (!selectedDeckId) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Select a FlashDeck</h2>
        <div className="grid gap-4">
          {decks.map(deck => (
            <div key={deck.id} className="p-6 border border-border rounded-xl flex items-center justify-between bg-muted/5 hover:bg-muted/10 transition-colors group">
              <div>
                <h3 className="font-semibold text-lg">{deck.title}</h3>
                <p className="text-sm text-muted-foreground">{deck.cards.length} Cards</p>
              </div>
              <div className="flex items-center gap-2">
                {!isWeb && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); removeDeck(deck.id); }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
                <Button onClick={() => { setSelectedDeckId(deck.id); setCurrentIndex(0); setCompleted(false); setScore({ remembered: 0, forgotten: 0}); }} disabled={deck.cards.length === 0}>
                  Study
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeDeck = decks.find(d => d.id === selectedDeckId);
  if (!activeDeck || activeDeck.cards.length === 0) return null; // Fallback

  const handleNext = (remembered: boolean) => {
    setScore(prev => ({
      remembered: prev.remembered + (remembered ? 1 : 0),
      forgotten: prev.forgotten + (remembered ? 0 : 1)
    }));

    if (currentIndex + 1 < activeDeck.cards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore({ remembered: 0, forgotten: 0 });
    setCompleted(false);
  };

  if (completed) {
    if (isWeb) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-bold">Demo Completed!</h2>
            <p className="text-lg text-muted-foreground">You scored {score.remembered} / {activeDeck.cards.length} on this demo FlashDeck.</p>
          </div>
          
          <div className="p-8 border border-primary/30 bg-primary/5 rounded-2xl space-y-6 w-full">
            <h3 className="text-2xl font-bold text-primary">Ready to create your own?</h3>
            <p className="text-muted-foreground">
              Download the free desktop application to build unlimited custom FlashDecks and Exams directly from your own study materials!
            </p>
            <a href="https://github.com/BiaanVanSittert/ThePrepLab/releases/latest" target="_blank" rel="noopener noreferrer" className="block">
              <Button size="lg" className="w-full text-lg h-14">
                Download for Windows
              </Button>
            </a>
          </div>

          <Button onClick={() => setSelectedDeckId(null)} variant="ghost" className="text-muted-foreground">
            Try a different demo FlashDeck
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
          <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold">FlashDeck Completed!</h2>
        <div className="flex gap-8 text-lg">
          <p className="text-green-600 dark:text-green-400 font-medium">Remembered: {score.remembered}</p>
          <p className="text-red-500 font-medium">Needs Practice: {score.forgotten}</p>
        </div>
        <div className="flex gap-4 pt-4">
          <Button onClick={handleRestart} variant="outline" className="gap-2">
            <RefreshCcw className="w-4 h-4" /> Study Again
          </Button>
          <Button onClick={() => setSelectedDeckId(null)}>Choose Another Deck</Button>
        </div>
      </div>
    );
  }

  const currentCard = activeDeck.cards[currentIndex];

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto py-12 space-y-8 h-[calc(100vh-8rem)]">
      
      <div className="w-full flex justify-between items-center text-sm font-medium text-muted-foreground">
        <span>Card {currentIndex + 1} of {activeDeck.cards.length}</span>
        <span>{Math.round((currentIndex / activeDeck.cards.length) * 100)}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentIndex / activeDeck.cards.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        <Flashcard 
          key={currentCard.id}
          front={currentCard.front} 
          back={currentCard.back} 
          className="h-80 md:h-96 w-full max-w-lg text-2xl"
        />
      </div>

      <div className="space-y-4 w-full text-center">
        <p className="text-sm text-muted-foreground mb-4">Flip the card, then rate your memory.</p>
        <div className="flex justify-center gap-4">
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => handleNext(false)}
            className="w-40 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
          >
            <X className="w-5 h-5 mr-2" /> Forgot
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => handleNext(true)}
            className="w-40 border-green-200 hover:bg-green-50 dark:border-green-900/50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
          >
            <Check className="w-5 h-5 mr-2" /> Got It
          </Button>
        </div>
      </div>
    </div>
  );
}
