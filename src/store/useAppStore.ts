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

const defaultKnowledgeBase = `THE PREP LAB - DEMO KNOWLEDGE BASE

Welcome to ThePrepLab! You can paste your own study materials here. Below is some demo content you can use to test the Flashcard and Exam builders.

--- SCIENCE: THE SOLAR SYSTEM ---
The Solar System is the gravitationally bound system of the Sun and the objects that orbit it. The largest planet in our solar system is Jupiter, a gas giant known for its Great Red Spot. The speed of light in a vacuum is exactly 299,792,458 meters per second. Water boils at 100 degrees Celsius at sea level.

--- HISTORY: ANCIENT ROME ---
The Roman Empire was founded in 27 BC when Augustus Caesar proclaimed himself the first emperor. At its peak, it spanned across Europe, North Africa, and Western Asia. The Colosseum, built in 80 AD, is one of the most famous examples of Roman engineering and was used for gladiatorial contests.

--- TECHNOLOGY: COMPUTER SCIENCE ---
A CPU (Central Processing Unit) is considered the brain of the computer. Random Access Memory (RAM) provides temporary storage for data that is actively being used. The World Wide Web was invented by Tim Berners-Lee in 1989 while working at CERN.`;

const demoFlashcards: FlashcardData[] = [
  // Science
  { id: 'sci-1', front: 'What is the largest planet in our solar system?', back: 'Jupiter' },
  { id: 'sci-2', front: 'What is the speed of light in a vacuum?', back: '299,792,458 m/s' },
  { id: 'sci-3', front: 'At what temperature does water boil at sea level?', back: '100 degrees Celsius' },
  // History
  { id: 'his-1', front: 'Who was the first Roman Emperor?', back: 'Augustus Caesar' },
  { id: 'his-2', front: 'In what year was the Roman Empire founded?', back: '27 BC' },
  { id: 'his-3', front: 'When was the Colosseum built?', back: '80 AD' },
  // Tech
  { id: 'tech-1', front: 'What does CPU stand for?', back: 'Central Processing Unit' },
  { id: 'tech-2', front: 'Who invented the World Wide Web?', back: 'Tim Berners-Lee' },
  { id: 'tech-3', front: 'In what year was the WWW invented?', back: '1989' },
];

const demoExams = [
  {
    id: 'exam-sci',
    title: 'Science: Solar System & Physics',
    questions: [
      { id: 'q1', type: 'multiple-choice' as const, question: 'Which planet is known as a gas giant with a Great Red Spot?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Jupiter' },
      { id: 'q2', type: 'true-false' as const, question: 'Water boils at 100 degrees Celsius at sea level.', options: ['True', 'False'], correctAnswer: 'True' },
      { id: 'q3', type: 'short-answer' as const, question: 'What is the speed of light in meters per second?', options: [], correctAnswer: '299,792,458' },
    ]
  },
  {
    id: 'exam-his',
    title: 'History: Ancient Rome',
    questions: [
      { id: 'q4', type: 'multiple-choice' as const, question: 'Who proclaimed himself the first Roman emperor?', options: ['Julius Caesar', 'Augustus Caesar', 'Nero', 'Trajan'], correctAnswer: 'Augustus Caesar' },
      { id: 'q5', type: 'true-false' as const, question: 'The Roman Empire was founded in 80 AD.', options: ['True', 'False'], correctAnswer: 'False' },
      { id: 'q6', type: 'short-answer' as const, question: 'What famous Roman structure was used for gladiatorial contests?', options: [], correctAnswer: 'Colosseum' },
    ]
  },
  {
    id: 'exam-tech',
    title: 'Tech: Computer Science Basics',
    questions: [
      { id: 'q7', type: 'multiple-choice' as const, question: 'What is considered the brain of the computer?', options: ['RAM', 'Hard Drive', 'CPU', 'GPU'], correctAnswer: 'CPU' },
      { id: 'q8', type: 'true-false' as const, question: 'RAM provides permanent, long-term storage for data.', options: ['True', 'False'], correctAnswer: 'False' },
      { id: 'q9', type: 'short-answer' as const, question: 'Who invented the World Wide Web?', options: [], correctAnswer: 'Tim Berners-Lee' },
    ]
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // We seed both Desktop and Web with the demo data so new users aren't met with empty screens.
      knowledgeBase: defaultKnowledgeBase,
      flashcards: demoFlashcards,
      exams: demoExams,
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
      name: 'thepreplab-storage',
      // Web teaser uses session storage so it doesn't leave data behind. Desktop uses robust IndexedDB.
      storage: createJSONStorage(() => isWeb ? sessionStorage : idbStorage),
    }
  )
);
