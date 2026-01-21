
import React, { useState, useEffect } from 'react';
import { generateDailyQuestion, solveDoubt, generateProgressAnalysis, generateSubjectDeepDive } from '../services/geminiService.ts';

interface HomeProps {
  name: string;
  onAskAI: (text: string, mode?: any) => void;
  onStartRapid: () => void;
  examLevel: string;
  mistakeCount: number;
}

const Home: React.FC<HomeProps> = ({ name, onAskAI, onStartRapid, examLevel, mistakeCount }) => {
  const [dailyQuestion, setDailyQuestion] = useState<string>("Summoning Chanakya...");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initDaily = async () => {
      const q = await generateDailyQuestion(examLevel);
      setDailyQuestion(q || "Zabardast taiyari beta! Keep going.");
    };
    initDaily();
  }, [examLevel]);

  const handleAnalysis = async () => {
    setIsLoading(true);
    const res = await generateProgressAnalysis(mistakeCount, examLevel);
    setAnalysisResult(res);
    setIsLoading(false);
  };

  const handleSubject = async (subject: string) => {
    onAskAI(`Complete syllabus and mastery plan for ${subject}`, 'detailed');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Dynamic Welcome Hero */}
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
                 <p className="text-indigo-200 font-bold uppercase tracking-widest text-[10px] opacity-80">Path: {examLevel}</p>
               </div>
             </div>
             <p className="text-indigo-100/70 max-w-lg font-medium text-lg leading-relaxed">
               Chanakya AI is analyzing ${examLevel} patterns. Your success is our mission.
             </p>
          </div>
          <button 
            onClick={handleAnalysis}
            disabled={isLoading}
            className="bg-white text-indigo-900 px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Analyze My Progress'}
          </button>
        </div>
      </section>

      {analysisResult && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-indigo-200 dark:border-indigo-900/30 card-shadow prose dark:prose-invert max-w-none animate-in zoom-in-95">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black font-heading text-indigo-600">Personalized Growth Plan</h3>
              <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-rose-500"><i className="fa-solid fa-circle-xmark"></i></button>
           </div>
           <div className="whitespace-pre-wrap text-sm leading-relaxed overflow-x-auto">{analysisResult}</div>
        </div>
      )}

      {/* Strategic Exam Paths */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white font-heading">Syllabus Excellence Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'neet', label: 'NEET Master Course', icon: 'fa-stethoscope', color: 'bg-emerald-600' },
            { id: 'jee', label: 'JEE Success Roadmap', icon: 'fa-microchip', color: 'bg-orange-600' },
            { id: 'boards', label: 'CBSE 10/12 Strategy', icon: 'fa-book-open', color: 'bg-blue-600' },
            { id: 'govt', label: 'Govt Exam Tracker', icon: 'fa-building-columns', color: 'bg-indigo-600' }
          ].map(p => (
            <button 
              key={p.id}
              onClick={() => onAskAI(`Generate a full ${p.label}`, p.id as any)}
              className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 card-shadow hover:border-indigo-400 transition-all text-left flex flex-col gap-4 group"
            >
              <div className={`${p.color} w-10 h-10 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${p.icon}`}></i>
              </div>
              <span className="font-bold text-slate-800 dark:text-white text-sm">{p.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Subject Intelligence */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-black text-slate-800 dark:text-white font-heading">Subject Sadhana</h2>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NTA/CBSE Patterns</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Physics', 'Chemistry', 'Biology', 'Mathematics'].map(sub => (
            <button 
              key={sub}
              onClick={() => handleSubject(sub)}
              className="group bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 card-shadow text-center hover:-translate-y-2 transition-all"
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i className={`fa-solid ${sub === 'Physics' ? 'fa-atom' : sub === 'Chemistry' ? 'fa-flask-vial' : sub === 'Biology' ? 'fa-dna' : 'fa-calculator'}`}></i>
              </div>
              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter">{sub}</h4>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <section className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
                   <i className="fa-solid fa-brain"></i>
                </div>
                <div>
                   <h3 className="text-xl font-bold font-heading dark:text-white">Dharma Challenge</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Question of the Day</p>
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

        <div className="space-y-10">
           <div className="bg-indigo-600 p-10 rounded-[48px] text-white space-y-6 relative overflow-hidden group">
              <i className="fa-solid fa-bolt absolute -right-6 -top-6 text-[150px] opacity-10 group-hover:scale-125 transition-transform duration-700"></i>
              <h4 className="text-2xl font-black font-heading leading-tight relative z-10">Atomic Revision.</h4>
              <p className="text-indigo-100 text-sm relative z-10 font-medium">Generate 60s memory hacks for any topic instantly.</p>
              <button onClick={onStartRapid} className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest relative z-10 shadow-lg">Open Vault</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
