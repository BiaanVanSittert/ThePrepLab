# ThePrepLab 🧪

> A sleek, minimalist, local-first application for building custom flashcards and mock exams directly from your study notes.

ThePrepLab is designed to help you master your materials. Paste your study notes, lectures, or textbook excerpts into your personal Knowledge Base, and seamlessly generate custom flashcards and mock exams to test your understanding.

## ✨ Features

- **Local-First & Offline:** All your data (knowledge base, flashcards, and exam scores) is stored locally on your machine using IndexedDB. No accounts, no cloud sync, complete privacy.
- **Minimalist UI:** A distraction-free, beautifully animated interface built with Tailwind CSS and Framer Motion. Light and Dark modes included.
- **FlashDeck Builder:** Easily reference your source material while creating custom front/back flashcards.
- **Exam Builder:** Create your own custom mock exams featuring Multiple Choice, True/False, and Exact Short Answer questions.
- **Interactive Study Modes:** Flip cards with smooth 3D animations and take scored mock exams with a detailed breakdown of what you got right and wrong.
- **Smart Highlighter Shortcuts (Desktop Only):** Highlight text from your knowledge base and use `Ctrl+F` and `Ctrl+B` to instantly pipe text into your flashcard or exam builder!
- **Selective Import & Export:** Easily select exactly which FlashDecks and Exams you want to share with friends, and preview them before importing.
- **Auto-Updater:** The desktop app will automatically notify you when a new release is available on GitHub.
- **Dual Build Targets:** 
  - 🌐 **Static Web App:** Try the interactive UI demo directly in your browser.
  - 🖥️ **Desktop Application:** Download the full Windows executable (.exe) for the complete local-first experience.

## 📖 How to Use

### 1. The Knowledge Base
Start by clicking the **Create+** hub and selecting the **Knowledge Base**. Paste your textbook chapters, lecture transcripts, or raw notes here. This text will be permanently visible on the left side of your screen when you build FlashDecks or Exams.

### 2. Building FlashDecks (Smart Highlighter)
Go to the **FlashDeck Builder**. You can either manually type your Front and Back cards, or use the **Smart Highlighter**:
- Highlight any text in your Knowledge Base pane.
- A floating popover will appear allowing you to send the text to the Front or Back input box.
- **Keyboard Shortcut (Faster):** Press `Ctrl + F` to send the highlighted text to the **Front**, or `Ctrl + B` to send it to the **Back**!
- If you accidentally override text, simply press `Ctrl + Z` to Undo, or `Ctrl + Y` to Redo.

### 3. Sharing Data (Import / Export)
Want to send a deck to a classmate?
1. Click the **Download (Export)** icon on the Dashboard.
2. Check the specific FlashDecks and Exams you wish to share, then click Export. It will download a `.json` file.
3. Your friend can click the **Upload (Import)** icon, select the file, and they will see a preview of what they are importing before finalizing.

### 4. Factory Reset
If you ever want to clear out your custom data and restore the original Demo decks:
1. Click the **Gear Icon** next to the theme toggle.
2. Click **Factory Reset All Data**. *Note: This permanently deletes all your local data.*

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Desktop Wrapper:** Tauri
- **Styling:** Tailwind CSS, Framer Motion, Lucide Icons
- **State Management:** Zustand + idb-keyval (IndexedDB)
- **CI/CD:** GitHub Actions (Automated Web deployment & EXE builds)

## 🚀 Quick Start (Development)

Ensure you have [Node.js](https://nodejs.org/) and [Rust](https://www.rust-lang.org/) installed.

```bash
# Clone the repository
git clone https://github.com/BiaanVanSittert/ThePrepLab.git

# Navigate to the project directory
cd ThePrepLab

# Install dependencies
npm install

# Run the development server
npm run dev

# (Optional) Run the Tauri desktop app in dev mode
npm run tauri dev
```

## 📦 Releases
Head over to the [Releases](https://github.com/BiaanVanSittert/ThePrepLab/releases) page to download the latest `.exe` for Windows.
