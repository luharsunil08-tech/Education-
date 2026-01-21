
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  globalExam: string;
  setGlobalExam: (val: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, darkMode, toggleDarkMode, globalExam, setGlobalExam }) => {
  const tabs = [
    { id: 'home', icon: 'fa-compass', label: 'Explore' },
    { id: 'courses', icon: 'fa-graduation-cap', label: "Guru's Path" },
    { id: 'exams', icon: 'fa-wand-magic-sparkles', label: 'Sadhana' },
    { id: 'mistakes', icon: 'fa-book-bookmark', label: 'Journal' },
    { id: 'chat', icon: 'fa-comment-dots', label: 'Guru AI' },
    { id: 'gk', icon: 'fa-newspaper', label: 'Daily GK' },
    { id: 'profile', icon: 'fa-user-circle', label: 'My Path' },
  ];

  const exams = ['School', 'JEE/NEET', 'Graduation', 'PG'];

  const launchPlayStore = () => {
    const packageId = "com.bharatedu.app"; 
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageId}`;
    window.open(playStoreUrl, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pl-64 transition-colors duration-300 bg-brand-lightBg dark:bg-brand-darkBg">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-brand-secondary border-r border-brand-sage dark:border-brand-primary z-50 p-6 overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-accent shadow-lg shadow-brand-primary/20">
               <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <h1 className="text-xl font-black text-brand-primary dark:text-brand-lightBg font-heading tracking-tighter">BharatEdu</h1>
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">Universal Path</p>
            <div className="grid grid-cols-2 gap-1.5">
              {exams.map(e => (
                <button 
                  key={e}
                  onClick={() => setGlobalExam(e)}
                  className={`px-2 py-2 rounded-xl text-[10px] font-black transition-all border ${globalExam === e ? 'bg-brand-primary border-brand-primary text-brand-lightBg shadow-lg' : 'bg-brand-lightBg dark:bg-brand-primary/50 border-brand-sage dark:border-brand-sage/30 text-brand-muted hover:text-brand-primary'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-brand-lightBg shadow-xl font-bold'
                  : 'text-brand-muted hover:bg-brand-lightBg dark:hover:bg-brand-primary/30'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-lg w-6 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-brand-accent' : ''}`}></i>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-brand-sage dark:border-brand-sage/20 flex flex-col gap-2">
          <button 
            onClick={launchPlayStore}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl bg-brand-lightBg dark:bg-brand-primary/30 text-brand-primary dark:text-brand-accent hover:opacity-90 transition-all border border-brand-sage/30"
          >
            <i className="fa-brands fa-google-play text-lg"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Android App</span>
          </button>
          
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-brand-muted hover:bg-brand-lightBg dark:hover:bg-brand-primary/30 transition-all"
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun text-brand-gold' : 'fa-moon text-brand-accent'} w-6`}></i>
            <span className="text-xs font-black uppercase tracking-widest">{darkMode ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${activeTab === 'course-player' ? 'p-0' : 'p-4 md:p-8'} max-w-7xl mx-auto w-full`}>
        {children}
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-brand-secondary border-t border-brand-sage dark:border-brand-primary/50 px-2 py-2 z-50 flex justify-between items-center shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === tab.id ? 'text-brand-primary dark:text-brand-accent' : 'text-brand-muted'
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-base`}></i>
            <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
