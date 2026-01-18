
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Exams from './pages/Exams';
import AIChat from './pages/AIChat';
import GK from './pages/GK';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Mistakes from './pages/Mistakes';
import RapidRevision from './pages/RapidRevision';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [pendingDoubt, setPendingDoubt] = useState<string | null>(null);
  const [globalExam, setGlobalExam] = useState('JEE');
  const [mistakes, setMistakes] = useState<any[]>(() => {
    const saved = localStorage.getItem('mistakes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mistakes', JSON.stringify(mistakes));
  }, [mistakes]);

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

  const askAI = (questionText: string) => {
    setPendingDoubt(`[${globalExam}] Explain this specifically for my level: ${questionText}`);
    setActiveTab('chat');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  function handleLogin(name: string) {
    setUserName(name);
    setIsLoggedIn(true);
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home name={userName} onAskAI={askAI} onStartRapid={() => setActiveTab('rapid')} examLevel={globalExam} mistakeCount={mistakes.length} />;
      case 'exams': return <Exams onAskAI={askAI} onMistake={addMistake} examLevel={globalExam} />;
      case 'chat': return <AIChat pendingDoubt={pendingDoubt} clearPendingDoubt={() => setPendingDoubt(null)} examLevel={globalExam} />;
      case 'gk': return <GK />;
      case 'profile': return <Profile name={userName} />;
      case 'mistakes': return <Mistakes mistakes={mistakes} onAskAI={askAI} onClear={() => setMistakes([])} />;
      case 'rapid': return <RapidRevision examLevel={globalExam} onAskAI={askAI} />;
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
