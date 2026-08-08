import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link } from 'react-router-dom';

export function ExamMode() {
  const { exams, addResult } = useAppStore();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  
  // Active exam state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

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
            <div key={exam.id} className="p-6 border border-border rounded-xl flex items-center justify-between bg-muted/5 hover:bg-muted/10 transition-colors">
              <div>
                <h3 className="font-semibold text-lg">{exam.title}</h3>
                <p className="text-sm text-muted-foreground">{exam.questions.length} Questions</p>
              </div>
              <Button onClick={() => setSelectedExamId(exam.id)}>Start Exam</Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleAnswer = (val: string) => {
    const qId = activeExam.questions[currentQIndex].id;
    setAnswers({ ...answers, [qId]: val });
  };

  const handleNext = () => {
    if (currentQIndex + 1 < activeExam.questions.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishExam();
    }
  };

  const finishExam = () => {
    setCompleted(true);
    let correct = 0;
    activeExam.questions.forEach(q => {
      // Basic string matching. In a real app, short answer might need fuzzy matching
      if (answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correct++;
      }
    });

    addResult({
      examId: activeExam.id,
      date: new Date().toISOString(),
      score: correct,
      total: activeExam.questions.length
    });
  };

  if (completed) {
    const total = activeExam.questions.length;
    let correctCount = 0;
    activeExam.questions.forEach(q => {
      if (answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / total) * 100);

    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4 pb-8 border-b border-border">
          <h2 className="text-4xl font-bold">Exam Results</h2>
          <p className="text-lg text-muted-foreground">{activeExam.title}</p>
          <div className="text-6xl font-black text-primary py-4">{percentage}%</div>
          <p className="font-medium text-lg text-muted-foreground">{correctCount} out of {total} correct</p>
          <Button onClick={() => { setSelectedExamId(null); setCompleted(false); setAnswers({}); setCurrentQIndex(0); }} className="mt-4">
            Return to Exam Selection
          </Button>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Review Answers</h3>
          {activeExam.questions.map((q, idx) => {
            const isCorrect = answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            return (
              <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50/10 dark:border-green-900/50' : 'border-red-200 bg-red-50/10 dark:border-red-900/50'}`}>
                <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Your Answer:</span> {answers[q.id] || <i className="text-muted-foreground">Blank</i>}</p>
                  {!isCorrect && (
                    <p><span className="text-muted-foreground">Correct Answer:</span> <span className="text-green-600 font-medium">{q.correctAnswer}</span></p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  }

  const currentQ = activeExam.questions[currentQIndex];

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      <div className="w-full flex justify-between items-center text-sm font-medium text-muted-foreground">
        <span>Question {currentQIndex + 1} of {activeExam.questions.length}</span>
        <span>{activeExam.title}</span>
      </div>
      
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentQIndex / activeExam.questions.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 space-y-8">
        <h2 className="text-2xl font-medium leading-relaxed">{currentQ.question}</h2>

        {/* Options Rendering */}
        {currentQ.type === 'multiple-choice' && currentQ.options && (
          <div className="space-y-3">
            {currentQ.options.map((opt, i) => (
              <label 
                key={i} 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQ.id] === opt 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <input 
                  type="radio" 
                  name={currentQ.id} 
                  checked={answers[currentQ.id] === opt}
                  onChange={() => handleAnswer(opt)}
                  className="w-4 h-4 mr-3" 
                />
                <span className="font-medium text-sm">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {currentQ.type === 'true-false' && (
          <div className="flex gap-4">
            {['True', 'False'].map((opt) => (
              <label 
                key={opt} 
                className={`flex-1 flex items-center justify-center p-6 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQ.id] === opt 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <input 
                  type="radio" 
                  name={currentQ.id} 
                  checked={answers[currentQ.id] === opt}
                  onChange={() => handleAnswer(opt)}
                  className="hidden" 
                />
                <span className="font-semibold text-lg">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {currentQ.type === 'short-answer' && (
          <div className="pt-4">
            <Input 
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg py-6"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-8">
        <Button onClick={handleNext} size="lg" disabled={!answers[currentQ.id]}>
          {currentQIndex + 1 === activeExam.questions.length ? 'Finish Exam' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
}
