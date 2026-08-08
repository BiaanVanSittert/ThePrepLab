
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Flashcard } from '../components/ui/Flashcard';
import { Download, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  return (
    <div className="flex flex-col gap-16 items-center justify-center min-h-[70vh]">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-2xl mt-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary">
          Master your materials with <br className="hidden sm:inline" />
          <span className="text-muted-foreground">ThePrepLab</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          A minimalist, local-first application to build custom mock exams and flashcards directly from your knowledge base.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Download className="w-4 h-4" />
            Download for Windows
          </Button>
          <Link to="/knowledge">
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              Go to App <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Data is stored locally in your browser for this demo. Download the desktop app for the full local-first experience.
        </p>
      </section>

      {/* Demo Section */}
      <section className="w-full max-w-4xl space-y-12 pt-12 border-t border-border">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Interactive Demo</h2>
          <p className="text-sm text-muted-foreground">Try flipping a flashcard or interacting with the minimal UI components.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-start justify-center">
          {/* Components Demo */}
          <div className="flex-1 space-y-6 w-full max-w-sm mx-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium">Knowledge Base Input</label>
              <TextArea placeholder="Paste your study notes here..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic Search</label>
              <Input placeholder="Search concepts..." />
            </div>
          </div>

          {/* Flashcard Demo */}
          <div className="flex-1 w-full flex items-center justify-center max-w-sm mx-auto">
            <Flashcard 
              front="What is the powerhouse of the cell?" 
              back="The mitochondria." 
              className="h-56"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
