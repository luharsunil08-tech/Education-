
import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-xl">
           <i className="fa-solid fa-user-graduate"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Aspirant Kumar</h2>
          <p className="text-slate-500 font-medium">Target Exam: JEE Main 2025</p>
        </div>
        <button className="bg-white border border-slate-200 px-6 py-2 rounded-xl text-sm font-bold text-blue-600">
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 text-center shadow-sm">
           <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Points</p>
           <p className="text-2xl font-bold text-slate-800">2,450</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 text-center shadow-sm">
           <p className="text-slate-400 text-xs font-bold uppercase mb-1">Global Rank</p>
           <p className="text-2xl font-bold text-slate-800">#420</p>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">My Badges</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: 'fa-fire', color: 'text-orange-500', bg: 'bg-orange-50', label: '7 Day Streak' },
            { icon: 'fa-brain', color: 'text-purple-500', bg: 'bg-purple-50', label: 'AI Guru' },
            { icon: 'fa-trophy', color: 'text-amber-500', bg: 'bg-amber-50', label: 'Top Scorer' },
            { icon: 'fa-lock', color: 'text-slate-300', bg: 'bg-slate-50', label: '???' },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${b.bg} ${b.color}`}>
                <i className={`fa-solid ${b.icon}`}></i>
              </div>
              <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Recent Progress</h3>
        <div className="space-y-3">
          {[
            { label: 'Physics', progress: 65, color: 'bg-blue-500' },
            { label: 'Chemistry', progress: 42, color: 'bg-green-500' },
            { label: 'Maths', progress: 88, color: 'bg-indigo-500' },
          ].map(p => (
            <div key={p.label} className="bg-white p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-700">{p.label}</span>
                <span className="text-xs text-slate-500 font-bold">{p.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`${p.color} h-full transition-all duration-500`} style={{ width: `${p.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center justify-between">
        <span className="text-sm text-red-700 font-medium">Want to sync across devices?</span>
        <button className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Sign In</button>
      </div>
    </div>
  );
};

export default Profile;
