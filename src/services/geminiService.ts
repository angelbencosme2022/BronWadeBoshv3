import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CarAnalysis {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  condition: string;
  dealRating: "Great" | "Good" | "Fair" | "Poor" | "Suspicious";
  dealScore: number; // 0-100
  summary: string;
  redFlags: string[];
  pros: string[];
  cons: string[];
  marketComparison: {
    averagePrice: number;
    lowPrice: number;
    highPrice: number;
    similarCarsCount: number;
  };
}

export async function analyzeCarListing(url: string): Promise<CarAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this car listing URL: ${url}. 
    Extract the key details and provide a comprehensive deal analysis. 
    If you cannot find specific data, estimate based on the model and year.
    Identify any red flags in the description (e.g., title issues, mechanical warnings, suspicious wording).
    Compare the price to typical market values for this specific year, make, and model.`,
    config: {
      tools: [{ urlContext: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          make: { type: Type.STRING },
          model: { type: Type.STRING },
          year: { type: Type.INTEGER },
          price: { type: Type.NUMBER },
          mileage: { type: Type.NUMBER },
          location: { type: Type.STRING },
          condition: { type: Type.STRING },
          dealRating: { type: Type.STRING, description: "One of: Great, Good, Fair, Poor, Suspicious" },
          dealScore: { type: Type.INTEGER, description: "Score from 0 to 100" },
          summary: { type: Type.STRING },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          marketComparison: {
            type: Type.OBJECT,
            properties: {
              averagePrice: { type: Type.NUMBER },
              lowPrice: { type: Type.NUMBER },
              highPrice: { type: Type.NUMBER },
              similarCarsCount: { type: Type.INTEGER }
            },
            required: ["averagePrice", "lowPrice", "highPrice", "similarCarsCount"]
          }
        },
        required: ["make", "model", "year", "price", "mileage", "dealRating", "dealScore", "summary", "redFlags", "pros", "cons", "marketComparison"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to analyze the listing. Please check the URL and try again.");
  }
}
