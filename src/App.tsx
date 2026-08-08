
import { MainLayout } from './layouts/MainLayout';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { FlashcardBuilder } from './pages/FlashcardBuilder';

function NavLinks() {
  const location = useLocation();
  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'Knowledge Base', path: '/knowledge' },
    { name: 'Flashcards', path: '/flashcards' },
  ];

  return (
    <div className="flex items-center gap-6">
      {links.map(link => (
        <Link 
          key={link.path} 
          to={link.path}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <MainLayout navLinks={<NavLinks />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/flashcards" element={<FlashcardBuilder />} />
        </Routes>
      </MainLayout>
    </HashRouter>
  );
}

export default App;
