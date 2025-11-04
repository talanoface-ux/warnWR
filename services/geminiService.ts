// src/services/geminiService.ts
// نسخه‌ی نهایی که خودش از فایل characters.ts پرامپت هر شخصیت رو می‌فهمه و اجرا می‌کنه

import { Message, Role } from "../types";
import { characters } from "../data/characters"; // مسیر فایل شخصیت‌ها (در صورت نیاز تغییر بده)

export interface ChatResponse {
  text: string | null;
}

// گرفتن کلید از محیط (Vercel)
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("❌ کلید API پیدا نشد. لطفاً VITE_OPENROUTER_API_KEY را در تنظیمات Vercel وارد کنید.");
  }
  return apiKey;
};

// تابع اصلی برای پاسخ چت
export const getChatResponse = async (
  messages: Message[],
  systemInstruction: string,
  currentCharacterId?: string // کاراکتر انتخاب‌شده (اختیاری)
): Promise<ChatResponse> => {
  try {
    const apiKey = getApiKey();

    // اگر شخصیت انتخاب‌شده مشخص نیست، از پیام کاربر حدس بزن
    let activeCharacterId = currentCharacterId || "";

    if (!activeCharacterId && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      if (lastMsg.includes("نوشا")) activeCharacterId = "tiyusha";
      else if (lastMsg.includes("ندا")) activeCharacterId = "neda";
      else if (lastMsg.includes("فاطمه")) activeCharacterId = "fatemeh";
      else if (lastMsg.includes("هلیا")) activeCharacterId = "helia";
      else if (lastMsg.includes("تینا")) activeCharacterId = "tina";
    }

    // پیدا کردن prompt مربوط به کاراکتر
    const selectedCharacter = characters.find(c => c.id === activeCharacterId);
    const systemPrompt = selectedCharacter?.systemPrompt || "تو یک چت‌بات فارسی هستی.";

    // ساختار پیام‌ها برای مدل
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter((m) => m.content?.trim() !== "")
        .map((m) => ({
          role: m.role === Role.ASSISTANT ? "assistant" : "user",
          content: m.content,
        })),
    ];

    // ارسال به API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://wawbeawbrawb.vercel.app/", // آدرس سایت خودت رو اینجا بذار
        "X-Title": "My AI Chatbot",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "thedrummer/unslopnemo-12b", // مدل پیشنهادی بدون فیلتر
        messages: formattedMessages,
        temperature: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenRouter API Error:", errorText);
      throw new Error("⚠️ خطا در ارتباط با OpenRouter API");
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
