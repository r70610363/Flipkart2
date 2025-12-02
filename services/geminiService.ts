import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Note: process.env.API_KEY is expected to be available in the environment
const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) {
        console.warn("Gemini API Key missing. Returning mock description.");
        return `A premium quality ${productName} perfect for your ${category} needs. Durable, stylish, and designed for daily use.`;
    }

    try {
        const model = 'gemini-2.5-flash';
        const prompt = `Write a short, catchy, and professional e-commerce product description (max 50 words) for a product named "${productName}" in the category "${category}". Do not use markdown formatting like bold or italics.`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text || "No description generated.";
    } catch (error) {
        console.error("Error generating description:", error);
        return "Failed to generate AI description. Please try again.";
    }
};