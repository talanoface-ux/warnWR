import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Message, Role, SafetyLevel } from '../types';

// NOTE: The API key is sourced from `process.env.API_KEY`, which is assumed
// to be set in the execution environment. Do not add any UI for it.
const getApiKey = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("متغیر محیطی API_KEY تنظیم نشده است.");
  }
  return apiKey;
};

const safetyLevelMap: Record<SafetyLevel, HarmBlockThreshold> = {
  [SafetyLevel.DEFAULT]: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  [SafetyLevel.RELAXED]: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  [SafetyLevel.NO_FILTERS]: HarmBlockThreshold.BLOCK_NONE,
};

export interface GeminiResponse {
  text: string | null;
}

export const getChatResponse = async (
  messages: Message[],
  systemInstruction: string,
  safetyLevel: SafetyLevel
): Promise<GeminiResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const modelMessages = messages
        .filter(m => m.role !== Role.SYSTEM && (m.content?.trim() ?? '') !== '')
        .map(m => ({
            role: m.role === Role.ASSISTANT ? 'model' : 'user',
            parts: [{ text: m.content! }]
        }));
    
    const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: safetyLevelMap[safetyLevel] || HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: safetyLevelMap[safetyLevel] || HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: safetyLevelMap[safetyLevel] || HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: safetyLevelMap[safetyLevel] || HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: modelMessages,
        config: {
            systemInstruction: systemInstruction,
            temperature: 1.0,
            topP: 0.9,
            safetySettings: safetySettings,
        }
    });

    return { text: response.text };

  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('SAFETY')) {
            throw new Error(`پاسخ به دلیل تنظیمات ایمنی مسدود شد. می‌توانید «سطح ایمنی» را در تنظیمات پیشرفته تغییر دهید.`);
        }
        throw new Error(`خطایی رخ داد: ${error.message}. لطفاً کلید API و اتصال شبکه خود را بررسی کنید.`);
    }
    throw new Error("یک خطای ناشناخته رخ داد.");
  }
};