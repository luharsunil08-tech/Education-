
import React, { useState, useRef, useEffect } from 'react';
import { solveDoubt, speakText, TeachingMode } from '../services/geminiService.ts';
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
  pendingDoubt: { query: string, mode: string, media?: { base64: string, preview: string, type: string } } | null;
  clearPendingDoubt: () => void;
  examLevel: string;
  onBookmark: (b: Bookmark) => void;
}

const AIChat: React.FC<AIChatProps> = ({ pendingDoubt, clearPendingDoubt, examLevel, onBookmark }) => {
  const [input, setInput] = useState('');
  const [showLive, setShowLive] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<number | null>(null);
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('detailed');
  const [selectedMedia, setSelectedMedia] = useState<{ file?: File; base64: string; preview: string; type: string } | null>(null);
  const [bookmarkingMessage, setBookmarkingMessage] = useState<{ query: string, response: string } | null>(null);
  const [bookmarkCategory, setBookmarkCategory] = useState('General');
  const [bookmarkTags, setBookmarkTags] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Namaste! I am Chanakya, your Universal Guru. I can help you with anything from Class 1 basics to Ph.D. research, JEE/NEET, and Govt Exams. \n\nHow may I illuminate your path today?` }
  ]);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (pendingDoubt) {
      if (pendingDoubt.media) {
        setSelectedMedia({ base64: pendingDoubt.media.base64, preview: pendingDoubt.media.preview, type: pendingDoubt.media.type });
        handleSend(pendingDoubt.query || "Please analyze this visual query.", pendingDoubt.mode as any);
      } else {
        handleSend(pendingDoubt.query, pendingDoubt.mode as any);
      }
      clearPendingDoubt();
    }
  }, [pendingDoubt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedMedia({ 
        base64: dataUrl.split(',')[1], 
        preview: dataUrl, 
        type: 'image/jpeg' 
      });
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      setIsCameraOpen(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedMedia({ 
          file, 
          base64: (reader.result as string).split(',')[1], 
          preview: URL.createObjectURL(file),
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (overrideMsg?: string, modeOverride?: TeachingMode) => {
    const userMsg = overrideMsg || input.trim();
    if (!userMsg && !selectedMedia && !loading) return;
    
    if (!overrideMsg) setInput('');
    
    const mediaToUpload = selectedMedia ? { 
      data: selectedMedia.base64, 
      mimeType: selectedMedia.type 
    } : undefined;

    const currentMessage: Message = { 
      role: 'user', 
      text: userMsg || "Analyzing visual input...",
      media: selectedMedia ? { url: selectedMedia.preview, mimeType: selectedMedia.type } : undefined,
      originalQuery: userMsg
    };

    const currentHistory = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    setMessages(prev => [...prev, currentMessage]);
    setSelectedMedia(null);
    setLoading(true);

    try {
      const response = await solveDoubt(
        userMsg || "Explain the diagram or question in this image.", 
        currentHistory, 
        modeOverride || teachingMode, 
        examLevel, 
        mediaToUpload
      );
      setMessages(prev => [...prev, { role: 'model', text: response, originalQuery: userMsg }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: "Guru encountered a pedagogical block. Please rephrase or use a clearer photo." }]);
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
    const source = await speakText(text, 'Kore');
    if (source) {
      currentAudioRef.current = source;
      source.onended = () => setIsSpeakingId(null);
    } else {
      setIsSpeakingId(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-64px)] bg-brand-lightBg dark:bg-brand-darkBg overflow-hidden">
      {showLive && <ChanakyaLive onClose={() => setShowLive(false)} />}
      
      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-brand-primary flex flex-col items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-10 flex gap-8 items-center">
            <button onClick={() => {
              const stream = videoRef.current?.srcObject as MediaStream;
              stream?.getTracks().forEach(t => t.stop());
              setIsCameraOpen(false);
            }} className="w-16 h-16 rounded-full bg-white/10 text-brand-lightBg flex items-center justify-center border border-white/20"><i className="fa-solid fa-xmark text-2xl"></i></button>
            <button onClick={capturePhoto} className="w-24 h-24 rounded-full bg-brand-lightBg border-8 border-brand-accent/20 flex items-center justify-center shadow-2xl"><div className="w-16 h-16 rounded-full bg-brand-primary"></div></button>
          </div>
          <div className="absolute top-10 text-brand-lightBg font-black text-xs uppercase tracking-widest bg-brand-primary/40 px-6 py-2 rounded-full border border-brand-sage">Point at your Book</div>
        </div>
      )}

      <div className="bg-white dark:bg-brand-secondary border-b border-brand-sage/30 p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-accent">
                 <i className="fa-solid fa-brain"></i>
               </div>
               <div>
                 <h2 className="text-sm font-black text-brand-primary dark:text-brand-lightBg uppercase tracking-tighter">Universal AI Guru</h2>
                 <p className="text-[10px] text-brand-muted dark:text-brand-accent/60 font-bold uppercase tracking-widest">Active Level: {examLevel}</p>
               </div>
             </div>
             <button onClick={() => setShowLive(true)} className="bg-brand-gold text-brand-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span> Oral Sadhana
             </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'detailed', label: 'Theory Dive', icon: 'fa-book' },
              { id: 'short', label: 'Quick Fact', icon: 'fa-bolt' },
              { id: 'example', label: 'Real Analogies', icon: 'fa-lightbulb' },
              { id: 'neet', label: 'NEET Edge', icon: 'fa-stethoscope' },
              { id: 'jee', label: 'JEE Tactics', icon: 'fa-microchip' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setTeachingMode(m.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${teachingMode === m.id ? 'bg-brand-primary border-brand-primary text-brand-lightBg shadow-md' : 'bg-brand-lightBg dark:bg-brand-primary/20 text-brand-muted border-brand-sage/20'}`}
              >
                <i className={`fa-solid ${m.icon}`}></i> {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-[32px] px-8 py-6 relative shadow-sm ${msg.role === 'user' ? 'bg-brand-secondary text-brand-lightBg rounded-br-none border border-brand-sage/30' : 'bg-white dark:bg-brand-secondary border border-brand-sage/20 dark:border-brand-sage/40 text-brand-text dark:text-brand-lightBg rounded-bl-none'}`}>
              {msg.media && (
                <div className="mb-4 rounded-[24px] overflow-hidden border border-brand-sage/20 shadow-xl">
                    <img src={msg.media.url} alt="Reference" className="w-full h-auto max-h-96 object-contain" />
                </div>
              )}
              <div className="prose dark:prose-invert max-w-none text-base leading-relaxed whitespace-pre-wrap font-medium">
                {msg.text}
              </div>
              {msg.role === 'model' && (
                <div className="flex items-center gap-6 mt-6 pt-6 border-t border-brand-sage/10 dark:border-brand-sage/20">
                  <button onClick={() => handleSpeak(msg.text, idx)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSpeakingId === idx ? 'bg-brand-accent text-brand-primary animate-pulse' : 'bg-brand-lightBg dark:bg-brand-primary/30 text-brand-muted'}`}>
                    <i className={`fa-solid ${isSpeakingId === idx ? 'fa-volume-high' : 'fa-volume-low'}`}></i>
                  </button>
                  <button onClick={() => setBookmarkingMessage({ query: msg.originalQuery || "Universal Query", response: msg.text })} className="text-[10px] font-black text-brand-muted uppercase tracking-widest hover:text-brand-primary">Save to Vault</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-brand-primary text-brand-lightBg px-8 py-5 rounded-[32px] rounded-bl-none flex items-center gap-4 shadow-xl border border-brand-sage/30">
              <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-black uppercase tracking-widest">Guru is Synthesizing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-8 bg-white dark:bg-brand-secondary border-t border-brand-sage/20">
        <div className="max-w-4xl mx-auto space-y-4">
          {selectedMedia && (
            <div className="flex items-center gap-4 p-4 bg-brand-lightBg dark:bg-brand-primary/20 rounded-3xl border border-brand-sage/30 w-fit animate-in zoom-in-95">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg relative group">
                <img src={selectedMedia.preview} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-brand-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <i className="fa-solid fa-eye text-brand-lightBg text-xl animate-pulse"></i>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                 <p className="text-[10px] font-black text-brand-primary dark:text-brand-accent uppercase">Media Locked</p>
                 <button onClick={() => setSelectedMedia(null)} className="text-brand-gold font-bold text-xs flex items-center gap-1 hover:underline">
                   <i className="fa-solid fa-trash-can"></i> Remove
                 </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button onClick={startCamera} className="w-16 h-16 rounded-3xl bg-brand-lightBg dark:bg-brand-primary/40 text-brand-muted hover:bg-brand-primary hover:text-brand-lightBg transition-all flex items-center justify-center shadow-sm border border-brand-sage/10">
                <i className="fa-solid fa-camera text-xl"></i>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-3xl bg-brand-lightBg dark:bg-brand-primary/40 text-brand-muted hover:bg-brand-primary hover:text-brand-lightBg transition-all flex items-center justify-center shadow-sm border border-brand-sage/10">
                <i className="fa-solid fa-paperclip text-xl"></i>
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Ask Guru about ${examLevel}...`}
                className="w-full bg-brand-lightBg dark:bg-brand-darkBg/50 border border-brand-sage/30 dark:border-brand-sage/20 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-brand-accent/20 text-base font-bold dark:text-brand-lightBg"
              />
            </div>
            <button onClick={() => handleSend()} disabled={loading} className="bg-brand-primary text-brand-lightBg w-20 h-16 rounded-3xl flex items-center justify-center hover:bg-brand-secondary transition-all shadow-2xl disabled:opacity-50">
              {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane text-lg"></i>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
