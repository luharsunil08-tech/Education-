
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import Exams from './pages/Exams.tsx';
import AIChat from './pages/AIChat.tsx';
import GK from './pages/GK.tsx';
import Profile from './pages/Profile.tsx';
import Login from './pages/Login.tsx';
import KnowledgeVault from './pages/KnowledgeVault.tsx';
import RapidRevision from './pages/RapidRevision.tsx';
import Courses from './pages/Courses.tsx';
import CoursePlayer from './pages/CoursePlayer.tsx';
import { Bookmark } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [pendingDoubt, setPendingDoubt] = useState<{ query: string, mode: string } | null>(null);
  const [globalExam, setGlobalExam] = useState('JEE/NEET');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  
  const [mistakes, setMistakes] = useState<any[]>(() => {
    const saved = localStorage.getItem('mistakes');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mistakes', JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // API Key Check logic
  useEffect(() => {
    const checkApiKey = async () => {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for environments without the selector
        setHasApiKey(!!process.env.API_KEY);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // Assume success as per platform instructions
      setHasApiKey(true);
    }
  };

  const addMistake = (question: any) => {
    if (!mistakes.some(m => m.text === question.text)) {
      setMistakes([question, ...mistakes]);
    }
  };

  const addBookmark = (bookmark: Bookmark) => {
    setBookmarks(prev => [bookmark, ...prev]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const askAI = (query: string, mode: string = 'detailed') => {
    setPendingDoubt({ query, mode });
    setActiveTab('chat');
  };

  const handleSelectCourse = (course: any) => {
    setSelectedCourse(course);
    setActiveTab('course-player');
  };

  if (!isLoggedIn) {
    return <Login onLogin={(name) => { setUserName(name); setIsLoggedIn(true); }} />;
  }

  // Gateway if API Key is not set
  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-brand-darkBg flex items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-brand-secondary p-12 rounded-[56px] max-w-lg w-full border border-brand-accent/30 shadow-2xl space-y-8 animate-in zoom-in-95">
           <div className="w-24 h-24 bg-brand-primary rounded-[32px] flex items-center justify-center text-brand-accent text-5xl mx-auto mb-6 shadow-xl border border-brand-sage">
              <i className="fa-solid fa-key animate-pulse"></i>
           </div>
           <h2 className="text-4xl font-black font-heading text-brand-primary dark:text-brand-lightBg uppercase tracking-tighter">Sadhana Activation</h2>
           <p className="text-brand-muted dark:text-brand-accent/70 font-medium text-lg">
             Chanakya requires a **Gemini Knowledge Key** to illuminate your path. This is a one-time secure activation.
           </p>
           <div className="bg-brand-lightBg/50 dark:bg-brand-darkBg/30 p-6 rounded-3xl border border-brand-sage/20 text-xs font-bold text-brand-primary dark:text-brand-accent/60 leading-relaxed">
             <p>Please select an API Key from a paid GCP project. <br/> Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline text-brand-primary dark:text-brand-lightBg">ai.google.dev/gemini-api/docs/billing</a> for more info.</p>
           </div>
           <button 
             onClick={handleOpenKeySelector}
             className="w-full bg-brand-primary text-brand-lightBg py-6 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-accent hover:text-brand-primary transition-all active:scale-95 flex items-center justify-center gap-3"
           >
             <i className="fa-solid fa-wand-magic-sparkles"></i> Connect Chanakya Key
           </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home name={userName} onAskAI={askAI} onStartRapid={() => setActiveTab('rapid')} examLevel={globalExam} mistakeCount={mistakes.length} />;
      case 'exams': return <Exams onAskAI={(q) => askAI(q, 'detailed')} onMistake={addMistake} examLevel={globalExam} />;
      case 'courses': return <Courses examLevel={globalExam} onSelectCourse={handleSelectCourse} />;
      case 'course-player': return <CoursePlayer course={selectedCourse} onBack={() => setActiveTab('courses')} />;
      case 'chat': return <AIChat pendingDoubt={pendingDoubt} clearPendingDoubt={() => setPendingDoubt(null)} examLevel={globalExam} onBookmark={addBookmark} />;
      case 'gk': return <GK />;
      case 'profile': return <Profile />;
      case 'mistakes': return (
        <KnowledgeVault 
          mistakes={mistakes} 
          bookmarks={bookmarks}
          onAskAI={(q) => askAI(q, 'detailed')} 
          onClearMistakes={() => setMistakes([])}
          onRemoveBookmark={removeBookmark}
        />
      );
      case 'rapid': return <RapidRevision examLevel={globalExam} onAskAI={(q) => askAI(q, 'speed')} />;
      default: return <Home name={userName} onAskAI={askAI} onStartRapid={() => setActiveTab('rapid')} examLevel={globalExam} mistakeCount={mistakes.length} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      darkMode={darkMode} 
      toggleDarkMode={() => setDarkMode(!darkMode)}
      globalExam={globalExam}
      setGlobalExam={setGlobalExam}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
