import { Link } from 'react-router-dom';
import { Layers, CheckCircle } from 'lucide-react';

export function CreatePlus() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Create+</h1>
        <p className="text-lg text-muted-foreground">What would you like to build today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
        <Link to="/flashcards" className="group">
          <div className="p-8 rounded-2xl border-2 border-transparent bg-primary/5 hover:bg-primary/10 hover:border-primary/20 transition-all h-full flex flex-col items-center text-center space-y-6">
            <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
              <Layers className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">FlashDeck</h3>
              <p className="text-muted-foreground">Build a deck of flashcards from your study materials using the Smart Highlighter.</p>
            </div>
          </div>
        </Link>

        <Link to="/exam-builder" className="group">
          <div className="p-8 rounded-2xl border-2 border-transparent bg-primary/5 hover:bg-primary/10 hover:border-primary/20 transition-all h-full flex flex-col items-center text-center space-y-6">
            <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Mock Exam</h3>
              <p className="text-muted-foreground">Craft multiple choice and short answer exams to test your knowledge.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
