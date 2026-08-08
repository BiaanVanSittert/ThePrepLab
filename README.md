# ThePrepLab 🧪

> A sleek, minimalist, local-first application for building custom flashcards and mock exams directly from your study notes.

ThePrepLab is designed to help you master your materials. Paste your study notes, lectures, or textbook excerpts into your personal Knowledge Base, and seamlessly generate custom flashcards and mock exams to test your understanding.

## ✨ Features

- **Local-First & Offline:** All your data (knowledge base, flashcards, and exam scores) is stored locally on your machine using IndexedDB. No accounts, no cloud sync, complete privacy.
- **Minimalist UI:** A distraction-free, beautifully animated interface built with Tailwind CSS and Framer Motion. Light and Dark modes included.
- **Dual Build Targets:** 
  - 🌐 **Static Web App:** Try the interactive UI demo directly in your browser.
  - 🖥️ **Desktop Application:** Download the full Windows executable (.exe) for the complete local-first experience.
- **Split-Pane Flashcard Builder:** Easily reference your source material while creating custom front/back flashcards.
- **Interactive Study Modes:** (Coming Soon) Flip cards with smooth 3D animations and take scored mock exams.

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
git clone https://github.com/your-username/thepreplab.git

# Navigate to the project directory
cd thepreplab

# Install dependencies
npm install

# Run the development server
npm run dev

# (Optional) Run the Tauri desktop app in dev mode
npm run tauri dev
```

## 📦 Releases
Head over to the [Releases](https://github.com/your-username/thepreplab/releases) page to download the latest `.exe` for Windows.
