import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function diagnose() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`Checking API Key: ${apiKey?.substring(0, 5)}...${apiKey?.substring(apiKey.length - 4)}`);

    const genAI = new GoogleGenerativeAI(apiKey || "");

    try {
        // Attempting to list models is the most definitive way to check if the key is valid and has permissions
        // Note: The listModels() method might not be available on the client directly in older versions, 
        // but in newer ones it should be part of the API.

        console.log("--- Fetching Model List ---");
        // Standard fetch to the listModels endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", data.error.message);
            console.error("Status:", data.error.status);
        } else if (data.models) {
            console.log("✅ Models found for this key:");
            data.models.forEach((m: any) => console.log(` - ${m.name}`));
        } else {
            console.log("❓ No models returned. Data:", JSON.stringify(data));
        }
    } catch (err: any) {
        console.error("❌ Critical Error:", err.message);
    }
}

diagnose();
