import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link } from 'react-router-dom';
import { Trash2, CheckCircle2 } from 'lucide-react';

export function ExamMode() {
  const { exams, addResult, removeExam } = useAppStore();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  
  // Active exam state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const isWeb = import.meta.env.VITE_APP_MODE === 'web';
  const activeExam = exams.find(e => e.id === selectedExamId);

  // If no exams exist
  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-semibold">No exams available</h2>
        <p className="text-muted-foreground">Create an exam first to test your knowledge.</p>
        <Link to="/exam-builder">
          <Button>Go to Exam Builder</Button>
        </Link>
      </div>
    );
  }

  // Exam Selection Screen
  if (!activeExam) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Select an Exam</h2>
        <div className="grid gap-4">
          {exams.map(exam => (
            <div key={exam.id} className="p-6 border border-border rounded-xl flex items-center justify-between bg-muted/5 hover:bg-muted/10 transition-colors group">
              <div>
                <h3 className="font-semibold text-lg">{exam.title}</h3>
                <p className="text-sm text-muted-foreground">{exam.questions.length} Questions</p>
              </div>
              <div className="flex items-center gap-2">
                {!isWeb && (
                  <>
                    <Link to="/exam-builder" state={{ editExamId: exam.id }}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); removeExam(exam.id); }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </>
                )}
                <Button onClick={() => setSelectedExamId(exam.id)}>Start Exam</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentQIndex + 1 < activeExam.questions.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      let score = 0;
      activeExam.questions.forEach(q => {
        if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
          score++;
        }
      });
      addResult({
        examId: activeExam.id,
        date: new Date().toISOString(),
        score,
        total: activeExam.questions.length
      });
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setAnswers({});
    setCompleted(false);
  };

  if (completed) {
    let score = 0;
    activeExam.questions.forEach(q => {
      if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) score++;
    });

    if (isWeb) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-bold">Exam Completed!</h2>
            <p className="text-lg text-muted-foreground">You scored {score} / {activeExam.questions.length} ({Math.round(score/activeExam.questions.length * 100)}%) on this demo exam.</p>
          </div>
          
          <div className="p-8 border border-primary/30 bg-primary/5 rounded-2xl space-y-6 w-full">
            <h3 className="text-2xl font-bold text-primary">Ready to create your own?</h3>
            <p className="text-muted-foreground">
              Download the free desktop application to build unlimited custom FlashDecks and Exams directly from your own study materials!
            </p>
            <a href="https://github.com/BiaanVanSittert/ThePrepLab/releases/latest" target="_blank" rel="noopener noreferrer" className="block">
              <Button size="lg" className="w-full text-lg h-14">
                Download for Windows
              </Button>
            </a>
          </div>

          <Button onClick={() => setSelectedExamId(null)} variant="ghost" className="text-muted-foreground">
            Try a different demo exam
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight">Exam Results</h2>
        <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center text-4xl font-bold shadow-lg">
          {Math.round(score / activeExam.questions.length * 100)}%
        </div>
        <p className="text-lg text-muted-foreground">
          You scored {score} out of {activeExam.questions.length} questions.
        </p>
        
        <div className="w-full text-left space-y-4 max-h-[40vh] overflow-auto pr-4">
          {activeExam.questions.map((q, idx) => {
            const isCorrect = answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
            return (
              <div key={q.id} className={`p-4 rounded-xl border ${isCorrect ? 'border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10' : 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10'}`}>
                <p className="font-medium text-sm mb-2"><span className="opacity-50 mr-2">{idx + 1}.</span> {q.question}</p>
                <div className="flex gap-4 text-sm mt-2">
                  <p className={`${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500 line-through opacity-80'}`}>Your answer: {answers[q.id] || '(Skipped)'}</p>
                  {!isCorrect && <p className="text-green-600 dark:text-green-400 font-semibold">Correct: {q.correctAnswer}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4">
          <Button onClick={handleRestart} variant="outline">Take Again</Button>
          <Button onClick={() => setSelectedExamId(null)}>Back to Exams</Button>
        </div>
      </div>
    );
  }

  const currentQ = activeExam.questions[currentQIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
        <span>Question {currentQIndex + 1} of {activeExam.questions.length}</span>
        <span>{Math.round((currentQIndex / activeExam.questions.length) * 100)}%</span>
      </div>
      
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentQIndex / activeExam.questions.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 space-y-8 bg-card border border-border p-8 rounded-2xl shadow-sm">
        <h3 className="text-2xl font-medium leading-relaxed">{currentQ.question}</h3>

        {currentQ.type === 'multiple-choice' && (
          <div className="grid gap-3">
            {currentQ.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                className={`text-left p-4 rounded-xl border transition-all ${
                  answers[currentQ.id] === opt 
                    ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background' 
                    : 'border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentQ.type === 'true-false' && (
          <div className="grid grid-cols-2 gap-4">
            {['True', 'False'].map(opt => (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                className={`p-6 rounded-xl border text-lg font-medium transition-all ${
                  answers[currentQ.id] === opt 
                    ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background' 
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentQ.type === 'short-answer' && (
          <div className="space-y-4">
            <Input 
              value={answers[currentQ.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              placeholder="Type your exact answer here..."
              className="text-lg p-6"
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
          disabled={currentQIndex === 0}
        >
          Previous
        </Button>
        <Button size="lg" onClick={handleNext} disabled={!answers[currentQ.id] && currentQ.type !== 'short-answer'}>
          {currentQIndex + 1 === activeExam.questions.length ? 'Finish Exam' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
}
