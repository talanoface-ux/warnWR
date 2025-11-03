// src/services/geminiService.ts
// نسخه مخصوص OpenRouter (به جای Google AI)

import { Message, Role } from "../types";

export interface ChatResponse {
  text: string | null;
}

// تابع برای گرفتن کلید از محیط
const getApiKey = (): string => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("کلید API ست نشده است. لطفاً OPENROUTER_API_KEY را در Vercel وارد کنید.");
  }
  return apiKey;
};

// تابع اصلی چت با OpenRouter
export const getChatResponse = async (
  messages: Message[],
  systemInstruction: string
): Promise<ChatResponse> => {
  try {
    const apiKey = getApiKey();

    // تبدیل ساختار پیام‌ها برای OpenRouter
    const formattedMessages = [
      { role: "system", content: systemInstruction || "تو یک چت‌بات فارسی هستی." },
      ...messages
        .filter((m) => m.content?.trim() !== "")
        .map((m) => ({
          role: m.role === Role.ASSISTANT ? "assistant" : "user",
          content: m.content,
        })),
    ];

    // درخواست به OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://your-site.vercel.app/",
        "X-Title": "My AI Chatbot",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // مدل اصلی (می‌تونی عوضش کنی)
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      throw new Error("خطا در برقراری ارتباط با OpenRouter API");
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
