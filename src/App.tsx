import { MainLayout } from './layouts/MainLayout';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

// Web Teaser Imports
import { Dashboard as WebDashboard } from './pages/Dashboard';

// Desktop App Imports
import { DesktopDashboard } from './pages/desktop/DesktopDashboard';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { FlashcardBuilder } from './pages/FlashcardBuilder';
import { ExamBuilder } from './pages/ExamBuilder';
import { StudyMode } from './pages/StudyMode';
import { ExamMode } from './pages/ExamMode';
import { CreatePlus } from './pages/CreatePlus';

const isWeb = import.meta.env.VITE_APP_MODE === 'web';

function WebNavLinks() {
  const location = useLocation();
  const links = [
    { name: 'Teaser Home', path: '/' },
    { name: 'Demo FlashDecks', path: '/study' },
    { name: 'Demo Exam', path: '/exam' },
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

function DesktopNavLinks() {
  const location = useLocation();
  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'Study', path: '/study' },
    { name: 'Take Exam', path: '/exam' },
    { name: 'Create+', path: '/create' },
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

function WebRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WebDashboard />} />
      <Route path="/study" element={<StudyMode />} />
      <Route path="/exam" element={<ExamMode />} />
    </Routes>
  );
}

function DesktopRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DesktopDashboard />} />
      <Route path="/knowledge" element={<KnowledgeBase />} />
      <Route path="/create" element={<CreatePlus />} />
      <Route path="/flashcards" element={<FlashcardBuilder />} />
      <Route path="/exam-builder" element={<ExamBuilder />} />
      <Route path="/study" element={<StudyMode />} />
      <Route path="/exam" element={<ExamMode />} />
    </Routes>
  );
}

function App() {
  return (
    <HashRouter>
      <MainLayout navLinks={isWeb ? <WebNavLinks /> : <DesktopNavLinks />}>
        {isWeb ? <WebRoutes /> : <DesktopRoutes />}
      </MainLayout>
      <Toaster position="bottom-right" richColors duration={6000} closeButton />
    </HashRouter>
  );
}

export default App;
