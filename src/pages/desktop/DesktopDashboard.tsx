import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Link } from 'react-router-dom';
import { BookOpen, Layers, PenTool, CheckCircle, GraduationCap, Download } from 'lucide-react';
import pkg from '../../../package.json';

export function DesktopDashboard() {
  const { flashcards, exams, knowledgeBase, results } = useAppStore();
  const [updateAvailable, setUpdateAvailable] = useState<string | null>(null);

  useEffect(() => {
    // Simple Update Checker: Ping GitHub API for latest release
    fetch('https://api.github.com/repos/BiaanVanSittert/ThePrepLab/releases/latest')
      .then(res => res.json())
      .then(data => {
        const latestVersion = data.tag_name?.replace('v', '');
        const currentVersion = pkg.version;
        if (latestVersion && latestVersion !== currentVersion) {
          // A very naive version check. If strings don't match, assume update available.
          setUpdateAvailable(data.tag_name);
        }
      })
      .catch(console.error); // Silently fail if offline
  }, []);

  const recentScores = results.slice(-3).reverse();
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / results.length * 100)
    : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Update Banner */}
      {updateAvailable && (
        <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Update Available: {updateAvailable}</p>
            <p className="text-sm opacity-90">A new version of ThePrepLab is ready to download.</p>
          </div>
          <a href="https://github.com/BiaanVanSittert/ThePrepLab/releases/latest" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" /> Download Update
          </a>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to ThePrepLab</h1>
        <p className="text-lg text-muted-foreground">Your local, distraction-free study environment.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl border border-border bg-muted/10 space-y-2">
          <BookOpen className="w-5 h-5 text-primary mb-4" />
          <p className="text-3xl font-semibold">{knowledgeBase.length > 0 ? "Saved" : "Empty"}</p>
          <p className="text-sm text-muted-foreground">Knowledge Base</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-muted/10 space-y-2">
          <Layers className="w-5 h-5 text-primary mb-4" />
          <p className="text-3xl font-semibold">{flashcards.length}</p>
          <p className="text-sm text-muted-foreground">Total Flashcards</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-muted/10 space-y-2">
          <PenTool className="w-5 h-5 text-primary mb-4" />
          <p className="text-3xl font-semibold">{exams.length}</p>
          <p className="text-sm text-muted-foreground">Custom Exams</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-muted/10 space-y-2">
          <GraduationCap className="w-5 h-5 text-primary mb-4" />
          <p className="text-3xl font-semibold">{results.length > 0 ? `${averageScore}%` : "N/A"}</p>
          <p className="text-sm text-muted-foreground">Average Score</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/study" className="group">
            <div className="p-8 rounded-xl border border-border bg-primary/5 hover:bg-primary/10 transition-colors h-full space-y-4">
              <Layers className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-xl font-medium">Study Flashcards</h3>
                <p className="text-muted-foreground">Review your deck of {flashcards.length} cards using spaced practice.</p>
              </div>
            </div>
          </Link>
          <Link to="/exam" className="group">
            <div className="p-8 rounded-xl border border-border bg-primary/5 hover:bg-primary/10 transition-colors h-full space-y-4">
              <CheckCircle className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-xl font-medium">Take an Exam</h3>
                <p className="text-muted-foreground">Test your knowledge with one of your {exams.length} custom mock exams.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {recentScores.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Recent Scores</h2>
          <div className="space-y-3">
            {recentScores.map(res => {
              const exam = exams.find(e => e.id === res.examId);
              const percentage = Math.round((res.score / res.total) * 100);
              return (
                <div key={res.id} className="p-4 rounded-lg border border-border flex justify-between items-center bg-muted/5">
                  <div>
                    <p className="font-medium">{exam?.title || 'Deleted Exam'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(res.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-semibold text-lg ${percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {percentage}% ({res.score}/{res.total})
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
