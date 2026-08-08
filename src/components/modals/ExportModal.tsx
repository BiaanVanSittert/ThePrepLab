import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import { Download, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

export function ExportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { decks, exams } = useAppStore();
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set(decks.map(d => d.id)));
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set(exams.map(e => e.id)));

  if (!isOpen) return null;

  const toggleDeck = (id: string) => {
    const next = new Set(selectedDecks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedDecks(next);
  };

  const toggleExam = (id: string) => {
    const next = new Set(selectedExams);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedExams(next);
  };

  const handleExport = () => {
    const dataToExport = {
      decks: decks.filter(d => selectedDecks.has(d.id)),
      exams: exams.filter(e => selectedExams.has(e.id))
    };

    if (dataToExport.decks.length === 0 && dataToExport.exams.length === 0) {
      toast.error("Please select at least one item to export.");
      return;
    }

    const data = JSON.stringify(dataToExport);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThePrepLab_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Data exported successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card w-full max-w-lg p-6 rounded-2xl border border-border shadow-2xl relative flex flex-col max-h-[80vh]">
        <h2 className="text-2xl font-bold mb-2">Export Data</h2>
        <p className="text-muted-foreground text-sm mb-6">Select which FlashDecks and Exams you want to export.</p>
        
        <div className="flex-1 overflow-auto space-y-6 pr-2">
          {/* Decks */}
          <div>
            <h3 className="font-semibold border-b border-border pb-2 mb-3">FlashDecks ({selectedDecks.size}/{decks.length})</h3>
            <div className="space-y-2">
              {decks.length === 0 && <p className="text-sm text-muted-foreground">No decks available.</p>}
              {decks.map(deck => (
                <div key={deck.id} onClick={() => toggleDeck(deck.id)} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                  {selectedDecks.has(deck.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground" />}
                  <span className="font-medium text-sm">{deck.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exams */}
          <div>
            <h3 className="font-semibold border-b border-border pb-2 mb-3">Mock Exams ({selectedExams.size}/{exams.length})</h3>
            <div className="space-y-2">
              {exams.length === 0 && <p className="text-sm text-muted-foreground">No exams available.</p>}
              {exams.map(exam => (
                <div key={exam.id} onClick={() => toggleExam(exam.id)} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                  {selectedExams.has(exam.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground" />}
                  <span className="font-medium text-sm">{exam.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export Selected
          </Button>
        </div>
      </div>
    </div>
  );
}
