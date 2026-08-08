import React from "react";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { SettingsModal } from "../components/SettingsModal";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export function MainLayout({ children, navLinks }: { children: React.ReactNode, navLinks?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 max-w-6xl flex items-center justify-between">
          
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold tracking-tight text-xl">ThePrepLab</span>
          </Link>

          {/* Center/Right: Navigation */}
          <div className="flex-1 flex justify-center lg:justify-end mr-8">
            {navLinks}
          </div>

          {/* Far Right: Tools */}
          <nav className="flex items-center gap-2 border-l border-border pl-4">
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
