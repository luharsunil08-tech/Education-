
import React from 'react';

interface LoginProps {
  onLogin: (name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md space-y-12 flex flex-col items-center">
        
        {/* TOP SECTION: Logo & Tagline */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl shadow-xl shadow-indigo-100 dark:shadow-none mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            BharatEdu
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Free study app for JEE, NEET & all exams
          </p>
        </div>

        {/* MAIN SECTION: CTAs */}
        <div className="w-full space-y-4">
          <button 
            onClick={() => onLogin('Aspirant')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
          >
            Start Studying <i className="fa-solid fa-arrow-right"></i>
          </button>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-center gap-2 text-sm">
              <i className="fa-brands fa-google text-rose-500"></i> Google
            </button>
            <button className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-center gap-2 text-sm">
              <i className="fa-solid fa-mobile-screen-button text-indigo-500"></i> Mobile OTP
            </button>
          </div>
        </div>

        {/* TRUST MESSAGE */}
        <div className="text-center space-y-2">
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 uppercase tracking-widest">
            <i className="fa-solid fa-shield-halved"></i>
            100% Secure • Privacy First
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium max-w-[280px] leading-relaxed mx-auto">
            We don’t sell your data. No spam. No ads during study.
          </p>
        </div>

        {/* FOOTER */}
        <footer className="mt-8">
          <p className="text-slate-400 dark:text-slate-600 text-[10px] font-medium tracking-wide">
            By continuing, you agree to 
            <button className="underline mx-1 hover:text-indigo-500 transition-colors">Privacy Policy</button> 
            & 
            <button className="underline ml-1 hover:text-indigo-500 transition-colors">Terms</button>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
