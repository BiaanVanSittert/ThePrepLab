
import { Button } from '../components/ui/Button';
import { Download, ArrowRight, Layers, CheckCircle } from 'lucide-react';
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
          <a href="https://github.com/BiaanVanSittert/ThePrepLab/releases/latest" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Download className="w-4 h-4" />
              Download for Windows
            </Button>
          </a>
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
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold">Interactive Web Demo</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Try out the core features right here in your browser! We've pre-loaded a few subjects (Science, History, Tech) so you can test the study environment immediately.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link to="/study">
              <Button size="lg" className="gap-2 px-8">
                <Layers className="w-4 h-4" />
                Try Demo Flashcards
              </Button>
            </Link>
            <Link to="/exam">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                <CheckCircle className="w-4 h-4" />
                Take Demo Exam
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
