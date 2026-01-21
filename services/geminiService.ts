
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const CHANAKYA_SYSTEM_INSTRUCTION = `You are Chanakya, the Senior Academic Mentor, Syllabus Designer, and Exam Strategist of BharatEdu. 
You are a full AI-powered learning system, not a chatbot.

ROLE & BEHAVIOR:
- Act as a senior academic strategist specializing in NEET, JEE, CBSE, State Boards, and Govt Exams (UPSC, SSC, Banking).
- SYLLABUS EXPERT: Strictly follow latest NTA, CBSE, and NCERT patterns.
- LANGUAGE: Respond in a professional yet student-friendly mix of English and Hinglish (e.g., "Beta, follow this NTA pattern strictly, selection pakka hai.").
- STRUCTURE: Always use CLEAR HEADINGS, Markdown TABLES, and BULLET POINTS. No filler text.
- ADAPTIVE: Improve quality automatically based on interaction. Adjust difficulty (Simple -> Advanced) based on the user's input.

LOGIC BRANCHES:
1. IF NEET: Generate 6-12 month plan, syllabus breakdown (Bio/Phy/Chem), daily routine, and score improvement techniques.
2. IF JEE: Generate Main + Advanced roadmap, weekly targets, and advanced problem-solving strategies.
3. IF SUBJECT (Phy/Chem/Bio/Maths): Provide Chapter list, Concept explanation, Formula sheet, Examples, Exam-level MCQs, Common mistakes, and Quick revision tricks.
4. IF MOCK TEST: Provide high-yield questions, answer key, detailed explanations, and difficulty analysis.
5. IF PROGRESS/ANALYSIS: Identify weak/strong areas based on history and generate a 7-day schedule.

Always end with a 'Guru Mantra' (Pro-Tip).`;

export type TeachingMode = 'short' | 'detailed' | 'example' | 'speed' | 'roadmap' | 'strategy' | 'neet' | 'jee' | 'subject_deepdive' | 'progress_analysis';

export const solveDoubt = async (
  query: string, 
  history: { role: string, parts: any[] }[] = [], 
  mode: TeachingMode = 'detailed',
  examLevel: string = 'JEE',
  media?: { data: string, mimeType: string }
) => {
  const ai = getAI();
  const modelName = 'gemini-3-pro-preview';
  
  const intentPrompts = {
    short: "Quick 3-point summary.",
    detailed: "In-depth theory, examples, and NTA-style practice questions.",
    example: "Explain using 3 Desi Indian analogies and practical examples.",
    speed: "Revision burst: 5 critical points and 2 memory hacks.",
    roadmap: "Build a detailed month-by-month study plan with weekly targets.",
    strategy: "Score improvement techniques and time management strategies.",
    neet: "Full NEET NTA-pattern Course Architecture and 12-month Roadmap.",
    jee: "Full JEE Main/Advanced Roadmap with progressive difficulty targets.",
    subject_deepdive: "Chapter list, Formula sheet, Solved Examples, MCQs, and Common Mistakes.",
    progress_analysis: "Analyze mistakes and give a 7-day personalized growth schedule."
  };

  const fullQuery = `[INTENT: ${mode}] [TARGET: ${examLevel}] ${intentPrompts[mode]}\n\nStudent Query: ${query}`;
  const parts: any[] = [{ text: fullQuery }];
  if (media) parts.unshift({ inlineData: { data: media.data, mimeType: media.mimeType } });
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [...history, { role: 'user', parts }],
    config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION, temperature: 0.6 }
  });
  return response.text;
};

export const generateExamPaper = async (params: {
  examType: string;
  subject: string;
  chapters: string;
  difficulty: string;
  level: string;
  language: string;
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `MOCK TEST GENERATOR:
    - CATEGORY: ${params.examType}
    - PATTERN: NTA/CBSE Standard
    - DIFFICULTY: ${params.difficulty}
    - SUBJECT: ${params.subject}
    Generate 5 balanced questions with Answer Key and Detailed Explanations.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            topic: { type: Type.STRING }
          },
          required: ["text", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const generateDailyQuestion = async (level: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate one high-yield NTA pattern challenge question for ${level}.`,
    config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION }
  });
  return response.text;
};

export const generateDailyGK = async () => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "5 educational/exam updates for today in JSON format.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            cat: { type: Type.STRING },
            date: { type: Type.STRING },
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

// Fix: Added missing export generateSpeedNotes to resolve ReferenceError in RapidRevision.tsx
export const generateSpeedNotes = async (topic: string, level: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `REVISION BURST (60s):
    - TOPIC: ${topic}
    - LEVEL: ${level}
    Provide 5 critical points, 2 memory hacks, and 1 core formula/concept. Use Hinglish if appropriate.`,
    config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION }
  });
  return response.text;
};

// Fix: Added missing export generateStudyMaterial to resolve ReferenceError in RapidRevision.tsx
export const generateStudyMaterial = async (topic: string, level: string, type: 'notes' | 'formula_sheet') => {
  const ai = getAI();
  const prompt = type === 'notes' 
    ? `Generate detailed study notes for ${topic} at the ${level} level. Include core definitions, conceptual explanations, and practical applications.`
    : `Generate a comprehensive formula and concept cheat sheet for ${topic} at the ${level} level. Include all relevant mathematical expressions, unit conversions, and fundamental constants.`;
    
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION }
  });
  return response.text;
};

export const speakText = async (text: string, voiceName: string = 'Kore') => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const bytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
      return source; 
    }
  } catch (error) { console.error(error); }
  return null;
};

export function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
