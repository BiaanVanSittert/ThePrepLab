import { useState, useRef, useEffect } from 'react';
import { useAppStore, ExamQuestion } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Plus, Trash2, Save, Check, Edit2, Search, BookOpen, Clock, PenTool, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export function ExamBuilder() {
  const { 
    docs, 
    activeDocId, 
    setActiveDocId, 
    addExam, 
    updateExam, 
    removeExam, 
    restoreExam, 
    exams, 
    enableShortcuts 
  } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const editExamId = location.state?.editExamId;
  const isWeb = import.meta.env.VITE_APP_MODE === 'web';
  
  const [selectedExamId, setSelectedExamId] = useState<string>(editExamId || 'new');
  const [examTitle, setExamTitle] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>(5);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);

  // Search in reference notes
  const [refSearchQuery, setRefSearchQuery] = useState('');

  // Editing state for an individual question
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Initialize for edit
  useEffect(() => {
    if (selectedExamId && selectedExamId !== 'new') {
      const examToEdit = exams.find(e => e.id === selectedExamId);
      if (examToEdit) {
        setExamTitle(examToEdit.title);
        setQuestions(examToEdit.questions);
        setTimeLimitMinutes(examToEdit.timeLimitMinutes ?? 5);
      }
    } else {
      setExamTitle('');
      setQuestions([]);
      setTimeLimitMinutes(5);
    }
    setEditingQuestionId(null);
    resetQuestionForm();
  }, [selectedExamId, exams]);

  // Current Question State
  const [qType, setQType] = useState<'multiple-choice' | 'true-false' | 'short-answer'>('multiple-choice');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState('');
  const [qExplanation, setQExplanation] = useState('');

  const resetQuestionForm = () => {
    setQType('multiple-choice');
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect('');
    setQExplanation('');
    setEditingQuestionId(null);
  };

  // Smart Highlighter State
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const textRef = useRef<HTMLDivElement>(null);
  const hasSeenShortcutHint = useRef(false);

  const activeDoc = docs.find(d => d.id === activeDocId) || docs[0];
  const activeExam = exams.find(e => e.id === selectedExamId);

  // Keyboard Shortcuts (Ctrl+F for Question, Ctrl+B for Answer) - safe check
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (enableShortcuts && !isWeb && e.ctrlKey) {
        const selection = window.getSelection()?.toString().trim();
        if (selection && selection.length > 0) {
          if (e.key.toLowerCase() === 'f') {
            e.preventDefault();
            setQText(selection);
            toast.success("Piped to Question", { duration: 1500 });
          }
          if (e.key.toLowerCase() === 'b') {
            e.preventDefault();
            setQCorrect(selection);
            toast.success("Piped to Answer", { duration: 1500 });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcuts, isWeb]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !textRef.current?.contains(selection.anchorNode)) {
        setPopoverStyle(null);
        return;
      }

      const text = selection.toString().trim();
      if (text) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setPopoverStyle({
          top: Math.max(10, rect.top - 50),
          left: Math.max(100, Math.min(window.innerWidth - 150, rect.left + rect.width / 2)),
          position: 'fixed',
        });
        setSelectedText(text);

        if (!hasSeenShortcutHint.current && enableShortcuts && !isWeb) {
          hasSeenShortcutHint.current = true;
          toast("Shortcut Tip", { 
            description: "Highlight text and use Ctrl+F (Question) or Ctrl+B (Answer)!" 
          });
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [enableShortcuts, isWeb]);

  const handleSaveQuestion = () => {
    if (!qText.trim()) {
      toast.error("Please enter a question.");
      return;
    }

    let finalOptions = qOptions.map(o => o.trim()).filter(Boolean);
    let finalCorrect = qCorrect.trim();

    if (qType === 'multiple-choice') {
      if (finalOptions.length < 2) {
        toast.error("Please provide at least 2 options for multiple choice.");
        return;
      }
      if (!finalCorrect || !finalOptions.includes(finalCorrect)) {
        toast.error("Please select a valid correct answer from the options.");
        return;
      }
    } else if (qType === 'true-false') {
      finalOptions = ['True', 'False'];
      if (finalCorrect !== 'True' && finalCorrect !== 'False') {
        toast.error("Please select True or False.");
        return;
      }
    } else if (qType === 'short-answer') {
      finalOptions = [];
      if (!finalCorrect) {
        toast.error("Please enter the expected correct answer.");
        return;
      }
    }

    const questionData: ExamQuestion = {
      id: editingQuestionId || crypto.randomUUID(),
      type: qType,
      question: qText.trim(),
      options: qType !== 'short-answer' ? finalOptions : undefined,
      correctAnswer: finalCorrect,
      explanation: qExplanation.trim() || undefined,
    };

    if (editingQuestionId) {
      setQuestions(questions.map(q => q.id === editingQuestionId ? questionData : q));
      toast.success("Question updated!");
    } else {
      setQuestions([...questions, questionData]);
      toast.success("Question added!");
    }
    
    resetQuestionForm();
  };

  const handleStartEditQuestion = (q: ExamQuestion) => {
    setEditingQuestionId(q.id);
    setQType(q.type);
    setQText(q.question);
    if (q.type === 'multiple-choice') {
      setQOptions(q.options && q.options.length >= 4 ? q.options : [...(q.options || []), '', '', '', ''].slice(0, 4));
    }
    setQCorrect(q.correctAnswer);
    setQExplanation(q.explanation || '');
  };

  const handleDeleteQuestion = (qId: string) => {
    const qToDelete = questions.find(q => q.id === qId);
    if (!qToDelete) return;
    setQuestions(questions.filter(x => x.id !== qId));
    if (editingQuestionId === qId) resetQuestionForm();
    toast("Question deleted", {
      action: {
        label: "Undo",
        onClick: () => setQuestions(prev => [...prev, qToDelete])
      }
    });
  };

  const handleDeleteExam = () => {
    if (!activeExam) return;
    const examToDelete = activeExam;
    removeExam(examToDelete.id);
    setSelectedExamId('new');
    toast("Exam deleted", {
      action: {
        label: "Undo",
        onClick: () => restoreExam(examToDelete)
      }
    });
  };

  const handleSaveExam = () => {
    if (!examTitle.trim()) {
      toast.error("Please enter an exam title.");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question to the exam.");
      return;
    }

    const examPayload = {
      title: examTitle.trim(),
      questions,
      timeLimitMinutes: typeof timeLimitMinutes === 'number' && timeLimitMinutes > 0 ? timeLimitMinutes : undefined,
    };

    if (selectedExamId !== 'new') {
      updateExam(selectedExamId, examPayload);
      toast.success("Exam updated successfully!");
    } else {
      addExam(examPayload);
      toast.success("Exam created successfully!");
    }
    navigate('/exam');
  };

  const rawReferenceText = activeDoc?.content || '';

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-8rem)] pb-12">
      
      {/* Smart Highlighter Popover */}
      {popoverStyle && (
        <div 
          style={{ ...popoverStyle, transform: 'translateX(-50%)' }}
          className="z-50 flex gap-2 bg-background/95 backdrop-blur border border-border shadow-2xl rounded-xl p-2 animate-in fade-in zoom-in duration-200"
        >
          <Button size="sm" onClick={() => { setQText(selectedText); setPopoverStyle(null); }}>
            Set as Question
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setQCorrect(selectedText); setPopoverStyle(null); }}>
            Set as Answer
          </Button>
        </div>
      )}

      {/* Left Pane: Knowledge Base Reference */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Reference Notes</h2>
          </div>
          {docs.length > 1 && (
            <select
              value={activeDoc?.id}
              onChange={(e) => setActiveDocId(e.target.value)}
              className="text-xs bg-muted/40 border border-border rounded-lg px-2 py-1 max-w-[200px] truncate"
            >
              {docs.map(doc => (
                <option key={doc.id} value={doc.id} className="dark:bg-[#0a0a0a]">
                  {doc.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search inside notes */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within notes..."
            value={refSearchQuery}
            onChange={(e) => setRefSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-8 py-2 rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {refSearchQuery && (
            <button 
              onClick={() => setRefSearchQuery('')} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">Highlight text to quickly pipe it into question or answer inputs!</p>
        
        <div ref={textRef} className="flex-1 overflow-auto rounded-xl border border-border bg-muted/10 p-6 shadow-inner max-h-[60vh] lg:max-h-[70vh]">
          {rawReferenceText ? (
            <p className="whitespace-pre-wrap text-sm text-foreground/90 font-mono leading-relaxed selection:bg-primary/30">
              {rawReferenceText}
            </p>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Your Knowledge Base is empty. Go to the <span className="font-semibold text-primary">Knowledge Base</span> tab to add your study notes!
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Exam Builder */}
      <div className="flex-1 flex flex-col space-y-6">
        
        {/* Header & Save Action */}
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{selectedExamId !== 'new' ? 'Edit Mock Exam' : 'Build Mock Exam'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {selectedExamId !== 'new' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 text-xs"
                onClick={handleDeleteExam}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Exam
              </Button>
            )}
            <Button onClick={handleSaveExam} disabled={questions.length === 0 || !examTitle.trim()} className="gap-2">
              <Save className="w-4 h-4" /> {selectedExamId !== 'new' ? 'Update Exam' : 'Save Exam'}
            </Button>
          </div>
        </div>

        {/* Exam Select & Title / Timer Configuration */}
        <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-border">
          <div className="flex gap-4">
            <select 
              value={selectedExamId} 
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="new" className="dark:bg-[#0a0a0a]">➕ Create New Mock Exam</option>
              {exams.map(e => (
                <option key={e.id} value={e.id} className="dark:bg-[#0a0a0a]">{e.title} ({e.questions.length} questions)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exam Title</label>
              <Input 
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g., Biology Midterm Practice" 
                className="font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Timer (Minutes)
              </label>
              <Input 
                type="number"
                min="0"
                max="300"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0 = Unlimited"
              />
            </div>
          </div>
        </div>
        
        {/* Question Input Form */}
        <div className="space-y-4 bg-muted/10 border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">
              {editingQuestionId ? (
                <span className="text-primary flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Editing Question
                </span>
              ) : (
                "Add Question"
              )}
            </h3>
            {editingQuestionId && (
              <Button variant="ghost" size="sm" onClick={resetQuestionForm} className="text-xs h-7">
                Cancel Edit
              </Button>
            )}
          </div>

          <div className="flex gap-4">
            <select 
              value={qType} 
              onChange={(e) => {
                setQType(e.target.value as any);
                setQCorrect('');
              }}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="multiple-choice" className="dark:bg-[#0a0a0a]">Multiple Choice</option>
              <option value="true-false" className="dark:bg-[#0a0a0a]">True / False</option>
              <option value="short-answer" className="dark:bg-[#0a0a0a]">Exact / Short Answer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question Text</label>
            <TextArea 
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Type or paste your question here..." 
              className="min-h-[80px]"
            />
          </div>

          {qType === 'multiple-choice' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Options (Click the radio circle next to the correct answer)
              </label>
              {qOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="correct_option"
                    checked={qCorrect === opt && opt.trim() !== ''}
                    onChange={() => setQCorrect(opt)}
                    className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Input 
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...qOptions];
                      newOpts[idx] = e.target.value;
                      setQOptions(newOpts);
                      if (qCorrect === opt) setQCorrect(e.target.value); 
                    }}
                    placeholder={`Option ${idx + 1}`} 
                  />
                </div>
              ))}
            </div>
          )}

          {qType === 'true-false' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Correct Answer</label>
              <div className="flex gap-4">
                {['True', 'False'].map(val => (
                  <label key={val} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer flex-1 justify-center transition-all ${
                    qCorrect === val ? 'border-primary bg-primary/10 ring-1 ring-primary font-semibold' : 'border-border bg-background hover:bg-muted/20'
                  }`}>
                    <input 
                      type="radio" 
                      name="tf_correct" 
                      checked={qCorrect === val} 
                      onChange={() => setQCorrect(val)} 
                    /> 
                    {val}
                  </label>
                ))}
              </div>
            </div>
          )}

          {qType === 'short-answer' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Correct Answer (You can provide alternative answers separated by | or comma)
              </label>
              <Input 
                value={qCorrect}
                onChange={(e) => setQCorrect(e.target.value)}
                placeholder="e.g., Augustus Caesar | Augustus | Octavian" 
              />
            </div>
          )}

          {/* Explanation / Rationale Input */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Explanation / Solution Rationale (Optional - shown in results)
            </label>
            <Input 
              value={qExplanation}
              onChange={(e) => setQExplanation(e.target.value)}
              placeholder="e.g., Augustus Caesar was the adopted son of Julius Caesar and reigned from 27 BC to 14 AD."
              className="text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSaveQuestion} className="w-full gap-2" variant="primary">
              {editingQuestionId ? (
                <>
                  <Check className="w-4 h-4" /> Save Question Changes
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add Question to Exam
                </>
              )}
            </Button>
            {editingQuestionId && (
              <Button variant="secondary" onClick={resetQuestionForm}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Existing Questions List */}
        <div className="flex-1 space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Questions in Exam ({questions.length})
          </h3>
          
          {questions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm">
              No questions in this exam yet. Use the form above to add your first question!
            </div>
          ) : (
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
              {questions.map((q, idx) => {
                const isCurrentlyEditing = editingQuestionId === q.id;
                return (
                  <div 
                    key={q.id} 
                    className={`p-4 bg-background border rounded-xl relative group transition-all ${
                      isCurrentlyEditing ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-border'
                    }`}
                  >
                    <div className="pr-16">
                      <p className="font-medium text-sm mb-1">
                        <span className="text-primary font-bold mr-2">{idx + 1}.</span>
                        {q.question}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                        Correct Answer: <span className="font-normal text-foreground">{q.correctAnswer}</span>
                      </p>
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                    
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/90 backdrop-blur rounded-lg p-1 border border-border shadow-sm">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1.5 h-auto text-xs gap-1"
                        onClick={() => handleStartEditQuestion(q)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1.5 h-auto text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
