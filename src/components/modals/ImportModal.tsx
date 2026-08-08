import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore, FlashcardDeck, AppState } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import { Upload, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ImportModalProps {
  fileContent: string | null;
  onClose: () => void;
}

export function ImportModal({ fileContent, onClose }: ImportModalProps) {
  const { importSelected } = useAppStore();
  
  const [parsedData, setParsedData] = useState<{ decks: FlashcardDeck[], exams: AppState['exams'] } | null>(null);
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set());
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (fileContent) {
      try {
        const data = JSON.parse(fileContent);
        if (data.decks && data.exams) {
          setParsedData(data);
          setSelectedDecks(new Set(data.decks.map((d: any) => d.id)));
          setSelectedExams(new Set(data.exams.map((e: any) => e.id)));
        } else {
          toast.error("Invalid file format.");
          onClose();
        }
      } catch (e) {
        toast.error("Failed to parse JSON file.");
        onClose();
      }
    }
  }, [fileContent, onClose]);

  if (!fileContent || !parsedData) return null;

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

  const handleImport = () => {
    const decksToImport = parsedData.decks.filter((d: FlashcardDeck) => selectedDecks.has(d.id));
    const examsToImport = parsedData.exams.filter((e: AppState['exams'][0]) => selectedExams.has(e.id));
    
    if (decksToImport.length === 0 && examsToImport.length === 0) {
      toast.error("Please select at least one item to import.");
      return;
    }

    importSelected(decksToImport, examsToImport);
    toast.success("Data imported successfully!");
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background w-full max-w-lg p-6 rounded-2xl border border-border shadow-2xl relative flex flex-col max-h-[80vh]">
        <h2 className="text-2xl font-bold mb-2">Import Data</h2>
        <p className="text-muted-foreground text-sm mb-6">Select which items from the file you want to import.</p>
        
        <div className="flex-1 overflow-auto space-y-6 pr-2">
          {/* Decks */}
          <div>
            <h3 className="font-semibold border-b border-border pb-2 mb-3">FlashDecks Found ({selectedDecks.size}/{parsedData.decks.length})</h3>
            <div className="space-y-2">
              {parsedData.decks.length === 0 && <p className="text-sm text-muted-foreground">No decks found in file.</p>}
              {parsedData.decks.map((deck: FlashcardDeck) => (
                <div key={deck.id} onClick={() => toggleDeck(deck.id)} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                  {selectedDecks.has(deck.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground" />}
                  <span className="font-medium text-sm">{deck.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exams */}
          <div>
            <h3 className="font-semibold border-b border-border pb-2 mb-3">Mock Exams Found ({selectedExams.size}/{parsedData.exams.length})</h3>
            <div className="space-y-2">
              {parsedData.exams.length === 0 && <p className="text-sm text-muted-foreground">No exams found in file.</p>}
              {parsedData.exams.map((exam: AppState['exams'][0]) => (
                <div key={exam.id} onClick={() => toggleExam(exam.id)} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                  {selectedExams.has(exam.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground" />}
                  <span className="font-medium text-sm">{exam.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3 text-yellow-600 dark:text-yellow-500 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>Imported items will be merged with your existing data safely. Identical items will be created as duplicates.</p>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport} className="gap-2">
            <Upload className="w-4 h-4" /> Import Selected
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
