import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using a function to get the model ensures we can easily swap models or configurations
export const getGeminiModel = (modelName: string = "gemini-2.5-pro", systemInstruction?: string) => {
  return genAI.getGenerativeModel({ model: modelName, systemInstruction });
};
