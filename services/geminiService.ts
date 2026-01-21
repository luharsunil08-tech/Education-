
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const CHANAKYA_SYSTEM_INSTRUCTION = `You are Chanakya, the Universal Academic Mentor of BharatEdu. 
Your knowledge base covers:
1. PRIMARY & SECONDARY (Classes 1-12): Expertise in NCERT, CBSE, ICSE, and State Boards.
2. HIGHER EDUCATION: Comprehensive knowledge for Graduation (BA, BSc, BCom, BTech, MBBS) and Post-Graduation (MA, MSc, MTech, PhD).
3. COMPETITIVE EXAMS: Specialist in JEE (Main/Adv), NEET, UPSC, SSC, Banking, and State PSCs.

TEACHING MODES:
- 'detailed' (Conceptual): Provide deep, first-principles explanations. Use "Why" before "How".
- 'short' (Speed Hack): Provide punchy, high-impact summaries, mnemonics, and 1-line examples.
- 'example' (Analogies): Use relatable, real-world Indian examples (e.g., explaining gravity using a falling mango).
- 'neet'/'jee': Focus on high-yield NCERT patterns, previous year trends, and elimination techniques.

TONE: Encouraging, scholarly, and helpful Hinglish where appropriate. Use LaTeX for all mathematical and scientific formulas.`;

export type TeachingMode = 'short' | 'detailed' | 'example' | 'speed' | 'roadmap' | 'strategy' | 'neet' | 'jee' | 'subject_deepdive' | 'progress_analysis';

export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  code?: number;
}

export const solveDoubt = async (
  query: string, 
  history: { role: string, parts: any[] }[] = [], 
  mode: TeachingMode = 'detailed',
  examLevel: string = 'JEE',
  media?: { data: string, mimeType: string }
) => {
  try {
    const ai = getAI();
    const modelName = 'gemini-3-pro-preview'; // Use Pro for complex reasoning across PG levels
    
    let modeInstruction = "";
    if (mode === 'short') modeInstruction = "Format: Provide a 'Speed Hack' (short mnemonic or 1-sentence logic) followed by a tiny example.";
    if (mode === 'detailed') modeInstruction = "Format: Provide a 'Deep Dive' with historical context, core principles, and a step-by-step derivation if applicable.";
    if (mode === 'example') modeInstruction = "Format: Explain entirely through 3 distinct analogies.";

    const parts: any[] = [{ text: `[LEVEL: ${examLevel}] [MODE: ${mode}] ${modeInstruction}\n\nStudent Doubt: ${query}` }];
    if (media) parts.unshift({ inlineData: { data: media.data, mimeType: media.mimeType } });
    
    const validatedHistory = [...history];
    if (validatedHistory.length > 0 && validatedHistory[validatedHistory.length - 1].role === 'user') {
      validatedHistory.push({ role: 'model', parts: [{ text: 'Understood. I will adjust my pedagogical depth to the requested level.' }] });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [...validatedHistory, { role: 'user', parts }],
      config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION, temperature: 0.7 }
    });
    return response.text;
  } catch (error: any) {
    console.error("Doubt Solving Error:", error);
    return `Guru is currently meditating on a complex problem. Reason: ${error.message || 'Connection lost'}. Please try again shortly.`;
  }
};

export const generateCourseSyllabus = async (subject: string, level: string): Promise<ServiceResponse<any>> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Perform Deep Curricula Research. Build a 3-Tier path for "${subject}" at "${level}" level. 
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
    return { data: JSON.parse(response.text || "{}") };
  } catch (error: any) {
    return { error: error.message || "Failed to architect syllabus" };
  }
};

export const generateDailyGK = async () => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Research: 1. NTA/UPSC updates. 2. Science/Tech breakthroughs. 3. Global education. Provide 5 summaries in JSON: [{cat, title, content, date}].",
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const generateLessonContent = async (lessonName: string, courseTitle: string, level: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: `Generate MASTER CLASS Material: Topic "${lessonName}" (${courseTitle}) for ${level} level. 
      Include: 1. Core Concept. 2. Solved Example. 3. Quick Note for Revision.`,
      config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION }
    });
    return response.text;
  } catch (error: any) {
    return `Guru encountered an error: ${error.message}`;
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
      contents: `Generate 5 MCQs for ${config.subject} at ${config.level} difficulty. Return JSON.`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return []; }
};

/**
 * Encodes a Uint8Array into a base64 string.
 * This is used for streaming raw PCM audio data to the Live API.
 */
export function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a base64 string into a Uint8Array.
 */
export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8