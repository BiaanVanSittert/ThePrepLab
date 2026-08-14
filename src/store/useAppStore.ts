import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// Promise queue to prevent idb-keyval transaction concurrency bugs (race conditions)
let idbQueue = Promise.resolve();

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return new Promise((resolve) => {
      idbQueue = idbQueue.then(async () => {
        resolve((await get(name)) || null);
      }).catch(() => resolve(null));
    });
  },
  setItem: async (name: string, value: string): Promise<void> => {
    return new Promise((resolve) => {
      idbQueue = idbQueue.then(async () => {
        await set(name, value);
        resolve();
      }).catch(() => resolve());
    });
  },
  removeItem: async (name: string): Promise<void> => {
    return new Promise((resolve) => {
      idbQueue = idbQueue.then(async () => {
        await del(name);
        resolve();
      }).catch(() => resolve());
    });
  },
};

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface FlashcardData {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  cards: FlashcardData[];
}

export interface ExamQuestion {
  id: string;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  explanation?: string;
}

export interface Exam {
  id: string;
  title: string;
  questions: ExamQuestion[];
  timeLimitMinutes?: number;
}

export interface AppResult {
  id: string;
  type?: 'exam' | 'flashdeck';
  referenceId: string; // Will hold examId or deckId
  examId?: string; // Legacy support
  date: string;
  score: number;
  total: number;
}

export interface AppState {
  knowledgeBase: string; // Active document text / fallback
  docs: KnowledgeDoc[];
  activeDocId: string;
  decks: FlashcardDeck[];
  exams: Exam[];
  results: AppResult[];
  enableShortcuts: boolean;
  
  // Knowledge Base Actions
  setKnowledgeBase: (text: string) => void;
  addDoc: (title: string, content?: string) => string;
  updateDoc: (id: string, updates: Partial<KnowledgeDoc>) => void;
  removeDoc: (id: string) => void;
  setActiveDocId: (id: string) => void;
  
  // Flashcard Deck Actions
  addDeck: (title: string) => string;
  updateDeckTitle: (id: string, title: string) => void;
  restoreDeck: (deck: FlashcardDeck) => void;
  removeDeck: (id: string) => void;
  addFlashcardToDeck: (deckId: string, card: Omit<FlashcardData, 'id'>) => void;
  updateFlashcardInDeck: (deckId: string, cardId: string, card: Partial<FlashcardData>) => void;
  removeFlashcardFromDeck: (deckId: string, cardId: string) => void;
  
  // Exam Actions
  addExam: (exam: Omit<Exam, 'id'>) => string;
  restoreExam: (exam: Exam) => void;
  updateExam: (id: string, exam: Partial<Omit<Exam, 'id'>>) => void;
  updateQuestionInExam: (examId: string, questionId: string, question: Partial<ExamQuestion>) => void;
  removeExam: (id: string) => void;
  
