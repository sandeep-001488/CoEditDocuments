// list-models.js
// Run this: node list-models.js

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCBFWe8kw6Tc9tpJ23VdW_LqAZPbdMRqqA";

async function listModels() {
  console.log("🔍 Fetching available models for your API key...\n");

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Method 1: Try to list models using the API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.models && data.models.length > 0) {
      console.log(`✅ Found ${data.models.length} available models:\n`);

      data.models.forEach((model, index) => {
        console.log(`${index + 1}. Model: ${model.name}`);
        console.log(`   Display Name: ${model.displayName || "N/A"}`);
        console.log(`   Description: ${model.description || "N/A"}`);

        if (model.supportedGenerationMethods) {
          console.log(
            `   Supported Methods: ${model.supportedGenerationMethods.join(
              ", "
            )}`
          );
        }

        console.log(""); // Empty line
      });

      // Extract just the model names for easy use
      console.log("\n📋 Model names you can use:");
      const modelNames = data.models
        .filter((m) =>
          m.supportedGenerationMethods?.includes("generateContent")
        )
        .map((m) => m.name.replace("models/", ""));

      modelNames.forEach((name) => {
        console.log(`   - "${name}"`);
      });
    } else {
      console.log("⚠️  No models found for this API key.");
    }
  } catch (error) {
    console.error("❌ Error fetching models:", error.message);
    console.log("\n💡 Your API key might be:");
    console.log("   - Invalid or expired");
    console.log("   - Not enabled for Gemini API");
    console.log("   - Restricted to specific models");
    console.log(
      "\n🔗 Get a new API key at: https://aistudio.google.com/app/apikey"
    );
  }
}

listModels();
