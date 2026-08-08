import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';
import { Save } from 'lucide-react';

export function KnowledgeBase() {
  const { knowledgeBase, setKnowledgeBase } = useAppStore();
  const [localText, setLocalText] = React.useState(knowledgeBase);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    setKnowledgeBase(localText);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Paste your study notes, textbook excerpts, or lectures here. 
          This text will be the foundation for generating your flashcards and mock exams.
        </p>
      </div>

      <div className="flex flex-col space-y-4">
        <TextArea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          placeholder="Enter your source material here..."
          className="min-h-[50vh] font-mono text-sm resize-y"
        />
        
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
