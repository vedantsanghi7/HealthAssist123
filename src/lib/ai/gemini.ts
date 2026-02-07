import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey || "placeholder");

export const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function analyzeMedicalText(prompt: string) {
    if (!apiKey) return "AI service unavailable (Missing API Key)";

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Error generating insight.";
    }
}
