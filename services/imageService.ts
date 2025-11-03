
import { GoogleGenAI, Modality } from "@google/genai";

const getApiKey = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This should not happen if the platform injects the key as per instructions.
    throw new Error("متغیر محیطی API_KEY برای سرویس Gemini تنظیم نشده است.");
  }
  return apiKey;
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    // The returned image can be used directly in an <img> src attribute
                    return `data:${mimeType};base64,${base64ImageBytes}`;
                }
            }
        }
        
        // This will be reached if no image part was found in the response
        throw new Error("پاسخ سرویس عکس، حاوی تصویر نبود.");

    } catch (error) {
        console.error("Error calling Gemini for image generation:", error);
        if (error instanceof Error) {
            // Check for safety policy violations in the response
            if (error.message.includes('SAFETY') || (error as any).response?.promptFeedback?.blockReason) {
                throw new Error(`ساخت عکس به دلیل تنظیمات ایمنی مسدود شد.`);
            }
            throw new Error(`خطایی در ساخت تصویر رخ داد: ${error.message}`);
        }
        throw new Error("یک خطای ناشناخته در ساخت تصویر رخ داد.");
    }
};
