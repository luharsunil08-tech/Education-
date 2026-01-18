
import React from 'react';

interface MistakesProps {
  mistakes: any[];
  onAskAI: (text: string) => void;
  onClear: () => void;
}

const Mistakes: React.FC<MistakesProps> = ({ mistakes, onAskAI, onClear }) => {
  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Mistake Notebook</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Where your weaknesses become your strengths.</p>
        </div>
        {mistakes.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs font-bold text-rose-500 hover:underline"
          >Clear All</button>
        )}
      </header>

      {mistakes.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300">
            <i className="fa-solid fa-check-double text-3xl"></i>
          </div>
          <p className="text-slate-400 font-medium">Your notebook is empty. Clean sheet!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {mistakes.map((m, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 card-shadow space-y-4">
              <div className="flex gap-4">
                <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm">#{idx + 1}</span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">{m.text}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Last Hint</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{m.explanation.substring(0, 100)}..."</p>
              </div>
              <button 
                onClick={() => onAskAI(m.text)}
                className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 py-3 rounded-xl text-xs font-bold transition-all hover:bg-indigo-600 hover:text-white"
              >
                Explain Concept Again
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mistakes;
