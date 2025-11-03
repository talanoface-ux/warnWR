// src/services/geminiService.ts
// نسخه مخصوص OpenRouter با مدل Google Gemini 2.0 Flash (بدون فیلتر اخلاقی یا محدودیت)

import { Message, Role } from "../types";

export interface ChatResponse {
  text: string | null;
}

// گرفتن کلید از محیط
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("❌ کلید API پیدا نشد. لطفاً متغیر VITE_OPENROUTER_API_KEY را در تنظیمات Vercel وارد کنید.");
  }
  return apiKey;
};

// تابع اصلی برای ارسال و دریافت پیام از OpenRouter
export const getChatResponse = async (
  messages: Message[],
  systemInstruction: string
): Promise<ChatResponse> => {
  try {
    const apiKey = getApiKey();

    // ساختار پیام‌ها برای API
    const formattedMessages = [
      // ⛔️ دیگه system message ثابت نمی‌ذاریم چون توی App Builder خودت Prompt می‌دی
      ...messages
        .filter((m) => m.content?.trim() !== "")
        .map((m) => ({
          role: m.role === Role.ASSISTANT ? "assistant" : "user",
          content: m.content,
        })),
    ];

    // درخواست به OpenRouter با مدل Gemini
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://wawbeawbrawb.vercel.app/", // آدرس سایتت رو اینجا بذار
        "X-Title": "My AI Chatbot",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001", // مدل مورد نظر
        messages: formattedMessages,
        temperature: 1, // می‌تونی بین 0 تا 1 تنظیم کنی برای خلاقیت
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      throw new Error("❌ خطا در ارتباط با OpenRouter API");
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || null;

    return { text };
  } catch (error) {
    console.error("Chat Error:", error);
    if (error instanceof Error) {
      throw new Error(`⚠️ ${error.message}`);
    }
    throw new Error("یک خطای ناشناخته رخ داد.");
  }
};
