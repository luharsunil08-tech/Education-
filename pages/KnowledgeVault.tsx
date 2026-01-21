
import React, { useState } from 'react';
import { Bookmark } from '../types.ts';

interface KnowledgeVaultProps {
  mistakes: any[];
  bookmarks: Bookmark[];
  onAskAI: (text: string) => void;
  onClearMistakes: () => void;
  onRemoveBookmark: (id: string) => void;
}

const KnowledgeVault: React.FC<KnowledgeVaultProps> = ({ mistakes, bookmarks, onAskAI, onClearMistakes, onRemoveBookmark }) => {
  const [activeTab, setActiveTab] = useState<'mistakes' | 'bookmarks'>('bookmarks');
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(bookmarks.map(b => b.category)))];

  const filteredBookmarks = filterCategory === 'All' 
    ? bookmarks 
    : bookmarks.filter(b => b.category === filterCategory);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-heading tracking-tight leading-none">Knowledge Vault</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Your personal repository of curated wisdom and identified gaps.</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('bookmarks')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'bookmarks' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >Saved Wisdom</button>
          <button 
            onClick={() => setActiveTab('mistakes')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mistakes' ? 'bg-white dark:bg-slate-800 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >Mistake Journal</button>
        </div>
      </header>

      {activeTab === 'bookmarks' ? (
        <div className="space-y-8">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filterCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredBookmarks.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300">
                <i className="fa-regular fa-bookmark text-3xl"></i>
              </div>
              <p className="text-slate-400 font-medium max-w-xs">No wisdom saved yet beta. Bookmark important AI explanations to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBookmarks.map(b => (
                <div key={b.id} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 card-shadow space-y-6 relative group overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                     <i className="fa-solid fa-feather text-8xl"></i>
                   </div>
                   <div className="flex justify-between items-start relative z-10">
                     <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-lg uppercase tracking-[0.2em]">{b.category}</span>
                     <span className="text-[10px] text-slate-400 font-bold">{b.date}</span>
                   </div>
                   <div className="space-y-4 relative z-10">
                     <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">Q: {b.query}</h3>
                     <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic line-clamp-6">"{b.response}"</p>
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-2 relative z-10">
                     {b.tags.map(tag => (
                       <span key={tag} className="text-[9px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">#{tag}</span>
                     ))}
                   </div>
                   <div className="flex gap-4 pt-6 border-t border-slate-50 dark:border-slate-800 relative z-10">
                      <button 
                        onClick={() => onAskAI(b.query)}
                        className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all"
                      >Revisit Concept</button>
                      <button 
                        onClick={() => onRemoveBookmark(b.id)}
                        className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 transition-all flex items-center justify-center border border-slate-100 dark:border-slate-800"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white font-heading">Identified Learning Gaps</h3>
            {mistakes.length > 0 && (
              <button 
                onClick={onClearMistakes}
                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
              >Clear All Gaps</button>
            )}
          </div>

          {mistakes.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500">
                <i className="fa-solid fa-shield-heart text-3xl"></i>
              </div>
              <p className="text-slate-400 font-medium">No learning gaps detected yet! You are doing great beta.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mistakes.map((m, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 card-shadow space-y-6">
                  <div className="flex gap-4">
                    <span className="text-rose-500 font-black text-lg">#{idx + 1}</span>
                    <p className="text-lg text-slate-800 dark:text-slate-200 font-bold leading-tight">{m.text}</p>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Chanakya's Hint</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{m.explanation.substring(0, 150)}..."</p>
                  </div>
                  <button 
                    onClick={() => onAskAI(m.text)}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:scale-[1.02]"
                  >
                    Challenge this Weakness
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeVault;
