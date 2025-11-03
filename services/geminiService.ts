// src/services/geminiService.ts
// نسخه مخصوص OpenRouter با مدل Google Gemini 2.0 Flash (کاملاً بدون فیلتر و محدودیت)

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
      // ⛔️ نیازی به پیام ثابت system نیست، چون خودت در App Builder پرامپت تعیین کردی
      ...messages
        .filter((m) => m.content?.trim() !== "")
        .map((m) => ({
          role: m.role === Role.ASSISTANT ? "assistant" : "user",
          content: m.content,
        })),
    ];

    // درخواست به OpenRouter با مدل Gemini (بدون فیلتر)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://wawbeawbrawb.vercel.app/", // آدرس سایت خودت
        "X-Title": "My AI Chatbot",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001", // مدل مورد نظر
        messages: formattedMessages,
        temperature: 1,
        // 🚫 حذف کامل فیلترهای اخلاقی و محتوایی
        safety_settings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
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
