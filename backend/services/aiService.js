import { getGeminiModel } from "../config/gemini.js";

export const checkGrammar = async (text) => {
  const model = getGeminiModel();
  const prompt = `Check grammar, spelling, and style for:\n\n${text}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const enhanceWriting = async (text) => {
  const model = getGeminiModel();
  const prompt = `Enhance text professionally:\n\n${text}`;
  const result = await model.generateContent(prompt);
  return (await result.response).text();
};

export const summarizeText = async (text) => {
  const model = getGeminiModel();
  const prompt = `Summarize concisely:\n\n${text}`;
  const result = await model.generateContent(prompt);
  return (await result.response).text();
};

export const completeText = async (text) => {
  const model = getGeminiModel();
  const prompt = `Complete the text naturally:\n\n${text}`;
  const result = await model.generateContent(prompt);
  return (await result.response).text();
};

export const getSuggestions = async (text) => {
  const model = getGeminiModel();
  const prompt = `Provide 3-5 suggestions to improve:\n\n${text}`;
  const result = await model.generateContent(prompt);
  return (await result.response).text();
};
