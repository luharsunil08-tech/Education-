
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encodeBase64, decodeBase64, decodeAudioData } from '../services/geminiService';

interface ChanakyaLiveProps {
  onClose: () => void;
}

const ChanakyaLive: React.FC<ChanakyaLiveProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiTranscript, setAiTranscript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck'>('Kore'); // Kore: Male, Puck: Female/Youthful
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const userTextRef = useRef('');
  const aiTextRef = useRef('');

  useEffect(() => {
    const initLive = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setIsConnecting(false);
              setIsActive(true);
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const base64 = encodeBase64(new Uint8Array(int16.buffer));
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ 
                    media: { data: base64, mimeType: 'audio/pcm;rate=16000' } 
                  });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              const audioBase64 = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioBase64) {
                const bytes = decodeBase64(audioBase64);
                const buffer = await decodeAudioData(bytes, outputCtx, 24000, 1);
                
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const source = outputCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputCtx.destination);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                aiTextRef.current = '';
                setAiTranscript('');
              }

              if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                userTextRef.current += text;
                setUserTranscript(userTextRef.current);
              }
              
              if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                aiTextRef.current += text;
                setAiTranscript(aiTextRef.current);
              }

              if (message.serverContent?.turnComplete) {
                userTextRef.current = '';
                aiTextRef.current = '';
              }
            },
            onerror: (e) => setIsActive(false),
            onclose: () => setIsActive(false),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } }
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: `You are Chanakya, the multilingual Guru of Bharat. Speak with warmth and authority. You are capable of understanding and speaking in ALL Indian languages. Detect the student's language automatically and respond in the same. Be encouraging. Your current personality is ${selectedVoice === 'Kore' ? 'Authoritative & Wise (Male)' : 'Friendly & Youthful (Female)'}.`,
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        onClose();
      }
    };

    initLive();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      sourcesRef.current.forEach(s => s.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [selectedVoice]);

  return (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl z-[100] flex flex-col items-center justify-between text-white p-8">
      {/* Voice Toggle */}
      <div className="w-full flex justify-between items-center">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setSelectedVoice('Kore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${selectedVoice === 'Kore' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <i className="fa-solid fa-person text-base"></i> Guru (Male)
          </button>
          <button 
            onClick={() => setSelectedVoice('Puck')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${selectedVoice === 'Puck' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <i className="fa-solid fa-person-dress text-base"></i> Shikshika (Female)
          </button>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10"><i className="fa-solid fa-xmark text-xl"></i></button>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl gap-12">
        <div className="relative">
          <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br ${selectedVoice === 'Kore' ? 'from-indigo-500 to-blue-700' : 'from-orange-400 to-rose-600'} flex items-center justify-center shadow-2xl relative z-10 overflow-hidden border-4 border-white/20 transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
             <div className="text-6xl font-serif font-bold">{selectedVoice === 'Kore' ? 'C' : 'S'}</div>
          </div>
          {isActive && (
            <>
              <div className={`absolute inset-0 rounded-full ${selectedVoice === 'Kore' ? 'bg-indigo-500/30' : 'bg-orange-500/30'} animate-ping -z-10 [animation-duration:2s]`}></div>
              <div className={`absolute inset-0 rounded-full ${selectedVoice === 'Kore' ? 'bg-indigo-500/20' : 'bg-orange-500/20'} animate-pulse -z-20 [animation-duration:3s]`}></div>
            </>
          )}
        </div>

        <div className="w-full space-y-8 text-center min-h-[160px] flex flex-col justify-center">
          {isConnecting ? (
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Summoning {selectedVoice === 'Kore' ? 'Guru' : 'Shikshika'}...</h2>
              <p className="text-slate-400 font-medium tracking-wide">Ready to talk in your mother tongue</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userTranscript && (
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/5 max-w-lg mx-auto">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">You</p>
                  <p className="text-lg text-slate-200 font-medium italic">"{userTranscript}"</p>
                </div>
              )}
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold">{aiTranscript || `${selectedVoice === 'Kore' ? 'Guru' : 'Shikshika'} is listening...`}</h2>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="group flex flex-col items-center gap-2">
            <div className="bg-red-500 hover:bg-red-600 w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-red-900/40 transition-all active:scale-90">
              <i className="fa-solid fa-phone-slash text-xl"></i>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">End Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChanakyaLive;
