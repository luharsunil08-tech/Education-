
import React, { useState, useEffect, useRef } from 'react';
import { generateDailyQuestion, solveDoubt } from '../services/geminiService.ts';

interface HomeProps {
  name: string;
  onAskAI: (text: string, mode?: any, media?: any) => void;
  onStartRapid: () => void;
  examLevel: string;
  mistakeCount: number;
}

const Home: React.FC<HomeProps> = ({ name, onAskAI, onStartRapid, examLevel, mistakeCount }) => {
  const [dailyQuestion, setDailyQuestion] = useState<string>("Invoking Chanakya's wisdom...");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initDaily = async () => {
      const q = await generateDailyQuestion(examLevel);
      setDailyQuestion(q || "Padhai shuru karo beta, manzil door nahi!");
    };
    initDaily();
  }, [examLevel]);

  const handleAnalysis = async () => {
    setIsLoading(true);
    const result = await solveDoubt(`Analyze my progress. I have ${mistakeCount} mistakes in my notebook. Level: ${examLevel}.`, [], 'progress_analysis', examLevel);
    setAnalysisResult(result);
    setIsLoading(false);
  };

  const handleVisualDoubt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onAskAI("Please solve this visual doubt.", "detailed", {
          base64: (reader.result as string).split(',')[1],
          preview: URL.createObjectURL(file),
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* Hero: Dynamic Status */}
      <section className="relative overflow-hidden bg-brand-primary p-12 rounded-[64px] shadow-2xl border border-brand-sage/20">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
           <i className="fa-solid fa-om text-[250px]"></i>
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center lg:text-left">
             <div className="flex flex-col lg:flex-row items-center gap-6">
               <div className="w-24 h-24 bg-brand-secondary rounded-[40px] flex items-center justify-center text-brand-accent text-5xl shadow-2xl transform -rotate-6 border border-brand-sage">
                  <i className="fa-solid fa-graduation-cap"></i>
               </div>
               <div>
                 <h1 className="text-5xl font-black text-brand-lightBg font-heading tracking-tight leading-none mb-2">Su-Prabhat, {name}.</h1>
                 <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
                    <p className="text-brand-accent font-black uppercase tracking-[0.2em] text-[10px]">{examLevel} Path Active</p>
                 </div>
               </div>
             </div>
             <p className="text-brand-accent/80 max-w-xl font-medium text-xl leading-relaxed">
               I've researched your latest gaps. You have **{mistakeCount}** critical points to revise today.
             </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
             <button 
                onClick={handleAnalysis}
                disabled={isLoading}
                className="bg-brand-lightBg text-brand-primary px-10 py-6 rounded-[32px] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-chart-pie"></i>}
                Full Progress Report
              </button>
              <button 
                onClick={onStartRapid}
                className="bg-brand-secondary text-brand-accent px-10 py-6 rounded-[32px] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl border border-brand-sage/30 flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-bolt-lightning"></i> Rapid Revision
              </button>
          </div>
        </div>
      </section>

      {analysisResult && (
        <div className="bg-white dark:bg-brand-secondary p-10 rounded-[56px] border-4 border-brand-lightBg dark:border-brand-primary shadow-2xl animate-in zoom-in-95">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-brand-lightBg dark:bg-brand-primary rounded-2xl flex items-center justify-center text-brand-primary dark:text-brand-accent"><i className="fa-solid fa-brain"></i></div>
                 <h3 className="text-3xl font-black font-heading text-brand-primary dark:text-brand-lightBg uppercase tracking-tighter">Guru's Tactical Plan</h3>
              </div>
              <button onClick={() => setAnalysisResult(null)} className="text-brand-muted hover:text-brand-accent text-2xl transition-colors"><i className="fa-solid fa-circle-xmark"></i></button>
           </div>
           <div className="prose dark:prose-invert max-w-none text-lg text-brand-muted dark:text-brand-accent/80 whitespace-pre-wrap leading-relaxed">
             {analysisResult}
           </div>
        </div>
      )}

      {/* Chanakya Lens Feature - Highlighted with Gold */}
      <section className="bg-gradient-to-r from-brand-sage to-brand-primary p-1 rounded-[64px] shadow-2xl group transition-all hover:scale-[1.01]">
         <div className="bg-brand-lightBg dark:bg-brand-darkBg rounded-[60px] p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
               <div className="w-48 h-48 bg-white dark:bg-brand-secondary rounded-[48px] flex items-center justify-center text-7xl text-brand-primary dark:text-brand-accent transition-transform group-hover:rotate-12 border border-brand-sage/20">
                  <i className="fa-solid fa-camera-retro"></i>
               </div>
               <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-brand-gold text-brand-primary rounded-2xl flex items-center justify-center text-2xl shadow-xl animate-bounce">
                  <i className="fa-solid fa-eye"></i>
               </div>
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
               <div className="space-y-2">
                 <h2 className="text-4xl font-black text-brand-primary dark:text-brand-lightBg font-heading tracking-tight">Chanakya Lens</h2>
                 <p className="text-brand-muted dark:text-brand-accent/60 text-lg font-medium">Snap a photo of any question from your book for a step-by-step AI explanation.</p>
               </div>
               <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-brand-primary text-brand-lightBg px-10 py-5 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-secondary transition-all flex items-center justify-center gap-3"
                  >
                    <i className="fa-solid fa-image"></i> Select Photo
                  </button>
                  <button 
                    onClick={() => onAskAI("Open Camera for Lens", "detailed")}
                    className="bg-brand-secondary dark:bg-brand-lightBg dark:text-brand-primary text-brand-lightBg px-10 py-5 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 border border-brand-sage"
                  >
                    <i className="fa-solid fa-video"></i> Launch Camera
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleVisualDoubt} className="hidden" accept="image/*" />
               </div>
            </div>
         </div>
      </section>

      {/* Subject Intelligence Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-3xl font-black text-brand-primary dark:text-brand-lightBg font-heading tracking-tight">Subject Universe</h2>
           <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest border border-brand-sage px-4 py-1.5 rounded-full">4 Dimensions Active</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { name: 'Physics', icon: 'fa-atom', color: 'text-brand-accent' },
            { name: 'Chemistry', icon: 'fa-flask-vial', color: 'text-brand-accent' },
            { name: 'Biology', icon: 'fa-dna', color: 'text-brand-accent' },
            { name: 'Mathematics', icon: 'fa-calculator', color: 'text-brand-accent' }
          ].map(sub => (
            <button 
              key={sub.name}
              onClick={() => onAskAI(`${sub.name} detailed topic analysis and high-yield chapters`, 'subject_deepdive')}
              className="group bg-white dark:bg-brand-secondary p-10 rounded-[56px] border border-brand-sage/20 dark:border-brand-sage/40 card-shadow text-center hover:-translate-y-2 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className={`w-20 h-20 bg-brand-lightBg dark:bg-brand-primary rounded-3xl flex items-center justify-center ${sub.color} text-3xl mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm border border-brand-sage/20`}>
                <i className={`fa-solid ${sub.icon}`}></i>
              </div>
              <h4 className="font-black text-brand-primary dark:text-brand-lightBg uppercase tracking-tighter text-lg">{sub.name}</h4>
              <p className="text-[10px] font-bold text-brand-muted mt-2 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Enter Dimension</p>
            </button>
          ))}
        </div>
      </section>

      {/* Daily Challenge */}
      <section className="bg-white dark:bg-brand-secondary p-12 rounded-[64px] border-2 border-brand-sage/20 space-y-10 relative overflow-hidden">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-gold rounded-3xl flex items-center justify-center text-brand-primary text-3xl shadow-xl shadow-brand-gold/20">
               <i className="fa-solid fa-puzzle-piece"></i>
            </div>
            <div>
               <h3 className="text-3xl font-black font-heading text-brand-primary dark:text-brand-lightBg">Daily Memory Sadhana</h3>
               <p className="text-[11px] text-brand-muted font-black uppercase tracking-[0.3em]">Freshly Synthesized Question</p>
            </div>
         </div>
         <p className="text-brand-primary dark:text-brand-lightBg/80 font-black text-2xl leading-tight">
           {dailyQuestion}
         </p>
         <button 
            onClick={() => onAskAI(dailyQuestion, 'detailed')}
            className="w-full bg-brand-primary dark:bg-brand-lightBg text-brand-lightBg dark:text-brand-primary py-7 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all"
          >
            Summon Guru for Solution
          </button>
      </section>
    </div>
  );
};

export default Home;
