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
    const marketUrl = `market://details?id=${packageId}`;
    
    if (/Android/i.test(navigator.userAgent)) {
      window.location.href = marketUrl;
      setTimeout(() => {
        window.open(playStoreUrl, '_blank');
      }, 500);
    } else {
      window.open(playStoreUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pl-64 transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 p-6 overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
               <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white font-heading tracking-tighter">BharatEdu</h1>
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universal Path</p>
            <div className="grid grid-cols-2 gap-1.5">
              {exams.map(e => (
                <button 
                  key={e}
                  onClick={() => setGlobalExam(e)}
                  className={`px-2 py-2 rounded-xl text-[10px] font-black transition-all border ${globalExam === e ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-600'}`}
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
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-lg w-6 transition-transform group-hover:scale-110`}></i>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          <button 
            onClick={launchPlayStore}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all border border-indigo-100/50 dark:border-indigo-800/50"
          >
            <i className="fa-brands fa-google-play text-lg"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Android App</span>
          </button>
          
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-500' : 'fa-moon text-indigo-400'} w-6`}></i>
            <span className="text-xs font-black uppercase tracking-widest">{darkMode ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 z-50 flex justify-between items-center shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-lg`}></i>
            <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;