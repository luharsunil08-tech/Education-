
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

  const stages = [
    { title: "PHASE 1: RESEARCH", sub: ["Scanning NTA Archives...", "Gathering NCERT Context...", "Consulting Guru Library..."] },
    { title: "PHASE 2: ARCHITECTURE", sub: ["Defining Mastery Levels...", "Linking Prerequisite Concepts...", "Building Smart Path..."] },
    { title: "FINALIZING", sub: ["Injecting Guru Mantra...", "Polishing Visual Flow...", "Activating Study Mode..."] }
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
        // Randomly pick a sub-stage text
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
    { id: 'neet-bio', title: 'NEET Biology Mastery', level: 'NEET', icon: 'fa-dna', color: 'bg-emerald-500' },
    { id: 'jee-phys', title: 'JEE Physics Advance', level: 'JEE', icon: 'fa-atom', color: 'bg-blue-500' },
    { id: 'upsc-gk', title: 'UPSC Current Affairs', level: 'UPSC', icon: 'fa-landmark', color: 'bg-amber-500' },
    { id: 'maths-pro', title: 'Competitive Maths Pro', level: examLevel, icon: 'fa-calculator', color: 'bg-rose-500' },
    { id: 'chem-fun', title: 'Organic Chemistry Hub', level: 'Boards/JEE', icon: 'fa-vial', color: 'bg-purple-500' },
    { id: 'aptitude', title: 'Logical Aptitude 101', level: 'Govt Exams', icon: 'fa-brain', color: 'bg-indigo-500' }
  ];

  const handleStartCourse = async (path: any) => {
    setLoading(path.id);
    setSubStage(stages[0].sub[0]);
    const syllabus = await generateCourseSyllabus(path.title, path.level);
    if (syllabus) {
      onSelectCourse({ ...syllabus, ...path });
    } else {
      alert("Chanakya is busy. Please try again.");
    }
    setLoading(null);
  };

  const handleGenerateCustom = async () => {
    if (!customSubject.trim()) return;
    setLoading('custom');
    setSubStage(stages[0].sub[0]);
    const syllabus = await generateCourseSyllabus(customSubject, examLevel);
    if (syllabus) {
      onSelectCourse({ ...syllabus, id: 'custom', title: customSubject, level: examLevel, icon: 'fa-wand-magic-sparkles', color: 'bg-indigo-600' });
    } else {
      alert("Custom generation failed. Try a simpler topic.");
    }
    setLoading(null);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      {/* 2-Phase Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center text-white">
          <div className="relative mb-16">
            <div className="w-40 h-40 border-8 border-indigo-500/10 rounded-full animate-ping absolute inset-0"></div>
            <div className="w-40 h-40 border-t-4 border-l-4 border-indigo-500 rounded-full animate-spin flex items-center justify-center">
               <div className="w-32 h-32 bg-indigo-600/20 rounded-full flex items-center justify-center">
                 <i className="fa-solid fa-graduation-cap text-5xl text-indigo-400 animate-bounce"></i>
               </div>
            </div>
          </div>
          
          <div className="space-y-6 max-w-lg">
            <div className="flex justify-center gap-3">
              {stages.map((s, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-1000 ${i <= loadStage ? 'w-24 bg-indigo-500' : 'w-12 bg-white/10'}`}></div>
              ))}
            </div>
            <h3 className="text-4xl font-black font-heading tracking-tight leading-none">{stages[loadStage].title}</h3>
            <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-3xl">
              <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs mb-1">AI Background Work:</p>
              <p className="text-slate-300 font-bold text-lg animate-pulse">{subStage}</p>
            </div>
            <p className="text-slate-500 font-medium">Please wait. Chanakya is generating a unique "Beginner to Pro" course just for you.</p>
          </div>
        </div>
      )}

      <header className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight leading-none">Guru's Path: AI Courses</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Pick a discipline and witness Chanakya build your personalized syllabus in seconds.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {coursePaths.map((path) => (
          <div 
            key={path.id} 
            className="group bg-white dark:bg-slate-900 p-8 rounded-[56px] border border-slate-100 dark:border-slate-800 card-shadow hover:-translate-y-2 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full opacity-20 group-hover:scale-150 transition-transform"></div>
            <div className="space-y-6 relative z-10">
              <div className={`${path.color} w-20 h-20 rounded-[32px] flex items-center justify-center text-white text-3xl shadow-2xl shadow-${path.color.split('-')[1]}-100 dark:shadow-none`}>
                <i className={`fa-solid ${path.icon}`}></i>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{path.level} Special</span>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight mt-1">{path.title}</h3>
                <p className="text-base text-slate-500 mt-2 font-medium">Automatic curriculum with smart pre-caching of lessons.</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleStartCourse(path)}
              className="mt-10 w-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 py-6 rounded-[32px] font-black text-xs uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl active:scale-95"
            >
              Enter Sadhana
            </button>
          </div>
        ))}
      </div>

      <section className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[64px] p-12 text-white relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <i className="fa-solid fa-wand-magic-sparkles text-[200px]"></i>
        </div>
        <div className="relative z-10 max-w-2xl space-y-8">
           <h3 className="text-4xl font-black font-heading tracking-tight leading-none">Custom Universe Builder</h3>
           <p className="text-indigo-200 font-medium text-xl leading-relaxed">Describe any specific learning goal. Chanakya will research the best pedagogical practices and generate your study path.</p>
           <div className="flex flex-col sm:flex-row gap-4">
             <input 
               type="text" 
               value={customSubject}
               onChange={e => setCustomSubject(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleGenerateCustom()}
               placeholder="e.g. History of Space Exploration..." 
               className="flex-1 bg-white/10 border border-white/20 rounded-[32px] px-8 py-5 outline-none focus:ring-4 focus:ring-indigo-500/50 text-base font-bold placeholder:text-indigo-300 text-white" 
             />
             <button 
              onClick={handleGenerateCustom}
              className="bg-indigo-500 text-white px-10 py-5 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-400 transition-colors"
             >
               Create Path
             </button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
