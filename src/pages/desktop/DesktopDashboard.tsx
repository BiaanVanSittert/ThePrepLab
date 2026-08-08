import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { BookOpen, Layers, PenTool, CheckCircle, GraduationCap, Download, ArrowRight, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import pkg from '../../../package.json';
import { ExportModal } from '../../components/modals/ExportModal';
import { ImportModal } from '../../components/modals/ImportModal';

export function DesktopDashboard() {
  const { decks, exams, knowledgeBase, results, clearResults } = useAppStore();
  const totalCards = decks.reduce((acc, deck) => acc + deck.cards.length, 0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [importContent, setImportContent] = useState<string | null>(null);

  useEffect(() => {
    // Only check once on mount
    fetch('https://api.github.com/repos/BiaanVanSittert/ThePrepLab/releases/latest')
      .then(res => res.json())
      .then(data => {
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

  const handleManualUpdateCheck = () => {
    toast.loading("Checking for updates...", { id: 'update-check' });
    fetch('https://api.github.com/repos/BiaanVanSittert/ThePrepLab/releases/latest')
      .then(res => res.json())
      .then(data => {
        const latestVersion = data.tag_name?.replace(/^v/i, '');
        if (latestVersion && latestVersion !== pkg.version) {
          toast.success(`Version ${data.tag_name} is available!`, {
            id: 'update-check',
            description: "A newer version is ready.",
            action: {
              label: "Download",
              onClick: () => window.open("https://github.com/BiaanVanSittert/ThePrepLab/releases/latest", "_blank")
            }
          });
        } else {
          toast.success("ThePrepLab is up to date!", { id: 'update-check' });
        }
      })
      .catch(() => toast.error("Failed to check for updates", { id: 'update-check' }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImportContent(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
    // Reset input so they can select the same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const recentScores = results.slice(-3).reverse();
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / results.length * 100)
    : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".json" className="hidden" />
      
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      {importContent && <ImportModal fileContent={importContent} onClose={() => setImportContent(null)} />}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to ThePrepLab</h1>
          <p className="text-lg text-muted-foreground">Your local, distraction-free study environment.</p>
        </div>
        <div className="text-right space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Version {pkg.version}</p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={handleManualUpdateCheck}>
              Check for Updates
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsExportOpen(true)} title="Export Data">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => fileInputRef.current?.click()} title="Import Data">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            <label className="flex items-center justify-end gap-2 text-xs text-muted-foreground mt-1 cursor-pointer">
              <input type="checkbox" checked={useAppStore(s => s.enableShortcuts)} onChange={(e) => useAppStore.getState().toggleShortcuts(e.target.checked)} className="rounded border-gray-300" />
              Builder Shortcuts (Ctrl+F/B)
            </label>
          </div>
        </div>
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
          <p className="text-3xl font-semibold">{totalCards}</p>
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
                <h3 className="text-xl font-medium">Study FlashDeck</h3>
                <p className="text-muted-foreground">Review your decks using spaced practice.</p>
              </div>
            </div>
          </Link>
          <Link to="/exam" className="group">
            <div className="p-8 rounded-xl border border-border bg-primary/5 hover:bg-primary/10 transition-colors h-full space-y-4">
              <CheckCircle className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-xl font-medium">Take Exam</h3>
                <p className="text-muted-foreground">Test your knowledge with your custom mock exams.</p>
              </div>
            </div>
          </Link>
          <Link to="/flashcards" className="p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <PenTool className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold mb-1">FlashDeck Builder</h3>
            <p className="text-sm text-muted-foreground">Create new cards and decks.</p>
          </Link>
          <Link to="/exam-builder" className="p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold mb-1">Exam Builder</h3>
            <p className="text-sm text-muted-foreground">Craft new multiple-choice & short answer exams.</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Recent Scores</h2>
            <Button variant="ghost" size="sm" onClick={clearResults} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2">
              <Trash2 className="w-4 h-4" /> Clear History
            </Button>
          </div>
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
