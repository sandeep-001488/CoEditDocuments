import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;
let model;

export const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found. AI features will be disabled.");
    return;
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI
    ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    : null;
};

export const getGeminiModel = () => {
  if (!model) {
    throw new Error("Gemini AI Model not initialized. Check API key.");
  }
  return model;
};
