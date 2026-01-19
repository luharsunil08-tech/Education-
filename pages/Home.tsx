
import React, { useState } from 'react';
import ChanakyaLive from '../components/ChanakyaLive.tsx';

interface HomeProps {
  name: string;
  onAskAI: (text: string) => void;
  onStartRapid: () => void;
  examLevel: string;
  mistakeCount: number;
}

const Home: React.FC<HomeProps> = ({ name, onAskAI, onStartRapid, examLevel, mistakeCount }) => {
  const [showLive, setShowLive] = useState(false);
  const [motivation, setMotivation] = useState<{ quote: string; author: string } | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [goals, setGoals] = useState([
    { id: 1, text: 'Complete Chapter Summary', done: false },
    { id: 2, text: 'Solve 5 PYQs', done: true },
    { id: 3, text: 'Daily GK Update', done: false },
  ]);

  const dailyQuestion = "If a matrix A is symmetric, then its transpose A' is equal to?";

  const fetchMotivation = async () => {
    setIsFetching(true);
    try {
      // Using a reliable public API for wisdom/quotes
      const response = await fetch('https://dummyjson.com/quotes/random');
      const data = await response.json();
      setMotivation({ quote: data.quote, author: data.author });
    } catch (error) {
      setMotivation({ quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" });
    } finally {
      setIsFetching(false);
    }
  };

  const toggleGoal = (id: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showLive && <ChanakyaLive onClose={() => setShowLive(false)} />}
      
      {/* External API Integration: Guru's Motivation Button */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-[32px] shadow-xl shadow-orange-100 dark:shadow-none group">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-700">
          <i className="fa-solid fa-om text-[120px]"></i>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-xl font-black font-heading uppercase tracking-tighter">Guru's Blessing</h3>
            <p className="text-xs text-amber-100 font-bold uppercase tracking-widest mt-1">Daily dose of wisdom for the dedicated scholar</p>
          </div>
          
          <button 
            onClick={fetchMotivation}
            disabled={isFetching}
            className={`bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center gap-3 ${isFetching ? 'opacity-70 animate-pulse' : 'hover:bg-amber-50'}`}
          >
            {isFetching ? (
              <i className="fa-solid fa-spinner animate-spin"></i>
            ) : (
              <i className="fa-solid fa-hands-praying"></i>
            )}
            {isFetching ? 'Invoking...' : 'Receive Motivation'}
          </button>
        </div>

        {motivation && (
          <div className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl animate-in zoom-in-95 duration-300">
            <p className="text-lg text-white font-serif italic font-medium leading-relaxed">
              "{motivation.quote}"
            </p>
            <p className="text-right text-amber-200 text-xs font-black uppercase tracking-widest mt-4">
              — {motivation.author}
            </p>
          </div>
        )}
      </section>

      {/* Welcome & Global Focus */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Namaste, {name}</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">Focus on Today's Learning.</h2>
        </div>
        
        <div className="bg-indigo-900 text-white p-5 rounded-2xl flex items-center gap-6 shadow-md border border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Path</span>
            <span className="text-xl font-black">{examLevel} Standard</span>
          </div>
          <div className="h-10 w-px bg-white/20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Streak</span>
            <span className="text-xl font-black">7 Days 🔥</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Action Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <section 
               onClick={onStartRapid}
               className="bg-indigo-600 text-white p-6 rounded-[32px] cursor-pointer hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none group overflow-hidden relative"
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <i className="fa-solid fa-bolt text-lg"></i>
                  </div>
                  <h3 className="text-xl font-bold font-heading">60-Sec Revision</h3>
                  <p className="text-xs text-white/70 mt-1">Atomic notes for {examLevel}.</p>
                </div>
                <i className="fa-solid fa-bolt absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-125 transition-transform"></i>
             </section>

             <section 
               onClick={() => {}} 
               className="bg-emerald-600 text-white p-6 rounded-[32px] cursor-pointer hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 dark:shadow-none group overflow-hidden relative"
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <i className="fa-solid fa-book-bookmark text-lg"></i>
                  </div>
                  <h3 className="text-xl font-bold font-heading">Mistake Journal</h3>
                  <p className="text-xs text-white/70 mt-1">{mistakeCount} concepts saved.</p>
                </div>
                <i className="fa-solid fa-bookmark absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-125 transition-transform"></i>
             </section>
          </div>

          {/* Daily Checklist */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-heading">Daily Checklist</h3>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                {goals.filter(g => g.done).length}/{goals.length} Task
              </span>
            </div>
            
            <div className="space-y-3">
              {goals.map(goal => (
                <div 
                  key={goal.id} 
                  onClick={() => toggleGoal(goal.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    goal.done ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-100 dark:shadow-none' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {goal.done && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                  </div>
                  <span className={`text-sm font-bold ${
                    goal.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - Quick Stats & Revision */}
        <div className="space-y-8">
          {/* Question Pulse with One-Tap Doubt */}
          <section className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[32px] border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-3 mb-4 text-amber-700 dark:text-amber-400">
               <i className="fa-solid fa-bolt"></i>
               <h3 className="font-bold text-sm tracking-widest uppercase">Target Revision</h3>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 font-bold leading-relaxed mb-6">
              {dailyQuestion}
            </p>
            <button 
              onClick={() => onAskAI(dailyQuestion)}
              className="w-full bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 py-4 rounded-2xl text-xs font-black border border-amber-200 dark:border-amber-900 shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <i className="fa-solid fa-brain"></i> Ask Chanakya Guru
            </button>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 card-shadow text-center">
             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4 shadow-inner">
                <i className="fa-solid fa-graduation-cap"></i>
             </div>
             <h4 className="font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tighter">Academic Growth</h4>
             <p className="text-xs text-slate-400 font-medium leading-relaxed">
               Beta, you've improved your accuracy in {examLevel} subjects by 15% this week!
             </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
