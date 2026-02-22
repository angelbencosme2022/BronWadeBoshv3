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
  negotiationPitch: string;
  vin?: string;
  vinData?: {
    manufacturer?: string;
    plantCountry?: string;
    bodyClass?: string;
    engineHP?: string;
    fuelType?: string;
    recalls?: any[];
    accidentHistory?: string;
    titleStatus?: string;
  };
}

export async function analyzeCarListing(url: string): Promise<CarAnalysis> {
  const makeRequest = async (retryCount = 0): Promise<CarAnalysis> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this car listing URL: ${url}. 
        Extract the key details and provide a comprehensive deal analysis in JSON format. 
        If you cannot find specific data, estimate based on the model and year.
        VERY IMPORTANT: Look for a VIN (Vehicle Identification Number) in the text or attributes.
        If a VIN is found, use Google Search to check for public records, auction history (like Copart or IAAI), and any reported accidents or title issues (salvage, rebuilt, flood damage).
        Identify any red flags in the description (e.g., title issues, mechanical warnings, suspicious wording).
        Compare the price to typical market values for this specific year, make, and model.
        Finally, generate a "Negotiation Pitch": This MUST be a detailed, persuasive script or step-by-step strategy (at least 2-3 paragraphs or bullet points). 
        The pitch should tell the buyer exactly what to say to the seller, specifically leveraging the identified cons, red flags, and market data to justify a lower price. 
        Do not leave this field empty.
        
        Return ONLY a JSON object with these keys:
        {
          "make": string,
          "model": string,
          "year": number,
          "price": number,
          "mileage": number,
          "location": string,
          "condition": string,
          "vin": string (17 chars if found),
          "dealRating": "Great" | "Good" | "Fair" | "Poor" | "Suspicious",
          "dealScore": number (0-100),
          "summary": string,
          "redFlags": string[],
          "pros": string[],
          "cons": string[],
          "marketComparison": {
            "averagePrice": number,
            "lowPrice": number,
            "highPrice": number,
            "similarCarsCount": number
          },
          "negotiationPitch": string,
          "vinData": {
            "accidentHistory": string (Summary of any accidents found via search),
            "titleStatus": string (e.g., Clean, Salvage, Rebuilt, Unknown)
          }
        }`,
        config: {
          tools: [{ urlContext: {} }, { googleSearch: {} }],
        }
      });

      let text = response.text;
      if (!text) throw new Error("No response from AI");
      
      // Clean up markdown code blocks if present
      text = text.replace(/```json\n?/, "").replace(/```\n?/, "").trim();
      
      const analysis: CarAnalysis = JSON.parse(text);

      // If VIN is found, fetch additional data from NHTSA
      if (analysis.vin && analysis.vin.length === 17) {
        try {
          const vinResponse = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${analysis.vin}?format=json`);
          const vinJson = await vinResponse.json();
          const data = vinJson.Results[0];

          // Initialize vinData if it doesn't exist (it should from the AI response)
          if (!analysis.vinData) analysis.vinData = {};

          analysis.vinData = {
            ...analysis.vinData,
            manufacturer: data.Manufacturer,
            plantCountry: data.PlantCountry,
            bodyClass: data.BodyClass,
            engineHP: data.EngineHP,
            fuelType: data.FuelTypePrimary,
          };

          // Fetch recalls
          const recallResponse = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${analysis.make}&model=${analysis.model}&modelYear=${analysis.year}`);
          const recallJson = await recallResponse.json();
          analysis.vinData.recalls = recallJson.results || [];
        } catch (vinErr) {
          console.error("Error fetching VIN data:", vinErr);
        }
      }

      return analysis;
    } catch (error: any) {
      // If we hit a rate limit (429) and haven't retried yet, wait 2 seconds and try again
      if (error.message?.includes("429") && retryCount < 1) {
        console.log("Rate limit hit, retrying in 2 seconds...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return makeRequest(retryCount + 1);
      }
      throw error;
    }
  };

  return makeRequest();
}
