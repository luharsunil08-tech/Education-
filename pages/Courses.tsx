
import React, { useState, useEffect } from 'react';
import { generateCourseSyllabus } from '../services/geminiService';

interface CoursesProps {
  examLevel: string;
  onSelectCourse: (course: any) => void;
}

const Courses: React.FC<CoursesProps> = ({ examLevel, onSelectCourse }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [loadStage, setLoadStage] = useState(0);
  const [subStage, setSubStage] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stages = [
    { title: "PHASE 1: RESEARCH", sub: ["Scanning NTA Archives...", "Gathering Academic Context...", "Consulting Guru Library..."] },
    { title: "PHASE 2: ARCHITECTURE", sub: ["Defining Mastery Levels...", "Linking Prerequisite Concepts...", "Building Smart Path..."] },
    { title: "FINALIZING", sub: ["Injecting Guru Mantra...", "Polishing Visual Flow...", "Activating Study Mode..."] }
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
        const currentSub = stages[Math.min(loadStage, stages.length - 1)].sub;
        setSubStage(currentSub[Math.floor(Math.random() * currentSub.length)]);
      }, 3000);
    } else {
      setLoadStage(0);
      setSubStage('');
    }
    return () => clearInterval(interval);
  }, [loading, loadStage]);

  const coursePaths = [
    { id: 'primary-math', title: 'Foundational Maths', level: 'Class 1-5', icon: 'fa-cubes', color: 'bg-orange-400' },
    { id: 'neet-bio', title: 'NEET Biology Mastery', level: 'NEET', icon: 'fa-dna', color: 'bg-emerald-500' },
    { id: 'jee-phys', title: 'JEE Physics Advance', level: 'JEE', icon: 'fa-atom', color: 'bg-blue-500' },
    { id: 'upsc-ethics', title: 'UPSC Ethics & Integrity', level: 'UPSC', icon: 'fa-scale-balanced', color: 'bg-brand-primary' },
    { id: 'grad-stats', title: 'Advanced Statistics', level: 'Graduation', icon: 'fa-chart-line', color: 'bg-purple-600' },
    { id: 'pg-research', title: 'Research Methodology', level: 'Post-Graduation', icon: 'fa-microscope', color: 'bg-rose-600' }
  ];

  const handleStartCourse = async (path: any) => {
    setErrorMsg(null);
    setLoading(path.id);
    setSubStage(stages[0].sub[0]);
    
    const result = await generateCourseSyllabus(path.title, path.level);
    
    if (result.data) {
      onSelectCourse({ ...result.data, ...path });
    } else {
      handleError(result.error);
    }
    setLoading(null);
  };

  const handleGenerateCustom = async () => {
    if (!customSubject.trim()) return;
    setErrorMsg(null);
    setLoading('custom');
    setSubStage(stages[0].sub[0]);
    
    const result = await generateCourseSyllabus(customSubject, examLevel);
    
    if (result.data) {
      onSelectCourse({ ...result.data, id: 'custom', title: customSubject, level: examLevel, icon: 'fa-wand-magic-sparkles', color: 'bg-brand-primary' });
    } else {
      handleError(result.error);
    }
    setLoading(null);
  };

  const handleError = (msg: string | undefined) => {
    const error = msg || "Chanakya is currently busy. Please check your connection or API key and try again.";
    setErrorMsg(error);
  };

  const openKeySelector = () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      (window as any).aistudio.openSelectKey();
      setErrorMsg(null);
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      {/* 2-Phase Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-brand-darkBg/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center text-white">
          <div className="relative mb-16">
            <div className="w-40 h-40 border-8 border-brand-accent/10 rounded-full animate-ping absolute inset-0"></div>
            <div className="w-40 h-40 border-t-4 border-l-4 border-brand-accent rounded-full animate-spin flex items-center justify-center">
               <div className="w-32 h-32 bg-brand-primary rounded-full flex items-center justify-center">
                 <i className="fa-solid fa-brain text-5xl text-brand-accent animate-bounce"></i>
               </div>
            </div>
          </div>
          
          <div className="space-y-6 max-w-lg">
            <div className="flex justify-center gap-3">
              {stages.map((s, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-1000 ${i <= loadStage ? 'w-24 bg-brand-accent' : 'w-12 bg-white/10'}`}></div>
              ))}
            </div>
            <h3 className="text-4xl font-black font-heading tracking-tight leading-none uppercase">{stages[loadStage].title}</h3>
            <div className="bg-brand-secondary/50 border border-brand-sage px-8 py-4 rounded-3xl">
              <p className="text-brand-accent font-black uppercase tracking-[0.2em] text-[10px] mb-1">AI Research Node Active:</p>
              <p className="text-brand-lightBg font-bold text-lg animate-pulse">{subStage}</p>
            </div>
            <p className="text-brand-muted font-medium">Chanakya is architecting a path that matches your exact academic level.</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMsg && (
        <div className="fixed inset-0 bg-brand-darkBg/90 backdrop-blur-md z-[110] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-brand-secondary rounded-[48px] p-10 max-w-lg w-full border border-brand-accent/30 shadow-2xl space-y-8 animate-in zoom-in-95">
             <div className="flex items-center gap-4 text-brand-accent">
               <div className="w-16 h-16 bg-brand-lightBg dark:bg-brand-primary rounded-2xl flex items-center justify-center text-3xl">
                 <i className="fa-solid fa-circle-exclamation"></i>
               </div>
               <div>
                 <h3 className="text-2xl font-black font-heading tracking-tighter uppercase text-brand-primary dark:text-brand-lightBg">Chanakya is Busy</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Internal Meditation Mode</p>
               </div>
             </div>
             
             <div className="bg-brand-lightBg dark:bg-brand-darkBg/50 p-6 rounded-3xl border border-brand-sage/20">
               <p className="text-sm font-bold text-brand-text dark:text-brand-lightBg/80 leading-relaxed">
                 {errorMsg}
               </p>
             </div>

             <div className="flex flex-col gap-3">
                <button 
                  onClick={openKeySelector}
                  className="w-full bg-brand-primary text-brand-lightBg py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:opacity-90"
                >
                  <i className="fa-solid fa-key"></i> Setup API Key
                </button>
                <button 
                  onClick={() => setErrorMsg(null)}
                  className="w-full bg-brand-lightBg dark:bg-brand-primary/20 text-brand-primary dark:text-brand-lightBg py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-colors"
                >
                  Dismiss
                </button>
             </div>
          </div>
        </div>
      )}

      <header className="space-y-2">
        <h2 className="text-4xl font-black text-brand-primary dark:text-brand-lightBg font-heading tracking-tight leading-none uppercase">Guru's Path: Universal Catalog</h2>
        <p className="text-brand-muted dark:text-brand-accent/60 font-medium text-lg italic">From Class 1 to Post-Graduation, pick your path.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {coursePaths.map((path) => (
          <div 
            key={path.id} 
            className="group bg-white dark:bg-brand-secondary p-8 rounded-[56px] border border-brand-sage/10 dark:border-brand-sage/30 card-shadow hover:-translate-y-2 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-brand-accent/10 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>
            <div className="space-y-6 relative z-10">
              <div className={`${path.color} w-20 h-20 rounded-[32px] flex items-center justify-center text-white text-3xl shadow-xl transition-transform group-hover:rotate-12`}>
                <i className={`fa-solid ${path.icon}`}></i>
              </div>
              <div>
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">{path.level}</span>
                <h3 className="text-3xl font-black text-brand-primary dark:text-brand-lightBg leading-tight mt-1">{path.title}</h3>
                <p className="text-sm text-brand-muted mt-2 font-medium line-clamp-2">Complete academic curriculum synthesized from global research papers and textbooks.</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleStartCourse(path)}
              className="mt-10 w-full bg-brand-primary text-brand-lightBg py-6 rounded-[32px] font-black text-xs uppercase tracking-widest group-hover:bg-brand-accent group-hover:text-brand-primary transition-all shadow-xl active:scale-95"
            >
              Start Sadhana
            </button>
          </div>
        ))}
      </div>

      <section className="bg-brand-primary rounded-[64px] p-12 text-white relative overflow-hidden shadow-2xl border border-brand-sage">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <i className="fa-solid fa-wand-magic-sparkles text-[200px]"></i>
        </div>
        <div className="relative z-10 max-w-2xl space-y-8">
           <h3 className="text-4xl font-black font-heading tracking-tight leading-none text-brand-accent uppercase">Create Any Course</h3>
           <p className="text-brand-accent/70 font-medium text-xl leading-relaxed">Specify a topic and your level (e.g. "Quantum Physics for MSc"). Chanakya will generate a specialized mastery track.</p>
           <div className="flex flex-col sm:flex-row gap-4">
             <input 
               type="text" 
               value={customSubject}
               onChange={e => setCustomSubject(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleGenerateCustom()}
               placeholder="Topic & Level (e.g. Ethics for UPSC)" 
               className="flex-1 bg-brand-secondary/50 border border-brand-sage/30 rounded-[32px] px-8 py-5 outline-none focus:ring-4 focus:ring-brand-accent/50 text-base font-bold placeholder:text-brand-accent/30 text-white" 
             />
             <button 
              onClick={handleGenerateCustom}
              className="bg-brand-accent text-brand-primary px-10 py-5 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-lightBg transition-colors"
             >
               Synthesize
             </button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