  // Results & Utility Actions
  addResult: (result: Omit<AppResult, 'id'>) => void;
  removeResult: (id: string) => void;
  clearResults: () => void;
  importSelected: (newDecks: FlashcardDeck[], newExams: Exam[], newDocs?: KnowledgeDoc[]) => void;
  toggleShortcuts: (enabled: boolean) => void;
  factoryReset: () => void;
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

const demoDocs: KnowledgeDoc[] = [
  {
    id: 'doc-demo-1',
    title: 'General Notes (Science, History, Tech)',
    content: defaultKnowledgeBase,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-demo-2',
    title: 'Cell Biology Notes',
    content: `--- BIOLOGY: CELL BIOLOGY ---
Cells are the basic structural and functional units of all living organisms. The nucleus serves as the cell's command center, housing DNA. Mitochondria are the powerhouses of the cell, generating adenosine triphosphate (ATP) via cellular respiration. Ribosomes carry out protein synthesis. Plant cells feature chloroplasts for photosynthesis and a rigid outer cell wall made of cellulose.`,
    updatedAt: new Date().toISOString(),
  }
];

const demoDecks: FlashcardDeck[] = [
  {
    id: 'deck-sci',
    title: 'Science: Solar System & Physics',
    cards: [
      { id: 'sci-1', front: 'What is the largest planet in our solar system?', back: 'Jupiter' },
      { id: 'sci-2', front: 'What is the speed of light in a vacuum?', back: '299,792,458 m/s' },
      { id: 'sci-3', front: 'At what temperature does water boil at sea level?', back: '100 degrees Celsius' },
    ]
  },
  {
    id: 'deck-his',
    title: 'History: Ancient Rome',
    cards: [
      { id: 'his-1', front: 'Who was the first Roman Emperor?', back: 'Augustus Caesar' },
      { id: 'his-2', front: 'In what year was the Roman Empire founded?', back: '27 BC' },
      { id: 'his-3', front: 'When was the Colosseum built?', back: '80 AD' },
    ]
  },
  {
    id: 'deck-tech',
    title: 'Tech: Computer Science Basics',
    cards: [
      { id: 'tech-1', front: 'What does CPU stand for?', back: 'Central Processing Unit' },
      { id: 'tech-2', front: 'Who invented the World Wide Web?', back: 'Tim Berners-Lee' },
      { id: 'tech-3', front: 'In what year was the WWW invented?', back: '1989' },
    ]
  }
];

const demoExams: Exam[] = [
  {
    id: 'exam-sci',
    title: 'Science: Solar System & Physics',
    timeLimitMinutes: 5,
    questions: [
      { id: 'q1', type: 'multiple-choice' as const, question: 'Which planet is known as a gas giant with a Great Red Spot?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Jupiter', explanation: 'Jupiter is the largest gas giant and features the centuries-old Great Red Spot storm.' },
      { id: 'q2', type: 'true-false' as const, question: 'Water boils at 100 degrees Celsius at sea level.', options: ['True', 'False'], correctAnswer: 'True', explanation: 'At standard atmospheric pressure (1 atm), water reaches its boiling point at 100°C.' },
      { id: 'q3', type: 'short-answer' as const, question: 'What is the speed of light in meters per second?', options: [], correctAnswer: '299,792,458', explanation: 'The speed of light in a vacuum is defined as exactly 299,792,458 m/s.' },
    ]
  },
  {
    id: 'exam-his',
    title: 'History: Ancient Rome',
    timeLimitMinutes: 5,
    questions: [
      { id: 'q4', type: 'multiple-choice' as const, question: 'Who proclaimed himself the first Roman emperor?', options: ['Julius Caesar', 'Augustus Caesar', 'Nero', 'Trajan'], correctAnswer: 'Augustus Caesar', explanation: 'Augustus (formerly Octavian) became the first official emperor of Rome in 27 BC.' },
      { id: 'q5', type: 'true-false' as const, question: 'The Roman Empire was founded in 80 AD.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'The Roman Empire was founded in 27 BC. 80 AD was when the Colosseum was completed.' },
      { id: 'q6', type: 'short-answer' as const, question: 'What famous Roman structure was used for gladiatorial contests?', options: [], correctAnswer: 'Colosseum', explanation: 'The Colosseum (Flavian Amphitheatre) seated up to 80,000 spectators for gladiatorial games.' },
    ]
  },
  {
    id: 'exam-tech',
    title: 'Tech: Computer Science Basics',
    timeLimitMinutes: 5,
    questions: [
      { id: 'q7', type: 'multiple-choice' as const, question: 'What is considered the brain of the computer?', options: ['RAM', 'Hard Drive', 'CPU', 'GPU'], correctAnswer: 'CPU', explanation: 'The Central Processing Unit (CPU) executes program instructions and performs calculations.' },
      { id: 'q8', type: 'true-false' as const, question: 'RAM provides permanent, long-term storage for data.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'RAM is volatile memory and loses its contents when power is lost.' },
      { id: 'q9', type: 'short-answer' as const, question: 'Who invented the World Wide Web?', options: [], correctAnswer: 'Tim Berners-Lee', explanation: 'Sir Tim Berners-Lee invented the World Wide Web in 1989 at CERN.' },
    ]
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      knowledgeBase: defaultKnowledgeBase,
      docs: demoDocs,
      activeDocId: 'doc-demo-1',
      decks: demoDecks,
      exams: demoExams,
      results: [],
      enableShortcuts: true,
      
      // Knowledge Base Actions
      setKnowledgeBase: (kb) => set((state) => {
        const activeDoc = state.docs.find(d => d.id === state.activeDocId);
        if (activeDoc) {
          return {
            knowledgeBase: kb,
            docs: state.docs.map(d => d.id === state.activeDocId ? { ...d, content: kb, updatedAt: new Date().toISOString() } : d)
          };
        }
        return { knowledgeBase: kb };
      }),

      addDoc: (title, content = '') => {
        const newId = crypto.randomUUID();
        const newDoc: KnowledgeDoc = {
          id: newId,
          title: title.trim() || 'Untitled Notes',
          content,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          docs: [newDoc, ...state.docs],
          activeDocId: newId,
          knowledgeBase: content,
        }));
        return newId;
      },

      updateDoc: (id, updates) => set((state) => {
        const updatedDocs = state.docs.map(d => 
          d.id === id 
            ? { ...d, ...updates, updatedAt: new Date().toISOString() } 
            : d
        );
        const activeContent = id === state.activeDocId && updates.content !== undefined 
          ? updates.content 
          : state.knowledgeBase;
        return {
          docs: updatedDocs,
          knowledgeBase: activeContent,
        };
      }),

      removeDoc: (id) => set((state) => {
        const filteredDocs = state.docs.filter(d => d.id !== id);
        const nextDoc = filteredDocs[0];
        return {
          docs: filteredDocs,
          activeDocId: nextDoc ? nextDoc.id : '',
          knowledgeBase: nextDoc ? nextDoc.content : '',
        };
      }),

      setActiveDocId: (id) => set((state) => {
        const targetDoc = state.docs.find(d => d.id === id);
        return {
          activeDocId: id,
          knowledgeBase: targetDoc ? targetDoc.content : state.knowledgeBase,
        };
      }),
      
      // Flashcard Deck Actions
      addDeck: (title) => {
        const newId = crypto.randomUUID();
        set((state) => ({
          decks: [...state.decks, { id: newId, title, cards: [] }]
        }));
        return newId;
      },

      updateDeckTitle: (id, title) => set((state) => ({
        decks: state.decks.map(d => d.id === id ? { ...d, title: title.trim() || d.title } : d)
      })),

      restoreDeck: (deck) => set((state) => ({
        decks: [...state.decks, deck]
      })),

      removeDeck: (id) => set((state) => ({
        decks: state.decks.filter(d => d.id !== id)
      })),

      addFlashcardToDeck: (deckId, card) => set((state) => ({
        decks: state.decks.map(d => 
          d.id === deckId 
            ? { ...d, cards: [...d.cards, { ...card, id: crypto.randomUUID() }] }
            : d
        )
      })),

      updateFlashcardInDeck: (deckId, cardId, card) => set((state) => ({
        decks: state.decks.map(d => 
          d.id === deckId 
            ? {
                ...d,
                cards: d.cards.map(c => c.id === cardId ? { ...c, ...card } : c)
              }
            : d
        )
      })),

      removeFlashcardFromDeck: (deckId, cardId) => set((state) => ({
        decks: state.decks.map(d => 
          d.id === deckId 
            ? { ...d, cards: d.cards.filter(c => c.id !== cardId) }
            : d
        )
      })),

      // Exam Actions
      addExam: (exam) => {
        const newId = crypto.randomUUID();
        set((state) => ({
          exams: [...state.exams, { ...exam, id: newId }]
        }));
        return newId;
      },

      restoreExam: (exam) => set((state) => ({
        exams: [...state.exams, exam]
      })),

      updateExam: (id, updatedExam) => set((state) => ({
        exams: state.exams.map(e => e.id === id ? { ...e, ...updatedExam } : e)
      })),

      updateQuestionInExam: (examId, questionId, updatedQ) => set((state) => ({
        exams: state.exams.map(e => 
          e.id === examId 
            ? {
                ...e,
                questions: e.questions.map(q => q.id === questionId ? { ...q, ...updatedQ } : q)
              }
            : e
        )
      })),

      removeExam: (id) => set((state) => ({
        exams: state.exams.filter(e => e.id !== id)
      })),

      // Results & History Actions
      addResult: (result) => set((state) => ({
        results: [...state.results, { ...result, id: crypto.randomUUID() }]
      })),

      removeResult: (id) => set((state) => ({
        results: state.results.filter(r => r.id !== id)
      })),

      clearResults: () => set({ results: [] }),

      importSelected: (newDecks, newExams, newDocs) => {
        const safeDecks = (newDecks || []).map(d => ({
          ...d,
          id: crypto.randomUUID(),
          cards: (d.cards || []).map(c => ({ ...c, id: crypto.randomUUID() }))
        }));
        
        const safeExams = (newExams || []).map(e => ({
          ...e,
          id: crypto.randomUUID(),
          questions: (e.questions || []).map(q => ({ ...q, id: crypto.randomUUID() }))
        }));

        const safeDocs = (newDocs || []).map(doc => ({
          ...doc,
          id: crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
        }));

        set((state) => ({
          decks: [...state.decks, ...safeDecks],
          exams: [...state.exams, ...safeExams],
          docs: safeDocs.length > 0 ? [...state.docs, ...safeDocs] : state.docs,
        }));
      },

      toggleShortcuts: (enabled) => set({ enableShortcuts: enabled }),

      factoryReset: () => set({
        knowledgeBase: defaultKnowledgeBase,
        docs: demoDocs,
        activeDocId: 'doc-demo-1',
        decks: demoDecks,
        exams: demoExams,
        results: []
      }),
    }),
    {
      name: 'thepreplab-storage',
      version: 2,
      storage: createJSONStorage(() => isWeb ? sessionStorage : idbStorage),
      migrate: (persistedState: any, version: number) => {
        const state = persistedState || {};
        if (version < 2 || !state.docs || state.docs.length === 0) {
          const legacyKb = state.knowledgeBase || defaultKnowledgeBase;
          state.docs = [
            {
              id: 'doc-migrated-1',
              title: 'General Study Notes',
              content: legacyKb,
              updatedAt: new Date().toISOString(),
            }
          ];
          state.activeDocId = 'doc-migrated-1';
        }
        return state;
      },
    }
  )
);
