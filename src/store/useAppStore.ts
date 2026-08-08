import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// Custom storage engine for Zustand to use IndexedDB
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export interface FlashcardData {
  id: string;
  front: string;
  back: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
}

export interface ExamResult {
  id: string;
  examId: string;
  date: string;
  score: number;
  total: number;
}

interface AppState {
  knowledgeBase: string;
  flashcards: FlashcardData[];
  exams: { id: string; title: string; questions: ExamQuestion[] }[];
  results: ExamResult[];
  
  // Actions
  setKnowledgeBase: (text: string) => void;
  addFlashcard: (card: Omit<FlashcardData, 'id'>) => void;
  removeFlashcard: (id: string) => void;
  addExam: (exam: Omit<AppState['exams'][0], 'id'>) => void;
  removeExam: (id: string) => void;
  addResult: (result: Omit<ExamResult, 'id'>) => void;
}

const isWeb = import.meta.env.VITE_APP_MODE === 'web';

const demoFlashcards: FlashcardData[] = [
  { id: '1', front: 'What is the powerhouse of the cell?', back: 'The mitochondria.' },
  { id: '2', front: 'What is the speed of light?', back: '299,792,458 m/s' },
  { id: '3', front: 'What does DNA stand for?', back: 'Deoxyribonucleic acid' },
  { id: '4', front: 'Who formulated the theory of relativity?', back: 'Albert Einstein' },
  { id: '5', front: 'What is the hardest natural substance on Earth?', back: 'Diamond' },
];

const demoExams = [
  {
    id: 'demo-exam-1',
    title: 'General Science Quiz',
    questions: [
      { id: 'q1', type: 'multiple-choice' as const, question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars' },
      { id: 'q2', type: 'true-false' as const, question: 'Water boils at 100 degrees Celsius at sea level.', options: ['True', 'False'], correctAnswer: 'True' },
      { id: 'q3', type: 'multiple-choice' as const, question: 'What is the chemical symbol for Gold?', options: ['Au', 'Ag', 'Fe', 'Cu'], correctAnswer: 'Au' },
    ]
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      knowledgeBase: isWeb ? "Welcome to ThePrepLab Web Teaser! You can use this space to paste notes." : '',
      flashcards: isWeb ? demoFlashcards : [],
      exams: isWeb ? demoExams : [],
      results: [],

      setKnowledgeBase: (text) => set({ knowledgeBase: text }),
      
      addFlashcard: (card) => set((state) => ({
        flashcards: [...state.flashcards, { ...card, id: crypto.randomUUID() }]
      })),

      removeFlashcard: (id) => set((state) => ({
        flashcards: state.flashcards.filter(c => c.id !== id)
      })),

      addExam: (exam) => set((state) => ({
        exams: [...state.exams, { ...exam, id: crypto.randomUUID() }]
      })),

      removeExam: (id) => set((state) => ({
        exams: state.exams.filter(e => e.id !== id)
      })),

      addResult: (result) => set((state) => ({
        results: [...state.results, { ...result, id: crypto.randomUUID() }]
      })),
    }),
    {
      name: 'thepreplab-storage', // unique name
      // Use sessionStorage for the Web Teaser so we don't pollute indexedDB, 
      // but use robust idbStorage for the Desktop app.
      storage: createJSONStorage(() => isWeb ? sessionStorage : idbStorage),
    }
  )
);
