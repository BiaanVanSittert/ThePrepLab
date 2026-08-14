import { useState, useEffect, useCallback } from 'react';
import { useAppStore, FlashcardData } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Flashcard } from '../components/ui/Flashcard';
import { Check, X, RefreshCcw, Trash2, Shuffle, ArrowLeft, ArrowRight, RotateCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function StudyMode() {
  const { decks, removeDeck, addResult } = useAppStore();
  
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [studyCards, setStudyCards] = useState<FlashcardData[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<{ remembered: FlashcardData[], forgotten: FlashcardData[] }>({ 
    remembered: [], 
    forgotten: [] 
  });
  const [isMissedReviewMode, setIsMissedReviewMode] = useState(false);

  const isWeb = import.meta.env.VITE_APP_MODE === 'web';
  const activeDeck = decks.find(d => d.id === selectedDeckId);

  const startDeckSession = useCallback((deckCards: FlashcardData[], shuffle: boolean, isMissedReview = false) => {
    let cards = [...deckCards];
    if (shuffle) {
      cards = cards.sort(() => Math.random() - 0.5);
    }
    setStudyCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
    setScore({ remembered: [], forgotten: [] });
    setIsMissedReviewMode(isMissedReview);
  }, []);

  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    const targetDeck = decks.find(d => d.id === deckId);
    if (targetDeck && targetDeck.cards.length > 0) {
      startDeckSession(targetDeck.cards, isShuffled);
    }
  };

  const handleNext = useCallback((remembered: boolean) => {
    if (studyCards.length === 0 || currentIndex >= studyCards.length) return;
    const currentCard = studyCards[currentIndex];

    const newScore = {
      remembered: remembered ? [...score.remembered, currentCard] : score.remembered,
      forgotten: !remembered ? [...score.forgotten, currentCard] : score.forgotten
    };
    setScore(newScore);
    setIsFlipped(false);

    if (currentIndex + 1 < studyCards.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
      if (selectedDeckId && !isMissedReviewMode) {
        addResult({
          type: 'flashdeck',
          referenceId: selectedDeckId,
          date: new Date().toISOString(),
          score: newScore.remembered.length,
          total: studyCards.length
        });
      }
    }
  }, [studyCards, currentIndex, score, selectedDeckId, isMissedReviewMode, addResult]);

  // Keyboard Shortcuts for Study Mode
  useEffect(() => {
    if (!selectedDeckId || completed || studyCards.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input (not typically present in study mode, but safe)
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        handleNext(false);
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        e.preventDefault();
        handleNext(true);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (activeDeck) startDeckSession(activeDeck.cards, isShuffled);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDeckId, completed, studyCards, handleNext, activeDeck, isShuffled, startDeckSession]);

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
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Select a FlashDeck</h2>
            <p className="text-muted-foreground mt-1">Choose a deck to begin your active recall session.</p>
          </div>
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              isShuffled 
                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' 
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            Shuffle Cards: {isShuffled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="grid gap-4">
          {decks.map(deck => (
            <div 
              key={deck.id} 
              onClick={() => deck.cards.length > 0 && handleSelectDeck(deck.id)}
              className={`p-6 border border-border rounded-2xl flex items-center justify-between bg-card hover:border-primary/50 hover:shadow-md transition-all group ${
                deck.cards.length > 0 ? 'cursor-pointer' : 'opacity-60'
              }`}
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{deck.title}</h3>
                <p className="text-sm text-muted-foreground">{deck.cards.length} Cards</p>
              </div>
              <div className="flex items-center gap-2">
                {!isWeb && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-500/10"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      removeDeck(deck.id); 
                      toast("FlashDeck deleted", {
                        action: {
                          label: "Undo",
                          onClick: () => useAppStore.getState().restoreDeck(deck)
                        }
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button disabled={deck.cards.length === 0} className="gap-2">
                  Study <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback if deck has no cards
  if (studyCards.length === 0) return null;

  // Completion Screen
  if (completed) {
    const accuracy = Math.round((score.remembered.length / studyCards.length) * 100);
    
    const renderBreakdown = () => (
      <div className="w-full text-left space-y-4 max-h-96 overflow-y-auto p-5 border border-border rounded-2xl bg-muted/10">
        <h3 className="font-semibold text-base border-b border-border pb-2">Results Breakdown</h3>
        {score.forgotten.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-red-500 font-semibold text-xs uppercase tracking-wider flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Needs Practice ({score.forgotten.length})
            </h4>
            {score.forgotten.map((card, idx) => (
              <div key={card.id || idx} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl space-y-1">
                <p className="font-medium text-sm text-foreground">{card.front}</p>
                <p className="text-xs text-muted-foreground">{card.back}</p>
              </div>
            ))}
          </div>
        )}
        {score.remembered.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-green-600 dark:text-green-400 font-semibold text-xs uppercase tracking-wider flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Remembered ({score.remembered.length})
            </h4>
            {score.remembered.map((card, idx) => (
              <div key={card.id || idx} className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                <p className="font-medium text-sm text-foreground">{card.front}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center animate-in fade-in zoom-in duration-500 max-w-3xl mx-auto">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${
          accuracy >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-primary/10 text-primary'
        }`}>
          {accuracy >= 80 ? <Sparkles className="w-12 h-12" /> : <Check className="w-12 h-12" />}
        </div>
        
        <div className="space-y-1">
          <h2 className="text-3xl font-bold">
            {isMissedReviewMode ? "Missed Cards Review Complete!" : "FlashDeck Completed!"}
          </h2>
          <p className="text-muted-foreground text-lg">
            You remembered {score.remembered.length} out of {studyCards.length} cards ({accuracy}%).
          </p>
        </div>

        {/* Highlight Action: Study Missed Cards */}
        {score.forgotten.length > 0 && (
          <div className="w-full p-4 border border-red-500/30 bg-red-500/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="font-semibold text-foreground">Reinforce your weak spots</h4>
              <p className="text-xs text-muted-foreground">Drill the {score.forgotten.length} card{score.forgotten.length > 1 ? 's' : ''} you marked as forgotten right now.</p>
            </div>
            <Button 
              onClick={() => startDeckSession(score.forgotten, isShuffled, true)} 
              className="bg-red-600 hover:bg-red-700 text-white gap-2 shrink-0 shadow-md"
            >
              <RotateCw className="w-4 h-4" /> Review {score.forgotten.length} Missed Card{score.forgotten.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}

        <div className="w-full">
          {renderBreakdown()}
        </div>

        <div className="flex flex-wrap gap-4 justify-center pt-2">
          {activeDeck && (
            <Button 
              onClick={() => startDeckSession(activeDeck.cards, isShuffled, false)} 
              variant="outline" 
              className="gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Study Entire Deck Again
            </Button>
          )}
          <Button onClick={() => setSelectedDeckId(null)}>
            Choose Another Deck
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = studyCards[currentIndex];

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto py-6 space-y-6 min-h-[calc(100vh-8rem)]">
      
      {/* Top Header */}
      <div className="w-full flex justify-between items-center text-sm font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedDeckId(null)} className="h-8 px-2 text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Decks
          </Button>
          <span className="font-semibold text-foreground">{activeDeck?.title}</span>
          {isMissedReviewMode && (
            <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full font-medium">
              Missed Review
            </span>
          )}
        </div>
        <span>Card {currentIndex + 1} of {studyCards.length}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / studyCards.length) * 100}%` }}
        />
      </div>

      {/* Main Flashcard Component */}
      <div className="flex-1 w-full flex items-center justify-center my-auto">
        <Flashcard 
          key={`${currentCard.id}-${currentIndex}`}
          front={currentCard.front} 
          back={currentCard.back} 
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          className="h-80 md:h-96 w-full max-w-lg text-xl md:text-2xl"
        />
      </div>

      {/* Action Controls & Rating Buttons */}
      <div className="space-y-4 w-full text-center">
        <div className="flex justify-center gap-4">
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => handleNext(false)}
            className="w-44 h-14 text-base border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold shadow-sm"
          >
            <X className="w-5 h-5 mr-2" /> Forgot [← / 1]
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => handleNext(true)}
            className="w-44 h-14 text-base border-green-200 hover:bg-green-50 dark:border-green-900/50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 font-semibold shadow-sm"
          >
            <Check className="w-5 h-5 mr-2" /> Got It [→ / 2]
          </Button>
        </div>

        {/* Keyboard navigation helper badge */}
        <div className="text-xs text-muted-foreground flex items-center justify-center gap-3 pt-2">
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Space</kbd> Flip</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">←</kbd> / <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">1</kbd> Forgot</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">→</kbd> / <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">2</kbd> Got It</span>
        </div>
      </div>
    </div>
  );
}
