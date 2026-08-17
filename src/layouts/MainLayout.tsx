import React from "react";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { SettingsModal } from "../components/SettingsModal";
import { BookOpen, Github, Bug } from "lucide-react";
import { Link } from "react-router-dom";

export function MainLayout({ children, navLinks }: { children: React.ReactNode, navLinks?: React.ReactNode }) {
  const isWeb = import.meta.env.VITE_APP_MODE === 'web';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 max-w-6xl flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold tracking-tight text-xl">ThePrepLab</span>
          </Link>

          {/* Center/Right: Navigation */}
          <div className="flex-1 flex justify-center lg:justify-end sm:mr-4 overflow-x-auto py-1">
            {navLinks}
          </div>

          {/* Far Right: Tools */}
          <nav className="flex items-center gap-1.5 sm:gap-2 border-l border-border pl-2 sm:pl-4 shrink-0">
            {isWeb && (
              <>
                <a
                  href="https://github.com/BiaanVanSittert/ThePrepLab/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted/60 text-foreground transition-colors"
                  title="Report an issue or bug on GitHub"
                >
                  <Bug className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span className="hidden md:inline">Report Issue</span>
                </a>

                <a
                  href="https://github.com/BiaanVanSittert"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted/60 text-foreground transition-colors"
                  title="View GitHub profile and other projects"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </>
            )}
            <ThemeSwitcher />
            <SettingsModal />
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 max-w-6xl py-8">
        {children}
      </main>
    </div>
  );
}
