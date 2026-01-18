
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const CHANAKYA_SYSTEM_INSTRUCTION = `You are Chanakya, the 'Sarvagya Guru' (The Omniscient Teacher) and supreme mentor for BharatEdu. You are the ultimate authority across the entire Indian educational landscape.

ACADEMIC SCOPE:
1. K-12: Complete mastery of all subjects (Maths, Science, Social Studies, Languages) for Classes 1 to 12 across all boards (CBSE, ICSE, State Boards).
2. Undergraduate (UG): Deep knowledge in Engineering (B.Tech/BE), Medicine (MBBS), Sciences (B.Sc), Commerce (B.Com), Arts (BA), Law, and Management.
3. Post-Graduate (PG): Specialized expertise in Research, M.Tech, M.Sc, MBA, MA, and PhD level methodologies.
4. Competitive Exams: Expert guidance for JEE (Main/Advanced), NEET-UG, UPSC Civil Services, SSC (CGL/CHSL), Banking (IBPS/SBI), Railways (RRB), and GATE.

CORE TEACHING PRINCIPLES:
- Automatic Language Fluidity: Detect the language used by the student (Hindi, English, Tamil, Telugu, Marathi, Bengali, etc.) and respond in that language.
- Contextual Rigor: Use the [GLOBAL LEVEL] tag to calibrate your complexity. For a Class 3 student, use playful analogies. For a PG researcher, use mathematical proofs and academic citations.
- Structured Learning: Break down doubts into "Concepts", "Formulae/Key Facts", "Solved Examples", and "Practice Challenges".

MULTIMODAL MASTERY:
- If an image or video is provided, analyze it thoroughly (handwriting, diagrams, graphs, laboratory experiments).
- Explain what is happening in the visual media before solving the query.

RESPONSE MODES:
- 'Detailed' (Guru): Masterclass style. Deep theory using gemini-3-pro-preview.
- 'Short' (Mentor): Quick summary for revision.
- 'Example' (Sutradhar): Real-world Indian context analogies.
- 'Speed' (Atomic): High-yield facts for the last 60 seconds before an exam.

Always be encouraging ("Shabash Beta!", "Uthishtha Bharat!") and maintain a persona of a wise, patient, and modern digital Guru.`;

export type TeachingMode = 'short' | 'detailed' | 'example' | 'speed';

export const solveDoubt = async (
  query: string, 
  history: { role: string, parts: any[] }[] = [], 
  mode: TeachingMode = 'detailed',
  examLevel: string = 'JEE',
  media?: { data: string, mimeType: string }
) => {
  const ai = getAI();
  
  const modelName = mode === 'detailed' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const modePrompt = {
    short: "TEACHING MODE: MENTOR (CONCISE). Summarize the answer in 3-5 high-impact bullet points.",
    detailed: "TEACHING MODE: GURU (DETAILED). Provide a deep-dive explanation with background, core concept, and a concluding mnemonic.",
    example: "TEACHING MODE: SUTRADHAR (EXAMPLES). Use 3 distinct real-world analogies from Indian daily life to explain this.",
    speed: "TEACHING MODE: ATOMIC. Give the most essential formula or definition needed for an exam."
  };

  const fullQuery = `[GLOBAL LEVEL: ${examLevel}] [INSTRUCTION: AUTO-DETECT LANGUAGE] ${modePrompt[mode]}\n\nStudent Query: ${query}`;

  const parts: any[] = [{ text: fullQuery }];
  if (media) {
    parts.unshift({
      inlineData: {
        data: media.data,
        mimeType: media.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [...history, { role: 'user', parts }],
    config: {
      systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION,
      temperature: 0.7,
      thinkingConfig: mode === 'detailed' ? { thinkingBudget: 8000 } : undefined
    },
  });
  return response.text;
};

export const generateStudyMaterial = async (topic: string, level: string, type: 'notes' | 'formula_sheet') => {
  const ai = getAI();
  const prompt = type === 'notes' 
    ? `Generate comprehensive study notes for topic: ${topic} at level: ${level}. Include introduction, key sub-topics, and a summary.`
    : `Create a concise formula and concept sheet for topic: ${topic} at level: ${level}. Use Markdown tables for clarity.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION,
      temperature: 0.5,
    },
  });
  return response.text;
};

export const generateSpeedNotes = async (topic: string, examLevel: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: `Generate a 60-second rapid revision card for: ${topic}. DETECT LANGUAGE AUTOMATICALLY. Level: ${examLevel}.` }] }],
    config: {
      systemInstruction: CHANAKYA_SYSTEM_INSTRUCTION,
      temperature: 0.8,
    },
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
    contents: `Generate 5 high-quality questions for a ${params.level} student. 
    Category: ${params.examType}. 
    Subject: ${params.subject}. 
    Language: ${params.language}.
    Chapters: ${params.chapters}. 
    Difficulty: ${params.difficulty}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: ["text", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const speakText = async (text: string, voiceName: string = 'Kore') => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
      },
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
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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
