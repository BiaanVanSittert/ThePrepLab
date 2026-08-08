import { useState } from 'react';
import { useAppStore, ExamQuestion } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Plus, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ExamBuilder() {
  const { knowledgeBase, addExam } = useAppStore();
  const navigate = useNavigate();
  
  const [examTitle, setExamTitle] = useState('');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  // Current Question State
  const [qType, setQType] = useState<'multiple-choice' | 'true-false' | 'short-answer'>('multiple-choice');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState('');

  const handleAddQuestion = () => {
    if (!qText.trim()) return;

    let finalOptions = qOptions;
    let finalCorrect = qCorrect;

    if (qType === 'multiple-choice') {
      if (!qCorrect || !qOptions.includes(qCorrect)) return; // Must select correct option
    } else if (qType === 'true-false') {
      finalOptions = ['True', 'False'];
      if (qCorrect !== 'True' && qCorrect !== 'False') return;
    } else if (qType === 'short-answer') {
      finalOptions = [];
      if (!qCorrect.trim()) return;
    }

    const newQuestion: ExamQuestion = {
      id: crypto.randomUUID(),
      type: qType,
      question: qText,
      options: qType !== 'short-answer' ? finalOptions : undefined,
      correctAnswer: finalCorrect
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset inputs
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect('');
  };

  const handleSaveExam = () => {
    if (examTitle.trim() && questions.length > 0) {
      addExam({ title: examTitle, questions });
      navigate('/'); // Go back to dashboard
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-8rem)]">
      {/* Left Pane: Knowledge Base Reference */}
      <div className="flex-1 flex flex-col space-y-4">
        <h2 className="text-xl font-semibold">Reference Material</h2>
        <div className="flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-4">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
            {knowledgeBase || "Your knowledge base is empty."}
          </p>
        </div>
      </div>

      {/* Right Pane: Exam Builder */}
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Build Mock Exam</h2>
          <Button onClick={handleSaveExam} disabled={questions.length === 0 || !examTitle} className="gap-2">
            <Save className="w-4 h-4" /> Save Exam
          </Button>
        </div>

        <Input 
          value={examTitle}
          onChange={(e) => setExamTitle(e.target.value)}
          placeholder="Exam Title (e.g., Biology Midterm)" 
          className="font-semibold text-lg"
        />
        
        {/* Question Input Form */}
        <div className="space-y-4 bg-muted/10 border border-border p-4 rounded-xl flex-shrink-0">
          <div className="flex gap-4">
            <select 
              value={qType} 
              onChange={(e) => setQType(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True / False</option>
              <option value="short-answer">Short Answer</option>
            </select>
          </div>

          <TextArea 
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Type your question..." 
            className="min-h-[80px]"
          />

          {qType === 'multiple-choice' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Options (select correct answer via radio button)</label>
              {qOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="correct_option"
                    checked={qCorrect === opt && opt !== ''}
                    onChange={() => setQCorrect(opt)}
                    className="w-4 h-4"
                  />
                  <Input 
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...qOptions];
                      newOpts[idx] = e.target.value;
                      setQOptions(newOpts);
                      if (qCorrect === opt) setQCorrect(e.target.value); // Keep correct answer synced
                    }}
                    placeholder={`Option ${idx + 1}`} 
                  />
                </div>
              ))}
            </div>
          )}

          {qType === 'true-false' && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="tf_correct" checked={qCorrect === 'True'} onChange={() => setQCorrect('True')} /> True
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="tf_correct" checked={qCorrect === 'False'} onChange={() => setQCorrect('False')} /> False
              </label>
            </div>
          )}

          {qType === 'short-answer' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Exact Correct Answer</label>
              <Input 
                value={qCorrect}
                onChange={(e) => setQCorrect(e.target.value)}
                placeholder="e.g., Mitochondria" 
              />
            </div>
          )}

          <Button onClick={handleAddQuestion} className="w-full gap-2 mt-2" variant="secondary">
            <Plus className="w-4 h-4" /> Add Question to Exam
          </Button>
        </div>

        {/* Existing Questions List */}
        <div className="flex-1 overflow-auto space-y-4 pr-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Exam Questions ({questions.length})</h3>
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-background border border-border rounded-lg relative group">
                <p className="font-medium text-sm mb-2"><span className="text-primary mr-2">{idx + 1}.</span>{q.question}</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold">Ans: {q.correctAnswer}</p>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  onClick={() => setQuestions(questions.filter(x => x.id !== q.id))}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
