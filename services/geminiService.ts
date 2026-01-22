
import { GoogleGenAI, Type, Modality } from "@google/genai";

const CHANAKYA_SYSTEM_INSTRUCTION = `You are Chanakya, the Universal Academic Mentor and Senior Syllabus Architect of BharatEdu. 

YOUR ACADEMIC SCOPE:
1. SCHOOL EDUCATION (Classes 1-12): Expert in NCERT, CBSE, ICSE, and state boards across India.
2. HIGHER EDUCATION: Deep expertise in Undergraduate and Postgraduate subjects.
3. COMPETITIVE EXAMS: Specialized in JEE, NEET, UPSC, SSC, Banking, and State Govt jobs.

TEACHING MODES:
- 'detailed' (Conceptual): Deep, first-principles explanations.
- 'short' (Speed Hack): Mnemonics, quick formulas, and 1-line examples.
- 'example' (Analogies): Relatable Indian analogies.

Always use LaTeX for scientific formulas. Your tone is authoritative, wise, and encouraging.`;

export type TeachingMode = 'short' | 'detailed' | 'example' | 'speed' | 'roadmap' | 'strategy' | 'neet' | 'jee' | 'govt' | 'subject_deepdive' | 'progress_analysis';

export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  code?: number;
}

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const solveDoubt = async (
  query: string, 
  history: { role: string, parts: any[] }[] = [], 
  mode: TeachingMode = 'detailed',
  examLevel: string = 'JEE',
  media?: { data: string, mimeType: string }
) => {
  try {
    const ai = getAI();
    const modelName = 'gemini-3-pro-preview'; 
    let modeGuidance = "";
    if (mode === 'short') modeGuidance = "FORMAT: High-speed summary. One mnemonic, one 1-sentence example.";
    if (mode === 'detailed') modeGuidance = "FORMAT: Deep academic lecture style.";
    if (mode === 'example') modeGuidance = "FORMAT: Teach strictly through simple analogies.";

    const parts: any[] = [{ text: `[LEVEL: ${examLevel}] [MODE: ${mode}] ${modeGuidance}\n\nQuery: ${query}` }];
    if (media) parts.push({ inlineData: { data: media.data, mimeType: media.mimeType } });
    
    const validatedHistory = [...history];
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [...validatedHistory, { role: 'user', parts }],
      config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION, temperature: 0.7 }
    });
    return response.text || "Guru is reflecting on your query. Please rephrase.";
  } catch (error: any) {
    console.error("Doubt Solving Error:", error);
    return `Guru is in silence. Error: ${error.message}`;
  }
};

export const generateCourseSyllabus = async (subject: string, level: string): Promise<ServiceResponse<any>> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Create a comprehensive academic syllabus for "${subject}" at "${level}" level. 
      Structure into 3 Tiers (Foundation, Application, Mastery). 
      Format as JSON: { "courseTitle": string, "description": string, "tiers": [ { "title": string, "level": string, "modules": [ { "name": string, "objective": string } ] } ] }`,
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
    return { error: error.message };
  }
};

export const generateDailyGK = async () => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Research latest Indian academic updates, current affairs, and science news. Return JSON: [{cat, title, content, date}].",
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
      contents: `Generate deep, high-quality study material for: "${lessonName}" in the course "${courseTitle}" for "${level}" level.`,
      config: { systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION }
    });
    return response.text || "Content currently unavailable.";
  } catch (error: any) {
    return `Error generating lesson: ${error.message}`;
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
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const bytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
      return source;
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
  return null;
};

export const generateDailyQuestion = async (examLevel: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate one challenging memory retention question for ${examLevel} aspirants. Text only.`,
    });
    return response.text || null;
  } catch (error) {
    return null;
  }
};

export const generateExamPaper = async (config: any) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 high-quality MCQs for ${config.subject} at ${config.level} level in ${config.language}.`,
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
  } catch (error) {
    return [];
  }
};

export function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateSpeedNotes = async (topic: string, level: string) => {
  try {
    const ai = getAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 60-second revision burst notes for topic: ${topic} at level: ${level}.`,
    });
    return res.text || "Failed to generate notes.";
  } catch (error) {
    return "Guru's scroll is empty. Check your connection.";
  }
};

export const generateStudyMaterial = async (topic: string, level: string, type: string) => {
  try {
    const ai = getAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a high-quality ${type} for topic: ${topic} at level: ${level}.`,
    });
    return res.text || "Failed to generate material.";
  } catch (error) {
    return "Synthesis failed.";
  }
};
