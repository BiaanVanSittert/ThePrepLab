import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore, ExamQuestion } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link } from 'react-router-dom';
import { Trash2, Clock, Flag, Shuffle, ArrowLeft, ArrowRight, RotateCw, Check } from 'lucide-react';
import { toast } from 'sonner';

// Robust Answer Evaluation Function
function isAnswerCorrect(userAns: string | undefined, correctAns: string, type: string): boolean {
  if (!userAns) return false;
  if (type === 'short-answer') {
    const normalize = (s: string) => 
      s.toLowerCase()
       .replace(/^[^\w\d]+|[^\w\d]+$/g, '')
       .replace(/\s+/g, ' ')
       .trim();
       
    const userNormalized = normalize(userAns);
    const acceptedAnswers = correctAns
      .split(/\||,/)
      .map(a => normalize(a))
      .filter(Boolean);

    return acceptedAnswers.includes(userNormalized) || userNormalized === normalize(correctAns);
  }
  return userAns.trim().toLowerCase() === correctAns.trim().toLowerCase();
}

export function ExamMode() {
  const { exams, addResult, removeExam } = useAppStore();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  
  // Exam configuration options
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  // Active exam session state
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  
  // Timer State
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter in results breakdown
  const [resultFilter, setResultFilter] = useState<'all' | 'incorrect' | 'flagged'>('all');

  const isWeb = import.meta.env.VITE_APP_MODE === 'web';
  const activeExam = exams.find(e => e.id === selectedExamId);

  const startExamSession = useCallback((exam: typeof exams[0], doShuffleQ: boolean, doShuffleOpts: boolean) => {
    let questionsList = exam.questions.map(q => {
      if (q.type === 'multiple-choice' && q.options && doShuffleOpts) {
        return { ...q, options: [...q.options].sort(() => Math.random() - 0.5) };
      }
      return { ...q };
    });

    if (doShuffleQ) {
      questionsList = questionsList.sort(() => Math.random() - 0.5);
    }

    setExamQuestions(questionsList);
    setCurrentQIndex(0);
    setAnswers({});
    setFlagged({});
    setCompleted(false);

    if (exam.timeLimitMinutes && exam.timeLimitMinutes > 0) {
      setTimeRemainingSeconds(exam.timeLimitMinutes * 60);
    } else {
      setTimeRemainingSeconds(null);
    }
  }, []);

  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    const targetExam = exams.find(e => e.id === examId);
    if (targetExam && targetExam.questions.length > 0) {
      startExamSession(targetExam, shuffleQuestions, shuffleOptions);
    }
  };

  const handleFinishExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let score = 0;
    examQuestions.forEach(q => {
      if (isAnswerCorrect(answers[q.id], q.correctAnswer, q.type)) {
        score++;
      }
    });

    if (selectedExamId) {
      addResult({
        type: 'exam',
        referenceId: selectedExamId,
        examId: selectedExamId,
        date: new Date().toISOString(),
        score,
        total: examQuestions.length
      });
    }
    setCompleted(true);
  }, [examQuestions, answers, selectedExamId, addResult]);

  // Timer Tick Effect
  useEffect(() => {
    if (completed || timeRemainingSeconds === null) return;

    if (timeRemainingSeconds <= 0) {
      toast.warning("Time is up! Submitting your exam...");
      handleFinishExam();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemainingSeconds(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemainingSeconds, completed, handleFinishExam]);

  // If no exams exist
  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-semibold">No exams available</h2>
        <p className="text-muted-foreground">Create a mock exam first to test your knowledge.</p>
        <Link to="/exam-builder">
          <Button>Go to Exam Builder</Button>
        </Link>
      </div>
    );
  }

  // Exam Selection Screen
  if (!selectedExamId) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Select a Mock Exam</h2>
            <p className="text-muted-foreground mt-1">Test your recall and timed exam readiness.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShuffleQuestions(!shuffleQuestions)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                shuffleQuestions 
                  ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' 
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle Qs: {shuffleQuestions ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShuffleOptions(!shuffleOptions)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                shuffleOptions 
                  ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' 
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle Options: {shuffleOptions ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {exams.map(exam => (
            <div 
              key={exam.id} 
              onClick={() => exam.questions.length > 0 && handleSelectExam(exam.id)}
              className={`p-6 border border-border rounded-2xl flex items-center justify-between bg-card hover:border-primary/50 hover:shadow-md transition-all group ${
                exam.questions.length > 0 ? 'cursor-pointer' : 'opacity-60'
              }`}
            >
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{exam.title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{exam.questions.length} Questions</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exam.timeLimitMinutes && exam.timeLimitMinutes > 0 ? `${exam.timeLimitMinutes} mins` : 'Untimed'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isWeb && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-500/10"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      removeExam(exam.id); 
                      toast("Exam deleted", {
                        action: {
                          label: "Undo",
                          onClick: () => useAppStore.getState().restoreExam(exam)
                        }
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button disabled={exam.questions.length === 0} className="gap-2">
                  Start Exam <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (examQuestions.length === 0) return null;

  // Results Screen
  if (completed) {
    let score = 0;
    examQuestions.forEach(q => {
      if (isAnswerCorrect(answers[q.id], q.correctAnswer, q.type)) score++;
    });
    const percentage = Math.round((score / examQuestions.length) * 100);

    const filteredQuestions = examQuestions.filter(q => {
      const isCorrect = isAnswerCorrect(answers[q.id], q.correctAnswer, q.type);
      if (resultFilter === 'incorrect') return !isCorrect;
      if (resultFilter === 'flagged') return !!flagged[q.id];
      return true;
    });

    const renderBreakdown = () => (
      <div className="w-full text-left space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setResultFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                resultFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              All ({examQuestions.length})
            </button>
            <button
              onClick={() => setResultFilter('incorrect')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                resultFilter === 'incorrect' ? 'bg-red-500 text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Incorrect ({examQuestions.length - score})
            </button>
            <button
              onClick={() => setResultFilter('flagged')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                resultFilter === 'flagged' ? 'bg-yellow-500 text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Flagged ({Object.values(flagged).filter(Boolean).length})
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">
              No questions match the selected filter.
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const originalIndex = examQuestions.findIndex(x => x.id === q.id);
              const isCorrect = isAnswerCorrect(answers[q.id], q.correctAnswer, q.type);
              const isFlagged = !!flagged[q.id];

              return (
                <div 
                  key={q.id} 
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect 
                      ? 'border-green-200 bg-green-50/40 dark:border-green-900/30 dark:bg-green-900/10' 
                      : 'border-red-200 bg-red-50/40 dark:border-red-900/30 dark:bg-red-900/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium text-base mb-2">
                      <span className="text-muted-foreground mr-2 font-bold">{originalIndex + 1}.</span>
                      {q.question}
                    </p>
                    {isFlagged && (
                      <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-md font-medium shrink-0">
                        <Flag className="w-3 h-3" /> Flagged
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t border-border/40">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Your Answer</span>
                      <p className={`font-medium mt-0.5 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500 line-through'}`}>
                        {answers[q.id] || '(Skipped)'}
                      </p>
                    </div>
                    {!isCorrect && (
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Correct Answer</span>
                        <p className="text-green-600 dark:text-green-400 font-semibold mt-0.5">
                          {q.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                      <span className="font-semibold text-primary shrink-0">💡 Explanation:</span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );

    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center animate-in fade-in zoom-in duration-500 max-w-3xl mx-auto">
        <div className={`w-28 h-28 rounded-full border-8 flex items-center justify-center text-3xl font-bold shadow-xl ${
          percentage >= 80 ? 'border-green-500 text-green-500 bg-green-50 dark:bg-green-950/20' : 
          percentage >= 60 ? 'border-yellow-500 text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : 
          'border-red-500 text-red-500 bg-red-50 dark:bg-red-950/20'
        }`}>
          {percentage}%
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Exam Results</h2>
          <p className="text-lg text-muted-foreground">
            You scored {score} out of {examQuestions.length} questions correctly.
          </p>
        </div>
        
        <div className="w-full">
          {renderBreakdown()}
        </div>

        <div className="flex gap-4 pt-4">
          {activeExam && (
            <Button onClick={() => startExamSession(activeExam, shuffleQuestions, shuffleOptions)} variant="outline" className="gap-2">
              <RotateCw className="w-4 h-4" /> Retake Exam
            </Button>
          )}
          <Button onClick={() => setSelectedExamId(null)}>
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = examQuestions[currentQIndex];
  const isCurrentFlagged = !!flagged[currentQ.id];

  // Format timer seconds into mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 min-h-[calc(100vh-8rem)] flex flex-col">
      
      {/* Top Bar: Nav, Title, and Timer */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedExamId(null)} className="h-8 px-2 text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Exit
          </Button>
          <span className="font-semibold text-sm truncate max-w-[200px] sm:max-w-md">{activeExam?.title}</span>
        </div>

        {timeRemainingSeconds !== null && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
            timeRemainingSeconds < 60 
              ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' 
              : 'border-border bg-card text-foreground'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            {formatTimer(timeRemainingSeconds)}
          </div>
        )}
      </div>

      {/* Progress Bar & Question Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Question {currentQIndex + 1} of {examQuestions.length}</span>
          <span>{Math.round(((currentQIndex + 1) / examQuestions.length) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${((currentQIndex + 1) / examQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Navigation Quick-Jump Grid */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 max-w-full">
        {examQuestions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = idx === currentQIndex;
          const isFlag = !!flagged[q.id];

          return (
            <button
              key={q.id}
              onClick={() => setCurrentQIndex(idx)}
              className={`w-7 h-7 rounded-lg text-xs font-medium flex items-center justify-center relative shrink-0 transition-all ${
                isCurrent 
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1' 
                  : isAnswered 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-muted/40 text-muted-foreground border border-border hover:bg-muted'
              }`}
            >
              {idx + 1}
              {isFlag && (
                <span className="w-2 h-2 rounded-full bg-yellow-500 absolute -top-0.5 -right-0.5 ring-1 ring-background" />
              )}
            </button>
          );
        })}
      </div>

      {/* Question Main Card */}
      <div className="flex-1 space-y-6 bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl sm:text-2xl font-medium leading-relaxed">{currentQ.question}</h3>
            <button
              onClick={() => setFlagged({ ...flagged, [currentQ.id]: !isCurrentFlagged })}
              className={`p-2 rounded-xl border transition-all shrink-0 ${
                isCurrentFlagged 
                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' 
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Flag question for review"
            >
              <Flag className={`w-4 h-4 ${isCurrentFlagged ? 'fill-yellow-500' : ''}`} />
            </button>
          </div>

          {/* Multiple Choice Options */}
          {currentQ.type === 'multiple-choice' && (
            <div className="grid gap-3">
              {currentQ.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                  className={`text-left p-4 rounded-xl border transition-all text-base ${
                    answers[currentQ.id] === opt 
                      ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background font-medium' 
                      : 'border-border bg-muted/10 hover:bg-muted/30 hover:border-primary/40'
                  }`}
                >
                  <span className="font-bold text-muted-foreground mr-3 font-mono">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* True / False Options */}
          {currentQ.type === 'true-false' && (
            <div className="grid grid-cols-2 gap-4">
              {['True', 'False'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                  className={`p-6 rounded-xl border text-lg font-semibold transition-all ${
                    answers[currentQ.id] === opt 
                      ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background' 
                      : 'border-border bg-muted/10 hover:bg-muted/30'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Short Answer Input */}
          {currentQ.type === 'short-answer' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type your answer</label>
              <Input 
                value={answers[currentQ.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                placeholder="Enter exact answer..."
                className="text-lg p-5"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Question Footer Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-border mt-auto">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
            disabled={currentQIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous
          </Button>

          {currentQIndex + 1 === examQuestions.length ? (
            <Button size="lg" onClick={handleFinishExam} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <Check className="w-4 h-4" /> Finish & Submit Exam
            </Button>
          ) : (
            <Button size="lg" onClick={() => setCurrentQIndex(currentQIndex + 1)} className="gap-2">
              Next Question <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
