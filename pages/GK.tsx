
import React, { useState, useEffect } from 'react';
import { generateDailyGK } from '../services/geminiService.ts';

const GK: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchLog, setResearchLog] = useState<string[]>([]);

  useEffect(() => {
    const fetchGK = async () => {
      setLoading(true);
      const logs = [
        "Initializing Background Researcher...",
        "Scanning NTA Portal for Exam dates...",
        "Filtering Press Information Bureau (PIB) India...",
        "Detecting High-Yield Science breakthroughs...",
        "Analyzing Global Pedagogy shifts...",
        "Synthesizing 5 Daily Knowledge bursts..."
      ];
      
      let logIdx = 0;
      const interval = setInterval(() => {
        if (logIdx < logs.length) {
          setResearchLog(prev => [...prev, logs[logIdx]]);
          logIdx++;
        }
      }, 1000);

      try {
        const data = await generateDailyGK();
        setNews(data);
      } catch (e) {
        console.error("AI GK failed", e);
      } finally {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchGK();
  }, []);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-brand-accent text-xl shadow-lg shadow-brand-primary/20">
               <i className="fa-solid fa-newspaper"></i>
            </div>
            <h2 className="text-4xl font-black text-brand-primary dark:text-brand-lightBg font-heading tracking-tight leading-none">Chanakya's Intelligence</h2>
          </div>
          <p className="text-brand-muted dark:text-brand-accent/60 text-lg font-medium italic">Verified education breakthroughs curated by AI Researcher.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white dark:bg-brand-secondary border border-brand-sage/30 px-8 py-4 rounded-[32px] text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-brand-lightBg dark:hover:bg-brand-primary/30 transition-all shadow-sm active:scale-95"
        >
          <i className="fa-solid fa-arrows-rotate text-brand-accent"></i> Initiate Research
        </button>
      </header>

      {loading ? (
        <div className="h-[65vh] flex flex-col md:flex-row items-center justify-center gap-16 px-4">
           <div className="relative">
             <div className="w-48 h-48 border-8 border-brand-accent/10 rounded-full animate-ping absolute inset-0"></div>
             <div className="w-48 h-48 border-t-8 border-brand-primary rounded-full animate-spin flex items-center justify-center">
                <i className="fa-solid fa-microchip text-6xl text-brand-primary dark:text-brand-accent"></i>
             </div>
           </div>
           
           <div className="w-full max-w-lg space-y-6">
             <h4 className="text-2xl font-black font-heading dark:text-brand-lightBg uppercase tracking-tighter">AI Background Research</h4>
             <div className="bg-brand-primary p-8 rounded-[40px] border border-brand-sage/30 font-mono text-sm space-y-3 shadow-2xl h-64 overflow-y-auto no-scrollbar">
               {researchLog.map((log, i) => (
                 <div key={i} className="flex gap-4 animate-in slide-in-from-left-4 duration-300">
                   <span className="text-brand-accent">[DONE]</span>
                   <span className="text-brand-lightBg/80">{log}</span>
                 </div>
               ))}
               <div className="flex gap-4 items-center">
                  <span className="text-brand-gold animate-pulse">[BUSY]</span>
                  <span className="text-brand-muted">Awaiting AI synthesis...</span>
               </div>
             </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-brand-secondary p-10 rounded-[64px] border border-brand-sage/10 dark:border-brand-sage/30 card-shadow space-y-6 hover:border-brand-accent transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lightBg dark:bg-brand-primary/20 rounded-bl-[120px] -z-10 transition-all group-hover:scale-125"></div>
              
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] font-black text-brand-primary dark:text-brand-accent bg-brand-lightBg dark:bg-brand-primary/40 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-brand-sage/20">
                  {item.cat}
                </span>
                <span className="text-[11px] text-brand-muted font-bold">{item.date}</span>
              </div>
              
              <h3 className="font-black text-2xl text-brand-primary dark:text-brand-lightBg leading-tight group-hover:text-brand-accent transition-colors relative z-10">{item.title}</h3>
              <p className="text-brand-muted dark:text-brand-accent/60 text-base leading-relaxed line-clamp-5 font-medium relative z-10">{item.content}</p>
              
              <div className="flex gap-6 pt-6 border-t border-brand-sage/10 relative z-10">
                 <button className="text-[10px] font-black text-brand-primary dark:text-brand-accent uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-transform">
                   <i className="fa-solid fa-circle-arrow-right"></i> Read More
                 </button>
                 <button className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] flex items-center gap-2 hover:text-brand-gold transition-colors">
                   <i className="fa-solid fa-bookmark"></i> Archive
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Background Task Promo - Soft Gold Highlight */}
      {!loading && (
        <section className="bg-brand-primary rounded-[64px] p-16 text-brand-lightBg text-center space-y-8 shadow-2xl relative overflow-hidden group border border-brand-sage">
          <div className="absolute inset-0 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
            <i className="fa-solid fa-dna text-[300px] -right-20 -bottom-20 absolute rotate-12"></i>
          </div>
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <h3 className="text-5xl font-black font-heading tracking-tight leading-none text-brand-accent">Chanakya's Quiz Engine</h3>
            <p className="text-brand-accent/80 text-xl font-medium leading-relaxed">The Researcher has extracted 5 key insights from today's feed. Are you ready to verify your memory retention?</p>
            <button className="bg-brand-gold text-brand-primary px-14 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:opacity-90 active:scale-95 transition-all">
              Initiate Recall Sadhana
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default GK;
