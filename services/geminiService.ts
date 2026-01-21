
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const CHANAKYA_SYSTEM_INSTRUCTION = `You are Chanakya, the Senior Academic Mentor and Master Syllabus Architect of BharatEdu. 
You are an expert in designing pedagogical paths for Indian students (JEE, NEET, UPSC, Boards).

CORE PRINCIPLES:
- STRUCTURE: Always use Beginner, Intermediate, and Advanced tiers.
- CONTENT: High-yield concepts, memory hacks, and NTA/CBSE pattern focus.
- TONE: Encouraging, authoritative, and helpful Hinglish.
- FORMAT: Professional Markdown with LaTeX for math.

When asked to build a course, act as a Chief Academic Officer. For GK, act as an Investigative Educational Journalist.`;

export type TeachingMode = 'short' | 'detailed' | 'example' | 'speed' | 'roadmap' | 'strategy' | 'neet' | 'jee' | 'subject_deepdive' | 'progress_analysis';

export const solveDoubt = async (
  query: string, 
  history: { role: string, parts: any[] }[] = [], 
  mode: TeachingMode = 'detailed',
  examLevel: string = 'JEE',
  media?: { data: string, mimeType: string }
) => {
  try {
    const ai = getAI();
    const modelName = 'gemini-3-flash-preview'; 
    const parts: any[] = [{ text: `[INTENT: ${mode}] [LEVEL: ${examLevel}] Query: ${query}` }];
    if (media) parts.unshift({ inlineData: { data: media.data, mimeType: media.mimeType } });
    
    const validatedHistory = [...history];
    if (validatedHistory.length > 0 && validatedHistory[validatedHistory.length - 1].role === 'user') {
      validatedHistory.push({ role: 'model', parts: [{ text: 'Understood.' }] });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [...validatedHistory, { role: 'user', parts }],
      config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION, temperature: 0.7 }
    });
    return response.text;
  } catch (error: any) {
    return `Guru is currently meditating. Please try again soon.`;
  }
};

/**
 * AI Course Engine: Phase 1 - Syllabus Architecting
 */
export const generateCourseSyllabus = async (subject: string, level: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Perform 2-Phase Research. Phase 1: Build a complete Beginner-to-Pro syllabus for ${subject} (${level}). 
      Structure into 3 Tiers (Foundation, Application, Mastery). 
      JSON format: { "courseTitle": string, "description": string, "tiers": [ { "title": string, "level": string, "modules": [ { "name": string, "objective": string } ] } ] }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            courseTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            tiers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  level: { type: Type.STRING },
                  modules: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        objective: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Course Generation Error", error);
    return null;
  }
};

/**
 * AI GK Research: Performs deep background scanning
 */
export const generateDailyGK = async () => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Run Background Research on: 1. Latest NTA/UPSC/CBSE updates. 2. Significant Indian innovations. 3. Global education tech trends. 4. Weekly success mindset for students. Provide 5 detailed summaries in JSON: [{cat, title, content, date}].",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              cat: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              date: { type: Type.STRING }
            }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "[]");
    return data.length > 0 ? data : getFallbackGK();
  } catch (error) {
    return getFallbackGK();
  }
};

const getFallbackGK = () => [
  { cat: "Exam Update", title: "Latest National Exam Trends", content: "NTA has shifted focus towards application-based testing for 2025. Students are advised to focus on conceptual clarity over rote memorization.", date: "Today" },
  { cat: "Innovation", title: "New AI Study Framework", content: "A new cognitive framework for learning suggests that AI-assisted spaced repetition can increase retention by 40%.", date: "Today" }
];

/**
 * Phase 2 - Automatic Lesson Generation
 */
export const generateLessonContent = async (lessonName: string, courseTitle: string, level: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: `Provide deep study material for: "${lessonName}" in the course "${courseTitle}" for ${level}. 
      Use Phase 2 Pedagogical structure: 1. Concept Introduction. 2. Deep Dive Analysis. 3. Critical Formula/Fact Bank. 4. Mock Questions. 5. Guru's Secret Mantra for this topic.`,
      config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION }
    });
    return response.text;
  } catch (error) {
    return "Guru's wisdom is flowing elsewhere. Please retry.";
  }
};

export const speakText = async (text: string, voiceName: string = 'Kore') => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
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
  } catch (error) { console.error("TTS Error", error); }
  return null;
};

export const generateDailyQuestion = async (examLevel: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate one challenging question for ${examLevel}. Return text only.`,
    });
    return response.text;
  } catch (error) { return null; }
};

export const generateExamPaper = async (config: any) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 MCQs for ${config.subject} (${config.level}). JSON format.`,
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
              explanation: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return []; }
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

export const generateSpeedNotes = async (topic: string, level: string) => {
  const ai = getAI();
  const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Rapid Notes: ${topic} (${level})` });
  return res.text;
};

export const generateStudyMaterial = async (topic: string, level: string, type: string) => {
  const ai = getAI();
  const res = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Material: ${topic} (${level}) - ${type}` });
  return res.text;
};
