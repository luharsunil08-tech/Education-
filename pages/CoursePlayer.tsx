
import React, { useState, useEffect, useRef } from 'react';
import { generateLessonContent } from '../services/geminiService';

interface CoursePlayerProps {
  course: any;
  onBack: () => void;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack }) => {
  const [activeModule, setActiveModule] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreCaching, setIsPreCaching] = useState(false);
  const [showQuickDoubt, setShowQuickDoubt] = useState(false);
  
  // Cache for lesson materials to make switching instant
  const contentCache = useRef<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (course.tiers?.[0]?.modules?.[0]) {
      handleSelectLesson(course.tiers[0].modules[0]);
    }
  }, [course]);

  const handleSelectLesson = async (module: any) => {
    setActiveModule(module);
    
    if (contentCache.current[module.name]) {
      setLessonContent(contentCache.current[module.name]);
      triggerPreCacheNext(module);
      return;
    }

    setIsLoading(true);
    setLessonContent(null);
    const content = await generateLessonContent(module.name, course.courseTitle, course.level);
    contentCache.current[module.name] = content;
    setLessonContent(content);
    setIsLoading(false);

    // Trigger background work for the next module
    triggerPreCacheNext(module);
  };

  const triggerPreCacheNext = async (currentMod: any) => {
    const allModules = course.tiers.flatMap((t: any) => t.modules);
    const currentIndex = allModules.findIndex((m: any) => m.name === currentMod.name);
    const nextMod = allModules[currentIndex + 1];

    if (nextMod && !contentCache.current[nextMod.name]) {
      setIsPreCaching(true);
      const nextContent = await generateLessonContent(nextMod.name, course.courseTitle, course.level);
      contentCache.current[nextMod.name] = nextContent;
      setIsPreCaching(false);
    }
  };

  const handleNextLesson = () => {
    const allModules = course.tiers.flatMap((t: any) => t.modules);
    const currentIndex = allModules.findIndex((m: any) => m.name === activeModule?.name);
    const nextMod = allModules[currentIndex + 1];
    if (nextMod) handleSelectLesson(nextMod);
  };

  const handleLensUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would pass to the AIChat or handle directly
    alert("Chanakya Lens Activated: Switching to Doubt Arena...");
    window.location.href = "/?tab=chat&action=lens"; // Simple mock redirect logic
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar: Smart Syllabus */}
      <aside className="w-full md:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto no-scrollbar flex flex-col">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
           <button onClick={onBack} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mb-6 block">
             <i className="fa-solid fa-arrow-left mr-2"></i> Back to Catalog
           </button>
           <h2 className="text-2xl font-black text-slate-800 dark:text-white font-heading leading-tight">{course.courseTitle}</h2>
           <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-1/4"></div>
              </div>
              <span className="text-[10px] font-black text-indigo-600 uppercase">25% Done</span>
           </div>
        </div>
        
        <div className="flex-1 p-8 space-y-10">
           {course.tiers.map((tier: any, ti: number) => (
             <div key={ti} className="space-y-4">
               <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{tier.title}</h4>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase">{tier.level}</span>
                 </div>
               </div>
               <div className="space-y-3">
                 {tier.modules.map((mod: any, mi: number) => {
                   const isCached = !!contentCache.current[mod.name];
                   return (
                     <button 
                      key={mi}
                      onClick={() => handleSelectLesson(mod)}
                      className={`w-full text-left p-5 rounded-[28px] border transition-all relative overflow-hidden group ${activeModule?.name === mod.name ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}
                     >
                       <div className="flex justify-between items-start relative z-10">
                         <div className="flex-1 pr-4">
                           <p className="text-sm font-black leading-tight mb-1">{mod.name}</p>
                           <p className={`text-[10px] font-medium opacity-60 italic line-clamp-1`}>{mod.objective}</p>
                         </div>
                         {isCached && activeModule?.name !== mod.name && (
                           <i className="fa-solid fa-bolt-lightning text-amber-500 text-xs mt-1 animate-pulse"></i>
                         )}
                       </div>
                     </button>
                   );
                 })}
               </div>
             </div>
           ))}
        </div>

        {isPreCaching && (
          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 border-t border-indigo-100 dark:border-indigo-800/20 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white animate-spin">
              <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Pre-Caching Wisdom</p>
              <p className="text-[9px] text-indigo-400 font-bold">Chanakya is auto-generating next lesson...</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Study Arena */}
      <main className="flex-1 overflow-y-auto p-8 md:p-16 space-y-12 bg-white dark:bg-slate-900 relative no-scrollbar">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-10 text-center">
             <div className="relative">
               <div className="w-32 h-32 border-[12px] border-indigo-100 dark:border-slate-800 rounded-full absolute inset-0"></div>
               <div className="w-32 h-32 border-t-[12px] border-indigo-600 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fa-solid fa-brain text-4xl text-indigo-600"></i>
               </div>
             </div>
             <div className="space-y-4">
                <h3 className="text-3xl font-black font-heading dark:text-white uppercase tracking-tighter">Synthesizing Course Data</h3>
                <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto">Chanakya is crafting the perfect explanation for you...</p>
             </div>
          </div>
        ) : lessonContent ? (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
             <header className="space-y-6 relative">
                <div className="flex items-center gap-4">
                  <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/30">{activeModule?.objective}</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                </div>
                <h1 className="text-5xl font-black text-slate-800 dark:text-white font-heading leading-none tracking-tight">{activeModule?.name}</h1>
                <div className="flex gap-6">
                  <button className="flex items-center gap-3 text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center"><i className="fa-solid fa-volume-high"></i></div>
                    Read Mastery Aloud
                  </button>
                  <button className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center"><i className="fa-solid fa-bookmark"></i></div>
                    Add to Personal Vault
                  </button>
                </div>
             </header>

             <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-medium leading-[1.8] study-content">
                <div className="whitespace-pre-wrap">{lessonContent}</div>
             </div>

             <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800/50 dark:to-slate-900 p-12 rounded-[56px] border border-indigo-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-10 shadow-sm relative overflow-hidden group">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full group-hover:scale-125 transition-transform"></div>
                <div className="relative z-10 text-center md:text-left">
                   <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Ready to Advance?</h4>
                   <p className="text-lg text-slate-500 font-medium">Chanakya has already pre-cached your next module.</p>
                </div>
                <button 
                  onClick={handleNextLesson}
                  className="w-full md:w-auto bg-indigo-600 text-white px-12 py-6 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all relative z-10"
                >
                  Next Module <i className="fa-solid fa-arrow-right ml-3"></i>
                </button>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
             <i className="fa-solid fa-scroll text-9xl mb-8 opacity-20"></i>
             <p className="font-black uppercase tracking-[0.3em] text-sm">Select a Module to begin your Sadhana</p>
          </div>
        )}
      </main>

      {/* Floating Action Wisdom Assistant */}
      <div className="fixed bottom-24 right-8 flex flex-col items-end gap-4 z-50">
         {showQuickDoubt && (
           <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl w-72 space-y-4 animate-in slide-in-from-bottom-4 zoom-in-95">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                 <div className="w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center"><i className="fa-solid fa-bolt"></i></div>
                 <h4 className="text-xs font-black uppercase tracking-widest dark:text-white">Quick Doubt</h4>
              </div>
              <p className="text-[10px] text-slate-500 font-medium italic">Confused about this lesson? Snap a photo of your doubt.</p>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => fileInputRef.current?.click()} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-200">
                    <i className="fa-solid fa-camera text-rose-500"></i>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Lens</span>
                 </button>
                 <button className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-transparent hover:border-indigo-200">
                    <i className="fa-solid fa-microphone text-indigo-500"></i>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Voice</span>
                 </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLensUpload} />
           </div>
         )}
         <button 
           onClick={() => setShowQuickDoubt(!showQuickDoubt)}
           className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all active:scale-95 ${showQuickDoubt ? 'bg-rose-600 rotate-45 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'}`}
         >
           <i className={`fa-solid ${showQuickDoubt ? 'fa-plus' : 'fa-comment-dots'} text-2xl`}></i>
         </button>
      </div>
    </div>
  );
};

export default CoursePlayer;
