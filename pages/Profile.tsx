
import React from 'react';

const Profile: React.FC = () => {
  const openKeySelector = () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      (window as any).aistudio.openSelectKey();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="w-28 h-28 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center text-5xl border-4 border-white dark:border-slate-800 shadow-xl">
             <i className="fa-solid fa-user-graduate"></i>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800">
            <i className="fa-solid fa-check text-sm"></i>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white font-heading">Scholar Aspirant</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Goal: JEE Advanced 2025</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-2.5 rounded-xl text-xs font-black text-indigo-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
            Edit Stats
          </button>
          <button 
            onClick={openKeySelector}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <i className="fa-solid fa-key mr-2"></i> Setup API Key
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sadhana Points', val: '2,450', color: 'text-indigo-600' },
          { label: 'Global Rank', val: '#420', color: 'text-rose-500' },
          { label: 'Study Hours', val: '128h', color: 'text-amber-500' },
          { label: 'Accuracy', val: '78%', color: 'text-emerald-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 text-center shadow-sm">
             <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
             <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-black font-heading dark:text-white">Badge Vault</h3>
           <span className="text-[10px] font-black text-indigo-600 uppercase">View All</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: 'fa-fire', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10', label: '7 Day Streak' },
            { icon: 'fa-brain', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10', label: 'AI Guru' },
            { icon: 'fa-trophy', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', label: 'Top Scorer' },
            { icon: 'fa-book-open', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', label: 'Syllabus Pro' },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-slate-800 shadow-sm">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${b.bg} ${b.color}`}>
                <i className={`fa-solid ${b.icon}`}></i>
              </div>
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 text-center leading-tight uppercase tracking-tight">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-black font-heading dark:text-white">Subject Mastery</h3>
        <div className="space-y-4">
          {[
            { label: 'Physics', progress: 65, color: 'bg-blue-500' },
            { label: 'Chemistry', progress: 42, color: 'bg-emerald-500' },
            { label: 'Maths', progress: 88, color: 'bg-indigo-600' },
          ].map(p => (
            <div key={p.label} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-xs">{p.label}</span>
                <span className="text-xs text-slate-400 font-black">{p.progress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`${p.color} h-full transition-all duration-700 shadow-lg`} style={{ width: `${p.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[40px] border border-indigo-100 dark:border-indigo-800/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h4 className="font-black text-indigo-900 dark:text-indigo-100">Sync Your Journey</h4>
          <p className="text-xs text-indigo-700/60 dark:text-indigo-400 font-medium">Never lose your mistakes and bookmarks across devices.</p>
        </div>
        <button className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none">Sign In Now</button>
      </div>
    </div>
  );
};

export default Profile;
