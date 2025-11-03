interface PerchanceCallResponse {
    status: 'success' | 'error';
    output: string; // This should be the image URL
    [key: string]: any;
}


export const generateCharacterImage = async (prompt: string): Promise<string> => {
    // Using the user-provided dedicated proxy to bypass CORS and Cloudflare restrictions.
    const proxyUsername = 'u8pNvtlE3P7T2KP';
    const proxyPassword = 'OxnR9s0NnZoksJc';
    const proxyIp = '204.252.84.147';
    const proxyPort = '44174';

    // The browser security model prevents making HTTPS requests to a raw IP address.
    // By switching to HTTP, we trade a potential SSL error for a "Mixed Content" error,
    // which is the most likely cause of "Failed to fetch" in this context.
    // A production-ready solution requires the proxy to be on a domain with a valid SSL cert.
    const proxyBaseUrl = `http://${proxyIp}:${proxyPort}`;
    const proxyAuth = btoa(`${proxyUsername}:${proxyPassword}`);

    const perchanceApiPath = '/api/v1/call/ai-text-to-image-generator';
    
    // This URL format assumes the proxy is a reverse proxy that forwards requests
    // from its path to the target server (perchance.org). This is a standard pattern.
    const url = `${proxyBaseUrl}${perchanceApiPath}`;

    const payload = {
        method: "generate",
        args: {
            prompt: prompt,
            negative_prompt: 'ugly, deformed, noisy, blurry, distorted, grainy, sketch, cartoon, anime, text, watermark, signature',
            style_preset: 'photographic'
        }
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${proxyAuth}`,
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response from proxy/perchance:", errorText);
            throw new Error(`خطا در ارتباط با سرویس عکس: سرور پراکسی با کد وضعیت ${response.status} پاسخ داد.`);
        }

        const data: PerchanceCallResponse = await response.json();

        if (data?.status === 'success' && data.output?.startsWith('https://')) {
            return data.output;
        } else {
            console.error("Invalid or error response from Perchance:", data);
            throw new Error(data?.output || "پاسخ دریافتی از سرویس Perchance معتبر نبود.");
        }
    } catch (error) {
        clearTimeout(timeoutId);
        console.error("Error generating image via Perchance:", error);
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                 throw new Error("درخواست به سرور پراکسی به دلیل گذشت زمان زیاد (timeout) لغو شد.");
            }
            if (error.message.includes('Failed to fetch')) {
                 throw new Error("اتصال به سرور پراکسی برای ساخت تصویر ناموفق بود. این مشکل می‌تواند به دلیل پیکربندی نادرست پراکسی، مشکلات شبکه، یا محدودیت‌های امنیتی مرورگر باشد. لطفاً از در دسترس بودن پراکسی اطمینان حاصل کنید.");
            }
            throw error;
        }
        throw new Error("یک خطای ناشناخته در هنگام ساخت تصویر رخ داد.");
    }
};