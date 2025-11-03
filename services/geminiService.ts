import { Message, Role, SafetyLevel } from "../types";

export const getChatResponse = async (
  messages: Message[],
  systemInstruction: string,
  safetyLevel: SafetyLevel
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_CEREBRAS_API_KEY;

    if (!apiKey) {
      throw new Error("متغیر محیطی VITE_CEREBRAS_API_KEY تنظیم نشده است.");
    }

    // تبدیل پیام‌ها به ساختار مورد انتظار Cerebras
    const formattedMessages = [
      { role: "system", content: systemInstruction },
      ...messages
        .filter((m) => m.content.trim() !== "")
        .map((m) => ({
          role: m.role === Role.ASSISTANT ? "assistant" : "user",
          content: m.content,
        })),
    ];

    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3.1-8b", // مدل پایه Cerebras
        messages: formattedMessages,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`خطا از سرور Cerebras: ${response.status} → ${text}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "پاسخی از مدل دریافت نشد.";
    return text;
  } catch (error) {
    console.error("Error fetching from Cerebras API:", error);
    if (error instanceof Error) {
      return `خطا: ${error.message}`;
    }
    return "یک خطای ناشناخته رخ داد.";
  }
};
