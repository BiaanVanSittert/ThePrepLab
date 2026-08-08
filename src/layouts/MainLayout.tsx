import React from "react";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { BookOpen } from "lucide-react";

export function MainLayout({ children, navLinks }: { children: React.ReactNode, navLinks?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-semibold tracking-tight text-lg mr-6">ThePrepLab</span>
            {navLinks}
          </div>
          <nav className="flex items-center gap-4">
            <ThemeSwitcher />
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 max-w-6xl py-8">
        {children}
      </main>
    </div>
  );
}
