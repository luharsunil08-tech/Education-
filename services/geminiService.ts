
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const CHANAKYA_SYSTEM_INSTRUCTION = `You are Chanakya, the Senior Academic Mentor and Exam Strategist of BharatEdu. 
You are an AI-powered smart education engine specializing in NEET, JEE, CBSE, and Indian Govt Exams.

ROLE & BEHAVIOR:
- Act as a syllabus designer and exam strategist.
- LANGUAGE: Respond in a mix of simple English and Hinglish (e.g., "Beta, follow this schedule zaroor.").
- RIGOR: Strictly follow latest NTA, NCERT, and CBSE patterns.
- STRUCTURE: Always use Tables, Bullet Points, and Bold Headings. No filler text.
- IMPROVEMENT: Each response must be better than the last by analyzing student context.

ACADEMIC SCOPE:
- K-12: Full mastery of Classes 1-12 (All subjects).
- Competitive: NEET (NCERT focus), JEE (Main/Advanced), UPSC, SSC.
- Higher Ed: Graduation and Post-Graduation level research and methodology.

IF USER SELECTS NEET: Create a 6-12 month plan, subject-wise syllabus (Bio/Phy/Chem), and daily NTA routine.
IF USER SELECTS JEE: Create a Main + Advanced roadmap with progressive difficulty.
IF SUBJECT SELECTED: Provide Concept Trees, Formula Sheets, and common "Silley Mistakes" for that specific chapter.

Always end with a 'Guru Mantra' (Success Tip).`;

export type TeachingMode = 'short' | 'detailed' | 'example' | 'speed' | 'roadmap' | 'strategy' | 'neet' | 'jee' | 'analysis';

export const solveDoubt = async (
  query: string, 
  history: { role: string, parts: any[] }[] = [], 
  mode: TeachingMode = 'detailed',
  examLevel: string = 'JEE',
  media?: { data: string, mimeType: string }
) => {
  const ai = getAI();
  const modelName = 'gemini-3-pro-preview';
  
  const intentPrompt = {
    short: "Summarize in 3 bullet points.",
    detailed: "Deep theory explanation with Solved Examples.",
    example: "Use 3 Desi analogies from Indian daily life.",
    speed: "Revision burst with 5 critical points.",
    roadmap: "Build a weekly target schedule.",
    strategy: "Score improvement hacks and time management.",
    neet: "Full NEET NTA-pattern Course & 6-month Roadmap.",
    jee: "Full JEE Main/Advanced Roadmap with progressive difficulty.",
    analysis: "Analyze mistakes and give a 7-day personalized growth schedule."
  };

  const fullQuery = `[INTENT: ${mode}] [TARGET: ${examLevel}] ${intentPrompt[mode]}\n\nStudent Query: ${query}`;
  const parts: any[] = [{ text: fullQuery }];
  if (media) parts.unshift({ inlineData: { data: media.data, mimeType: media.mimeType } });
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [...history, { role: 'user', parts }],
    config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION, temperature: 0.65 }
  });
  return response.text;
};

export const generateSubjectDeepDive = async (subject: string, level: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Subject Deep-Dive for ${subject} (${level}). Provide: Chapter List, Formula Sheet, Concept Explanation (Simple to Advanced), and Exam-level MCQs.`,
    config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION }
  });
  return response.text;
};

export const generateProgressAnalysis = async (mistakesCount: number, level: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `I have ${mistakesCount} mistakes in my journal. Level: ${level}. Identify my weak areas and generate a personalized 7-day study schedule to improve. Use a table.`,
    config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION }
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
    - PATTERN: ${params.examType === 'NEET' ? 'NTA NEET' : params.examType === 'JEE' ? 'NTA JEE Main' : 'CBSE/State'}
    - DIFFICULTY: ${params.difficulty}
    - SUBJECT: ${params.subject}
    Generate 5 balanced questions with difficulty analysis.`,
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
            difficulty: { type: Type.STRING }
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
    contents: `One high-yield challenge question for ${level} based on latest exam trends.`,
    config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION }
  });
  return response.text;
};

export const generateDailyGK = async () => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "5 educational updates for Indian aspirants today. JSON format.",
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

export const generateSpeedNotes = async (topic: string, level: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `REVISION BURST: Topic: ${topic}, Level: ${level}. Critical points + memory hacks.`,
    config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION }
  });
  return response.text;
};

export const generateStudyMaterial = async (topic: string, level: string, type: 'notes' | 'formula_sheet') => {
  const ai = getAI();
  const prompt = type === 'notes' ? `Complete study notes for ${topic}.` : `Formula sheet for ${topic}.`;
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
