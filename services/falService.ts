// NOTE: The API key must be sourced from the `FAL_API_KEY` environment
// variable in your deployment environment (e.g., Vercel).
const getApiKey = () => {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    throw new Error("کلید API برای سرویس عکس (FAL_API_KEY) در سرور تنظیم نشده است. لطفاً با مدیر تماس بگیرید.");
  }
  return apiKey;
};

interface FalImage {
    url: string;
    content_type: string;
}

interface FalResponse {
    images: FalImage[];
}

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        // Using the fast-sdxl model as it seems to be a more stable endpoint.
        const response = await fetch('https://fal.run/fal-ai/fast-sdxl', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${getApiKey()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Fal.ai API error response:", errorText);
            throw new Error(`خطا در ارتباط با سرویس عکس: ${response.statusText}`);
        }

        const data: FalResponse = await response.json();

        if (data.images && data.images.length > 0 && data.images[0].url) {
            return data.images[0].url;
        } else {
            throw new Error("پاسخ سرویس عکس، حاوی تصویر نبود.");
        }

    } catch (error) {
        console.error("Error calling Fal.ai API:", error);
        if (error instanceof Error) {
            throw new Error(`${error.message}`);
        }
        throw new Error("یک خطای ناشناخته در ساخت تصویر رخ داد.");
    }
};