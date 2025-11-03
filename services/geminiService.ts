// src/services/geminiService.ts
// نسخه مخصوص OpenRouter (جایگزین کامل Google AI)

import { Message, Role } from "../types";

export interface ChatResponse {
  text: string | null;
}

// گرفتن کلید از محیط (Vercel)
const getApiKey = (): string => {
  // ✅ حتماً توی Vercel کلید رو با نام VITE_OPENROUTER_API_KEY ذخیره کن
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("کلید API یافت نشد. لطفاً متغیر VITE_OPENROUTER_API_KEY را در تنظیمات Vercel اضافه کنید.");
  }
  return apiKey;
};

// تابع اصلی برای چت با OpenRouter
export const getChatResponse = async (
  messages: Message[],
  systemInstruction: string
): Promise<ChatResponse> => {
  try {
    const apiKey = getApiKey();

    // ساختار پیام‌ها برای API
    const formattedMessages = [
      { role: "system", content: systemInstruction || "تو یک چت‌بات فارسی و مودب هستی." },
      ...messages
        .filter((m) => m.content?.trim() !== "")
        .map((m) => ({
          role: m.role === Role.ASSISTANT ? "assistant" : "user",
          content: m.content,
        })),
    ];

    // ارسال درخواست به OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://your-site.vercel.app/", // آدرس سایت خودت رو جایگزین کن
        "X-Title": "My AI Chatbot",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", // می‌تونی هر مدل دیگه‌ای از OpenRouter بزاری
        messages: formattedMessages,
      }),
    });

    // بررسی نتیجه
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      throw new Error("خطا در برقراری ارتباط با OpenRouter API.");
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || null;

    return { text };
  } catch (error) {
    console.error("Chat Error:", error);
    if (error instanceof Error) {
      throw new Error(`خطا: ${error.message}`);
    }
    throw new Error("یک خطای ناشناخته رخ داد.");
  }
};
