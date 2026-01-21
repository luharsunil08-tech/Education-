
import React, { useState, useEffect } from 'react';
import { generateDailyGK } from '../services/geminiService.ts';

const GK: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGK = async () => {
      setLoading(true);
      try {
        const data = await generateDailyGK();
        setNews(data);
      } catch (e) {
        console.error("AI GK failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGK();
  }, []);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">Daily Sadhana News</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Top AI-curated updates for Indian scholars.</p>
        </div>
        <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
           <i className="fa-solid fa-file-arrow-down text-indigo-600"></i> Monthly AI Digest
        </button>
      </header>

      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900 rounded-[32px] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 card-shadow space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg uppercase tracking-widest">
                  {item.cat}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
              </div>
              <h3 className="font-bold text-xl text-slate-800 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-4">{item.content}</p>
              <div className="flex gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                 <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                   <i className="fa-solid fa-share-nodes"></i> Share
                 </button>
                 <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <i className="fa-solid fa-bookmark"></i> Save
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Quiz Promo */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-[40px] p-10 text-white text-center space-y-6 shadow-2xl shadow-indigo-100 dark:shadow-none overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <i className="fa-solid fa-brain text-[200px] -right-10 -bottom-10 absolute rotate-12"></i>
        </div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-3xl font-black font-heading tracking-tight">Today's AI Memory Test</h3>
          <p className="text-indigo-100 max-w-lg mx-auto font-medium">Chanakya has prepared 5 quick questions based on today's news. Test your current affairs now!</p>
          <button className="bg-white text-indigo-600 px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
            Start AI Quiz
          </button>
        </div>
      </section>
    </div>
  );
};

export default GK;
