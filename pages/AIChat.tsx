
import React, { useState, useRef, useEffect } from 'react';
import { solveDoubt, speakText, TeachingMode } from '../services/geminiService';
import ChanakyaLive from '../components/ChanakyaLive';
import { Bookmark } from '../types.ts';

interface Message {
  role: 'user' | 'model';
  text: string;
  isBookmarked?: boolean;
  media?: { url: string; mimeType: string };
  originalQuery?: string;
}

interface AIChatProps {
  pendingDoubt: { query: string, mode: string } | null;
  clearPendingDoubt: () => void;
  examLevel: string;
  onBookmark: (b: Bookmark) => void;
}

const AIChat: React.FC<AIChatProps> = ({ pendingDoubt, clearPendingDoubt, examLevel, onBookmark }) => {
  const [input, setInput] = useState('');
  const [showLive, setShowLive] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<number | null>(null);
  const [preferredVoice, setPreferredVoice] = useState<'Kore' | 'Puck'>('Kore');
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('detailed');
  const [isListening, setIsListening] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ file: File; base64: string; preview: string } | null>(null);
  const [bookmarkingMessage, setBookmarkingMessage] = useState<{ query: string, response: string } | null>(null);
  const [bookmarkCategory, setBookmarkCategory] = useState('General');
  const [bookmarkTags, setBookmarkTags] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Namaste! I am Chanakya, your Academic Strategist. Taiyari shuru kare? I'm set for your ${examLevel} targets.` }
  ]);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pendingDoubt) {
      handleSend(pendingDoubt.query, pendingDoubt.mode as any);
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
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
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

  const handleSend = async (overrideMsg?: string, modeOverride?: TeachingMode) => {
    const userMsg = overrideMsg || input.trim();
    if (!userMsg && !selectedMedia && !loading) return;
    
    if (!overrideMsg) setInput('');
    
    const mediaToUpload = selectedMedia ? { 
      data: selectedMedia.base64, 
      mimeType: selectedMedia.file.type 
    } : undefined;

    const messageWithMedia: Message = { 
      role: 'user', 
      text: userMsg || (selectedMedia ? "Analyzed image/video" : ""),
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
        userMsg || "Explain this media.", 
        history, 
        modeOverride || teachingMode, 
        examLevel, 
        mediaToUpload
      ) || "Beta, try again. Technical gltich.";
      
      setMessages(prev => [...prev, { role: 'model', text: response, originalQuery: userMsg || "Multimodal" }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Technical issue. Let's try again!" }]);
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

  const initiateBookmark = (msg: Message) => {
    setBookmarkingMessage({ query: msg.originalQuery || "Inquiry", response: msg.text });
  };

  const saveBookmark = () => {
    if (bookmarkingMessage) {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        query: bookmarkingMessage.query,
        response: bookmarkingMessage.response,
        category: bookmarkCategory,
        tags: bookmarkTags.split(',').map(t => t.trim()).filter(t => t !== ''),
        date: new Date().toLocaleDateString('en-IN')
      };
      onBookmark(newBookmark);
      setBookmarkingMessage(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {showLive && <ChanakyaLive onClose={() => setShowLive(false)} />}
      
      {/* Tool Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                 <i className="fa-solid fa-brain"></i>
               </div>
               <div>
                 <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">AI Guru Terminal</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase">{examLevel} Mode</p>
               </div>
             </div>
             <button onClick={() => setShowLive(true)} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg">Live Call</button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'detailed', label: 'Detailed', icon: 'fa-book' },
              { id: 'short', label: 'Mentor', icon: 'fa-bolt' },
              { id: 'example', label: 'Analogy', icon: 'fa-lightbulb' },
              { id: 'neet', label: 'NEET Plan', icon: 'fa-stethoscope' },
              { id: 'jee', label: 'JEE Plan', icon: 'fa-microchip' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setTeachingMode(m.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${teachingMode === m.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
              >
                <i className={`fa-solid ${m.icon}`}></i> {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-[24px] px-6 py-4 relative shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
              <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                {msg.text}
              </div>
              {msg.role === 'model' && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <button onClick={() => handleSpeak(msg.text, idx)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSpeakingId === idx ? 'bg-rose-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                    <i className={`fa-solid ${isSpeakingId === idx ? 'fa-volume-high' : 'fa-volume-low'}`}></i>
                  </button>
                  <button onClick={() => initiateBookmark(msg)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600">Save Wisdom</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Chanakya Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center">
            <i className="fa-solid fa-paperclip"></i>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Master ${examLevel} topics now...`}
            className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold dark:text-white"
          />
          <button onClick={() => handleSend()} disabled={loading} className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>

      {/* Bookmark Modal */}
      {bookmarkingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl">
              <h3 className="text-xl font-black font-heading mb-6">Knowledge Vault</h3>
              <div className="space-y-4">
                <input type="text" value={bookmarkCategory} onChange={e => setBookmarkCategory(e.target.value)} placeholder="Category (e.g. NEET Biology)" className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-xl text-sm font-bold" />
                <input type="text" value={bookmarkTags} onChange={e => setBookmarkTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-xl text-sm font-bold" />
                <div className="flex gap-4">
                  <button onClick={() => setBookmarkingMessage(null)} className="flex-1 py-4 text-slate-400 font-bold">Cancel</button>
                  <button onClick={saveBookmark} className="flex-1 bg-indigo-600 text-white rounded-xl font-bold">Save</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
