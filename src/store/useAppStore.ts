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

interface AppState {
  knowledgeBase: string;
  flashcards: FlashcardData[];
  exams: { id: string; title: string; questions: ExamQuestion[] }[];
  
  // Actions
  setKnowledgeBase: (text: string) => void;
  addFlashcard: (card: Omit<FlashcardData, 'id'>) => void;
  removeFlashcard: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      knowledgeBase: '',
      flashcards: [],
      exams: [],

      setKnowledgeBase: (text) => set({ knowledgeBase: text }),
      
      addFlashcard: (card) => set((state) => ({
        flashcards: [...state.flashcards, { ...card, id: crypto.randomUUID() }]
      })),

      removeFlashcard: (id) => set((state) => ({
        flashcards: state.flashcards.filter(c => c.id !== id)
      })),
    }),
    {
      name: 'thepreplab-storage', // unique name
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
