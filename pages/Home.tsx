
import React, { useState, useEffect } from 'react';
import { generateDailyQuestion, solveDoubt } from '../services/geminiService.ts';

interface HomeProps {
  name: string;
  onAskAI: (text: string, mode?: any) => void;
  onStartRapid: () => void;
  examLevel: string;
  mistakeCount: number;
}

const Home: React.FC<HomeProps> = ({ name, onAskAI, onStartRapid, examLevel, mistakeCount }) => {
  const [dailyQuestion, setDailyQuestion] = useState<string>("Invoking Chanakya's wisdom...");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initDaily = async () => {
      const q = await generateDailyQuestion(examLevel);
      setDailyQuestion(q || "Padhai shuru karo beta, manzil door nahi!");
    };
    initDaily();
  }, [examLevel]);

  const handleIntent = async (intent: string, label: string) => {
    onAskAI(`Generate ${label}`, intent as any);
  };

  const handleAnalysis = async () => {
    setIsLoading(true);
    const result = await solveDoubt(`Analyze my progress. I have ${mistakeCount} mistakes in my notebook. Level: ${examLevel}.`, [], 'progress_analysis', examLevel);
    setAnalysisResult(result);
    setIsLoading(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Hero: Smart Mentor Status */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-10 rounded-[48px] shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <i className="fa-solid fa-om text-[200px]"></i>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white text-3xl">
                  <i className="fa-solid fa-graduation-cap text-indigo-400"></i>
               </div>
               <div>
                 <h1 className="text-4xl font-black text-white font-heading tracking-tight leading-none mb-1">Namaste, {name}.</h1>
                 <p className="text-indigo-200 font-bold uppercase tracking-widest text-[10px] opacity-80">Active Level: {examLevel}</p>
               </div>
             </div>
             <p className="text-indigo-100/70 max-w-lg font-medium text-lg leading-relaxed">
               I am analyzing latest **NTA & CBSE** trends for you. Select your target below to begin Sadhana.
             </p>
          </div>
          <button 
            onClick={handleAnalysis}
            disabled={isLoading}
            className="group bg-white text-indigo-900 px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
          >
            {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-chart-line"></i>}
            Analyze My Progress
          </button>
        </div>
      </section>

      {analysisResult && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-indigo-200 dark:border-indigo-900/30 card-shadow prose dark:prose-invert max-w-none animate-in zoom-in-95">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black font-heading text-indigo-600 uppercase tracking-tighter">Guru's Personalized Schedule</h3>
              <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-rose-500"><i className="fa-solid fa-circle-xmark"></i></button>
           </div>
           <div className="whitespace-pre-wrap text-sm leading-relaxed overflow-x-auto">{analysisResult}</div>
        </div>
      )}

      {/* Command Hub: Exam & Strategy Roads */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white font-heading">Sadhana Command Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => handleIntent('neet', 'NEET 12-Month Preparation Roadmap')}
            className="p-8 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-[32px] text-left group hover:bg-emerald-100 transition-all"
          >
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-stethoscope text-2xl"></i>
            </div>
            <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-100">NEET Roadmap</h3>
            <p className="text-emerald-700/60 text-sm mt-2 font-medium">NTA Pattern, Syllabus Breakdown, & 12-Month Daily Routine.</p>
          </button>

          <button 
            onClick={() => handleIntent('jee', 'JEE Main + Advanced Strategic Roadmap')}
            className="p-8 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 rounded-[32px] text-left group hover:bg-orange-100 transition-all"
          >
            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-microchip text-2xl"></i>
            </div>
            <h3 className="text-xl font-black text-orange-900 dark:text-orange-100">JEE Mastery</h3>
            <p className="text-orange-700/60 text-sm mt-2 font-medium">Main + Advanced Roadmaps with Progressive Difficulty.</p>
          </button>

          <button 
            onClick={() => handleIntent('strategy', 'Score Improvement & Revision Strategy')}
            className="p-8 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-[32px] text-left group hover:bg-indigo-100 transition-all"
          >
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-chess-knight text-2xl"></i>
            </div>
            <h3 className="text-xl font-black text-indigo-900 dark:text-indigo-100">Score Strategy</h3>
            <p className="text-indigo-700/60 text-sm mt-2 font-medium">Revision hacks, Mock Test cycles, & score improvement techniques.</p>
          </button>
        </div>
      </section>

      {/* Subject Intelligence Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-black text-slate-800 dark:text-white font-heading">Subject Intelligence</h2>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simple to Advanced</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Physics', icon: 'fa-atom', color: 'text-blue-500', bg: 'bg-blue-50' },
            { name: 'Chemistry', icon: 'fa-flask-vial', color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { name: 'Biology', icon: 'fa-dna', color: 'text-rose-500', bg: 'bg-rose-50' },
            { name: 'Mathematics', icon: 'fa-calculator', color: 'text-amber-500', bg: 'bg-amber-50' }
          ].map(sub => (
            <button 
              key={sub.name}
              onClick={() => onAskAI(`${sub.name} detailed analysis`, 'subject_deepdive')}
              className="group bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 card-shadow text-center hover:-translate-y-2 transition-all"
            >
              <div className={`w-16 h-16 ${sub.bg} dark:bg-slate-800 rounded-full flex items-center justify-center ${sub.color} text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${sub.icon}`}></i>
              </div>
              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter">{sub.name}</h4>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Deep-Dive</p>
            </button>
          ))}
        </div>
      </section>

      {/* Daily Challenge */}
      <section className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 space-y-8 relative overflow-hidden">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
               <i className="fa-solid fa-brain"></i>
            </div>
            <div>
               <h3 className="text-xl font-bold font-heading dark:text-white">Daily Sadhana Challenge</h3>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">High-Yield NTA Pattern</p>
            </div>
         </div>
         <p className="text-slate-800 dark:text-slate-200 font-bold text-lg leading-relaxed">
           {dailyQuestion}
         </p>
         <button 
            onClick={() => onAskAI(dailyQuestion, 'detailed')}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Reveal Solution with AI Guru
          </button>
      </section>
    </div>
  );
};

export default Home;
