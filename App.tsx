
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
