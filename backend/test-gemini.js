// test-gemini.js
// Run this file to test your API key: node test-gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCBFWe8kw6Tc9tpJ23VdW_LqAZPbdMRqqA";

async function testGemini() {
  console.log("Testing Gemini API...\n");

  const genAI = new GoogleGenerativeAI(API_KEY);

  // Try different model names
  const modelsToTry = [
    "gemini-2.5-flash"
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent("Say hello");
      const response = await result.response;
      const text = response.text();

      console.log(`✅ SUCCESS with ${modelName}`);
      console.log(`Response: ${text}\n`);
      return modelName; // Return the working model
    } catch (error) {
      console.log(`❌ FAILED with ${modelName}`);
      console.log(`Error: ${error.message}\n`);
    }
  }

  console.log(
    "❌ All models failed. Your API key might be invalid or restricted."
  );
}

testGemini();
