import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Flashcard } from '../components/ui/Flashcard';
import { Check, X, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function StudyMode() {
  const { flashcards } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  // In a real spaced repetition system, we'd save these metrics. For now, it's just local session state.
  const [score, setScore] = useState({ remembered: 0, forgotten: 0 });

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-semibold">Your deck is empty</h2>
        <p className="text-muted-foreground">Add some flashcards to start studying!</p>
        <Link to="/flashcards">
          <Button>Go to Flashcard Builder</Button>
        </Link>
      </div>
    );
  }

  const handleNext = (remembered: boolean) => {
    setScore(prev => ({
      remembered: prev.remembered + (remembered ? 1 : 0),
      forgotten: prev.forgotten + (remembered ? 0 : 1)
    }));

    if (currentIndex + 1 < flashcards.length) {
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
          <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold">Deck Completed!</h2>
        <div className="flex gap-8 text-lg">
          <p className="text-green-600 dark:text-green-400 font-medium">Remembered: {score.remembered}</p>
          <p className="text-red-500 font-medium">Needs Practice: {score.forgotten}</p>
        </div>
        <div className="flex gap-4 pt-4">
          <Button onClick={handleRestart} variant="outline" className="gap-2">
            <RefreshCcw className="w-4 h-4" /> Study Again
          </Button>
          <Link to="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto py-12 space-y-8 h-[calc(100vh-8rem)]">
      
      <div className="w-full flex justify-between items-center text-sm font-medium text-muted-foreground">
        <span>Card {currentIndex + 1} of {flashcards.length}</span>
        <span>{Math.round((currentIndex / flashcards.length) * 100)}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentIndex / flashcards.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        <Flashcard 
          key={currentCard.id} // Force remount for animation reset
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
