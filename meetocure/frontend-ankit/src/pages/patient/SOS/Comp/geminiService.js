import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log(API_KEY);
if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server.");
}

const ai = new GoogleGenerativeAI(API_KEY);

export async function findNearbyHospitals(latitude, longitude) {
  const prompt = `Find the top 3 hospitals with their full address and a valid phone number near latitude ${latitude} and longitude ${longitude}, strictly within a 2km radius. 
Return ONLY a JSON array of objects with fields: name, address, phone. Example:
[
  { "name": "Hospital A", "address": "Full Address A", "phone": "1234567890" },
  { "name": "Hospital B", "address": "Full Address B", "phone": "9876543210" }
]`;

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await model.generateContent(prompt);

    // Try extracting JSON response
    const jsonString = response.response.candidates[0]?.content.parts[0]?.text ?? "";
    console.log("Gemini API Raw Response:", jsonString);

    if (!jsonString) {
      console.warn("Gemini API returned an empty response.");
      return [];
    }

    try {
      const hospitals = JSON.parse(jsonString);
      return hospitals;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      console.warn("Falling back to empty hospital list.");
      return []; // ✅ fallback so UI never crashes
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.warn("Falling back to empty hospital list.");
    return []; // ✅ fallback so UI never crashes
  }
}
