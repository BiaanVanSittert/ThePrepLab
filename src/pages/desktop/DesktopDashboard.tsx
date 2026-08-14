import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { BookOpen, Layers, PenTool, CheckCircle, GraduationCap, ArrowRight, Trash2, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import pkg from '../../../package.json';

export function DesktopDashboard() {
  const { docs, decks, exams, results, clearResults, removeResult } = useAppStore();
  const [historyFilter, setHistoryFilter] = useState<'all' | 'exam' | 'flashdeck'>('all');

  const totalCards = decks.reduce((acc, deck) => acc + deck.cards.length, 0);

  useEffect(() => {
    // Only check once on mount
    fetch('https://api.github.com/repos/BiaanVanSittert/ThePrepLab/releases/latest', { cache: 'no-store' })
      .then(async res => {
        if (!res.ok) return;
        const data = await res.json();
        const latestVersion = data.tag_name?.replace(/^v/i, '');
        if (latestVersion && latestVersion !== pkg.version) {
          toast.info(`Version ${data.tag_name} is available!`, {
            description: "Click to download the latest release.",
            action: {
              label: "Download",
              onClick: () => window.open("https://github.com/BiaanVanSittert/ThePrepLab/releases/latest", "_blank")
            },
            duration: 10000,
          });
        }
      })
      .catch(() => {});
  }, []);

  const validResults = results.filter(r => r.total > 0);
  const averageScore = validResults.length > 0 
    ? Math.round(validResults.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / validResults.length * 100)
    : 0;

  const filteredScores = results
    .filter(r => {
      if (historyFilter === 'all') return true;
      return r.type === historyFilter;
    })
    .slice(-8)
    .reverse();

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Welcome to ThePrepLab</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Your local, distraction-free study and exam prep environment.</p>
        </div>
        <Link to="/create">
          <Button size="lg" className="gap-2 shadow-md">
            <Sparkles className="w-4 h-4" /> Create+ Hub
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-2 hover:border-primary/40 transition-colors">
          <BookOpen className="w-5 h-5 text-primary mb-2" />
          <p className="text-3xl font-bold">{docs.length}</p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Notebooks</p>
        </div>
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-2 hover:border-primary/40 transition-colors">
          <Layers className="w-5 h-5 text-primary mb-2" />
          <p className="text-3xl font-bold">{totalCards}</p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Flashcards ({decks.length} Decks)</p>
        </div>
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-2 hover:border-primary/40 transition-colors">
          <PenTool className="w-5 h-5 text-primary mb-2" />
          <p className="text-3xl font-bold">{exams.length}</p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mock Exams</p>
        </div>
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-2 hover:border-primary/40 transition-colors">
          <GraduationCap className="w-5 h-5 text-primary mb-2" />
          <p className="text-3xl font-bold">{validResults.length > 0 ? `${averageScore}%` : "N/A"}</p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Average Recall Rate</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Link to="/study" className="group">
            <div className="p-6 sm:p-8 rounded-2xl border border-border bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all h-full space-y-3 shadow-sm">
              <Layers className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Study FlashDecks</h3>
                <p className="text-sm text-muted-foreground">Review with 3D flashcards, shuffle mode, and missed-card drills.</p>
              </div>
            </div>
          </Link>
          <Link to="/exam" className="group">
            <div className="p-6 sm:p-8 rounded-2xl border border-border bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all h-full space-y-3 shadow-sm">
              <CheckCircle className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Take Mock Exam</h3>
                <p className="text-sm text-muted-foreground">Test yourself with countdown timers, question flagging, and detailed breakdowns.</p>
              </div>
            </div>
          </Link>
          <Link to="/flashcards" className="p-5 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-colors group flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">FlashDeck Builder</h3>
                <p className="text-xs text-muted-foreground">Add and edit cards with Smart Highlighter.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/exam-builder" className="p-5 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-colors group flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Mock Exam Builder</h3>
                <p className="text-xs text-muted-foreground">Craft custom timed questions and explanations.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* History & Analytics */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Session History
            </h2>
            {results.length > 0 && (
              <div className="flex gap-1 text-xs">
                {(['all', 'flashdeck', 'exam'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setHistoryFilter(tab)}
                    className={`px-2.5 py-0.5 rounded-lg font-medium transition-colors ${
                      historyFilter === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {tab === 'all' ? 'All' : tab === 'flashdeck' ? 'Decks' : 'Exams'}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {results.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearResults} 
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs gap-1.5 h-8"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </Button>
          )}
        </div>
        
        {results.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-muted/5">
            <p className="text-muted-foreground text-sm">No study history recorded yet. Complete a FlashDeck session or Mock Exam to start tracking your progress!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredScores.map(res => {
              const isDeck = res.type === 'flashdeck';
              const targetList = isDeck ? decks : exams;
              const titleLookupId = res.referenceId || res.examId;
              const sourceItem = targetList.find((item: any) => item.id === titleLookupId);
              const percentage = res.total > 0 ? Math.round((res.score / res.total) * 100) : 0;
              
              return (
                <div key={res.id} className="p-4 rounded-xl border border-border flex justify-between items-center bg-card hover:bg-muted/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isDeck ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                      {isDeck ? <Layers className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {sourceItem?.title || (isDeck ? 'Archived FlashDeck' : 'Archived Exam')}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(res.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`font-bold text-base ${percentage >= 80 ? 'text-green-600 dark:text-green-400' : percentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'}`}>
                      {percentage}% <span className="text-xs font-normal text-muted-foreground ml-1">({res.score}/{res.total})</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 h-auto rounded-lg"
                      onClick={() => removeResult(res.id)}
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
    </div>
  );
}
