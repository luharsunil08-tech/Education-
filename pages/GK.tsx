
import React from 'react';

const GK: React.FC = () => {
  const categories = ['Current Affairs', 'Static GK', 'Science', 'Sports'];
  const dailyGK = [
    { id: 1, title: 'ISRO Chandrayaan-4 Update', content: 'India plans to bring back moon samples in 2028 under the next lunar mission.', cat: 'Science', date: 'Oct 24, 2024' },
    { id: 2, title: 'Nobel Prize in Physics 2024', content: 'Awarded for foundational discoveries in artificial neural networks.', cat: 'Current Affairs', date: 'Oct 23, 2024' },
    { id: 3, title: 'New Highway Network', content: 'India expands the Bharatmala Project to connect 50 more cities.', cat: 'Static GK', date: 'Oct 22, 2024' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daily GK News</h2>
          <p className="text-slate-500">Stay updated for competitive exams.</p>
        </div>
        <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
           <i className="fa-solid fa-file-arrow-down"></i> Monthly PDF
        </button>
      </header>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {['All', ...categories].map(c => (
          <button key={c} className={`px-4 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition-colors ${
            c === 'All' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            {c}
          </button>
        ))}
      </div>

      {/* GK Feed */}
      <div className="space-y-4">
        {dailyGK.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                {item.cat}
              </span>
              <span className="text-[10px] text-slate-400">{item.date}</span>
            </div>
            <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{item.content}</p>
            <div className="flex gap-4 pt-2">
               <button className="text-blue-600 text-xs font-bold flex items-center gap-1">
                 <i className="fa-solid fa-share-nodes"></i> Share Card
               </button>
               <button className="text-slate-400 text-xs font-bold flex items-center gap-1">
                 <i className="fa-solid fa-bookmark"></i> Save
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* GK Quiz Promo */}
      <div className="bg-purple-600 rounded-3xl p-6 text-white text-center space-y-3 shadow-xl shadow-purple-200">
        <h3 className="text-xl font-bold">Ready for GK Quiz?</h3>
        <p className="text-purple-100 text-sm">Test your knowledge with 10 quick questions from today's news.</p>
        <button className="bg-white text-purple-600 px-8 py-3 rounded-2xl font-bold shadow-lg">
          Start Quiz Now
        </button>
      </div>
    </div>
  );
};

export default GK;
