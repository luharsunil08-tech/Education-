
import React, { useState, useRef, useEffect } from 'react';
import { solveDoubt, speakText, TeachingMode } from '../services/geminiService';
import ChanakyaLive from '../components/ChanakyaLive';

interface Message {
  role: 'user' | 'model';
  text: string;
  isBookmarked?: boolean;
  media?: { url: string; mimeType: string };
}

interface AIChatProps {
  pendingDoubt: string | null;
  clearPendingDoubt: () => void;
  examLevel: string;
}

const AIChat: React.FC<AIChatProps> = ({ pendingDoubt, clearPendingDoubt, examLevel }) => {
  const [input, setInput] = useState('');
  const [showLive, setShowLive] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<number | null>(null);
  const [preferredVoice, setPreferredVoice] = useState<'Kore' | 'Puck'>('Kore');
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('detailed');
  const [isListening, setIsListening] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ file: File; base64: string; preview: string } | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Namaste! I am your Guru, Chanakya. I am currently focused on your ${examLevel} journey. How can I enlighten your path today?` }
  ]);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pendingDoubt) {
      handleSend(pendingDoubt);
      clearPendingDoubt();
    }
  }, [pendingDoubt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      const preview = URL.createObjectURL(file);
      setSelectedMedia({ file, base64, preview });
    }
  };

  const handleSend = async (overrideMsg?: string) => {
    const userMsg = overrideMsg || input.trim();
    if (!userMsg && !selectedMedia && !loading) return;
    
    if (!overrideMsg) setInput('');
    
    const mediaToUpload = selectedMedia ? { 
      data: selectedMedia.base64, 
      mimeType: selectedMedia.file.type 
    } : undefined;

    const messageWithMedia: Message = { 
      role: 'user', 
      text: userMsg || (selectedMedia ? "Analyzed media" : ""),
      media: selectedMedia ? { url: selectedMedia.preview, mimeType: selectedMedia.file.type } : undefined
    };

    setMessages(prev => [...prev, messageWithMedia]);
    setSelectedMedia(null);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await solveDoubt(
        userMsg || "Explain the attached media in detail.", 
        history, 
        teachingMode, 
        examLevel, 
        mediaToUpload
      ) || "Beta, my wisdom is flickering. Try again?";
      
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "A technical barrier blocked my path. Let's try once more." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string, id: number) => {
    if (isSpeakingId === id) {
      currentAudioRef.current?.stop();
      setIsSpeakingId(null);
      return;
    }
    currentAudioRef.current?.stop();
    setIsSpeakingId(id);
    const source = await speakText(text, preferredVoice);
    if (source) {
      currentAudioRef.current = source;
      source.onended = () => setIsSpeakingId(null);
    } else {
      setIsSpeakingId(null);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser. Please try Chrome.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const modes: { id: TeachingMode; label: string; icon: string; desc: string }[] = [
    { id: 'detailed', label: 'Guru', icon: 'fa-book-open-reader', desc: 'Full Theory' },
    { id: 'short', label: 'Mentor', icon: 'fa-bolt', desc: 'Concise' },
    { id: 'example', label: 'Sutradhar', icon: 'fa-lightbulb', desc: 'Examples' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-64px)] relative bg-slate-50 dark:bg-slate-950">
      {showLive && <ChanakyaLive onClose={() => setShowLive(false)} />}
      
      {/* Enhanced Tool Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                 <i className="fa-solid fa-feather-pointed"></i>
               </div>
               <div>
                 <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Guru's Approach</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase">{examLevel} Path</p>
               </div>
             </div>
             <button 
              onClick={() => setShowLive(true)}
              className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 dark:shadow-none"
            >
              <i className="fa-solid fa-microphone-lines mr-2"></i> Live Call
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {modes.map(m => (
              <button
                key={m.id}
                onClick={() => setTeachingMode(m.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  teachingMode === m.id 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-200'
                }`}
              >
                <i className={`fa-solid ${m.icon}`}></i>
                <div className="flex flex-col items-start leading-none">
                  <span>{m.label}</span>
                  <span className={`text-[8px] opacity-60 font-medium lowercase tracking-normal`}>{m.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-[24px] px-6 py-4 relative transition-all ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none rounded-br-none' 
                : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm rounded-bl-none'
            }`}>
              {msg.media && (
                <div className="mb-4 rounded-xl overflow-hidden border border-white/20">
                  {msg.media.mimeType.startsWith('image/') ? (
                    <img src={msg.media.url} alt="Shared Doubt" className="max-w-full h-auto" />
                  ) : (
                    <video src={msg.media.url} controls className="max-w-full h-auto" />
                  )}
                </div>
              )}
              <div className="text-sm md:text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                {msg.text}
              </div>
              
              {msg.role === 'model' && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <button 
                    onClick={() => handleSpeak(msg.text, idx)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isSpeakingId === idx 
                        ? 'bg-rose-500 text-white shadow-lg' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    <i className={`fa-solid ${isSpeakingId === idx ? 'fa-volume-high' : 'fa-volume-low'}`}></i>
                  </button>
                  <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                    <i className="fa-regular fa-bookmark mr-1.5"></i> Save
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Guru is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto space-y-4">
          {selectedMedia && (
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 relative animate-in fade-in slide-in-from-bottom-2">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900">
                {selectedMedia.file.type.startsWith('image/') ? (
                  <img src={selectedMedia.preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                    <i className="fa-solid fa-video"></i>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{selectedMedia.file.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black">Ready to upload</p>
              </div>
              <button 
                onClick={() => setSelectedMedia(null)}
                className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-paperclip"></i>
              </button>
              <button 
                onClick={startVoiceInput}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <i className={`fa-solid ${isListening ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,video/*"
            />

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Ask your Guru about ${examLevel}...`}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold dark:text-white"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
