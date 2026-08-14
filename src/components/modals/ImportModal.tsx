import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore, FlashcardDeck, Exam, KnowledgeDoc } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import { Upload, CheckSquare, Square, AlertTriangle, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImportModalProps {
  fileContent: string | null;
  onClose: () => void;
}

export function ImportModal({ fileContent, onClose }: ImportModalProps) {
  const { importSelected } = useAppStore();
  
  const [parsedData, setParsedData] = useState<{ 
    docs: KnowledgeDoc[]; 
    decks: FlashcardDeck[]; 
    exams: Exam[]; 
  } | null>(null);

  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set());
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (fileContent) {
      try {
        const data = JSON.parse(fileContent);
        
        // Flexible fallback if user imported a legacy backup or partial file
        const rawDocs = Array.isArray(data.docs) ? data.docs : [];
        const rawDecks = Array.isArray(data.decks) ? data.decks : [];
        const rawExams = Array.isArray(data.exams) ? data.exams : [];

        if (rawDocs.length > 0 || rawDecks.length > 0 || rawExams.length > 0) {
          setParsedData({
            docs: rawDocs,
            decks: rawDecks,
            exams: rawExams
          });
          setSelectedDocs(new Set(rawDocs.map((d: any) => d.id || crypto.randomUUID())));
          setSelectedDecks(new Set(rawDecks.map((d: any) => d.id || crypto.randomUUID())));
          setSelectedExams(new Set(rawExams.map((e: any) => e.id || crypto.randomUUID())));
        } else {
          toast.error("No valid Notebooks, Decks, or Exams found in file.");
          onClose();
        }
      } catch (e) {
        toast.error("Failed to parse JSON file.");
        onClose();
      }
    }
  }, [fileContent, onClose]);

  if (!fileContent || !parsedData) return null;

  const toggleDoc = (id: string) => {
    const next = new Set(selectedDocs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedDocs(next);
  };

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
    const docsToImport = parsedData.docs.filter(d => selectedDocs.has(d.id));
    const decksToImport = parsedData.decks.filter(d => selectedDecks.has(d.id));
    const examsToImport = parsedData.exams.filter(e => selectedExams.has(e.id));
    
    if (docsToImport.length === 0 && decksToImport.length === 0 && examsToImport.length === 0) {
      toast.error("Please select at least one item to import.");
      return;
    }

    importSelected(decksToImport, examsToImport, docsToImport);
    toast.success("Items imported successfully!");
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background w-full max-w-lg p-6 rounded-2xl border border-border shadow-2xl relative flex flex-col max-h-[85vh]">
        <h2 className="text-2xl font-bold mb-1">Import Data</h2>
        <p className="text-muted-foreground text-sm mb-6">Select which items from the file you want to import into your workspace.</p>
        
        <div className="flex-1 overflow-auto space-y-6 pr-2">
          
          {/* Docs */}
          {parsedData.docs.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm border-b border-border pb-2 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Notebooks ({selectedDocs.size}/{parsedData.docs.length})
              </h3>
              <div className="space-y-1.5">
                {parsedData.docs.map((doc: KnowledgeDoc) => (
                  <div key={doc.id} onClick={() => toggleDoc(doc.id)} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer text-sm">
                    {selectedDocs.has(doc.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                    <span className="font-medium truncate">{doc.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decks */}
          {parsedData.decks.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm border-b border-border pb-2 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                FlashDecks ({selectedDecks.size}/{parsedData.decks.length})
              </h3>
              <div className="space-y-1.5">
                {parsedData.decks.map((deck: FlashcardDeck) => (
                  <div key={deck.id} onClick={() => toggleDeck(deck.id)} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer text-sm">
                    {selectedDecks.has(deck.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                    <span className="font-medium truncate">{deck.title} ({deck.cards?.length || 0} cards)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exams */}
          {parsedData.exams.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm border-b border-border pb-2 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Mock Exams ({selectedExams.size}/{parsedData.exams.length})
              </h3>
              <div className="space-y-1.5">
                {parsedData.exams.map((exam: Exam) => (
                  <div key={exam.id} onClick={() => toggleExam(exam.id)} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer text-sm">
                    {selectedExams.has(exam.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                    <span className="font-medium truncate">{exam.title} ({exam.questions?.length || 0} Qs)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3 text-yellow-600 dark:text-yellow-500 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Imported items are safely merged into your workspace with unique IDs. No existing data will be overwritten.</p>
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
