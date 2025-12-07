"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { vly } from "../lib/vly-integrations";

interface MarketItem {
  name: string;
  min: number;
  max: number;
  avg: number;
  current: number;
  history: { date: string; price: number }[];
}

export const getMarketPrices = action({
  args: {
    location: v.optional(v.string()),
    lang: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const location = args.location || "Jharkhand, India";
    const lang = args.lang || 'hi';
    
    const langName: any = { en: 'English', hi: 'Hindi', pa: 'Punjabi', mr: 'Marathi', ta: 'Tamil' };
    const targetLang = langName[lang] || 'Hindi';

    // Helper to generate mock history based on current price
    const generateHistory = (basePrice: number) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      return months.map((month, i) => ({
        date: month,
        price: Math.round(basePrice * (1 + (Math.random() * 0.2 - 0.1))) // +/- 10% variation
      }));
    };

    // Fallback data defined first so it can be used in catch block
    const fallbackCrops: MarketItem[] = [
      { name: lang === 'en' ? "Wheat" : "गेहूँ (Wheat)", min: 2100, max: 2400, avg: 2250, current: 2250, history: [] },
      { name: lang === 'en' ? "Rice" : "चावल (Rice)", min: 2800, max: 3200, avg: 3000, current: 3000, history: [] },
      { name: lang === 'en' ? "Maize" : "मक्का (Maize)", min: 1800, max: 2100, avg: 1950, current: 1950, history: [] },
      { name: lang === 'en' ? "Sugarcane" : "गन्ना (Sugarcane)", min: 300, max: 350, avg: 325, current: 325, history: [] },
      { name: lang === 'en' ? "Soybean" : "सोयाबीन (Soybean)", min: 4500, max: 5200, avg: 4850, current: 4850, history: [] },
      { name: lang === 'en' ? "Mustard" : "सरसों (Mustard)", min: 5000, max: 5600, avg: 5300, current: 5300, history: [] },
      { name: lang === 'en' ? "Potato" : "आलू (Potato)", min: 800, max: 1200, avg: 1000, current: 1000, history: [] },
      { name: lang === 'en' ? "Onion" : "प्याज (Onion)", min: 1500, max: 2500, avg: 2000, current: 2000, history: [] },
      { name: lang === 'en' ? "Tomato" : "टमाटर (Tomato)", min: 1000, max: 2000, avg: 1500, current: 1500, history: [] },
    ].map(crop => ({ ...crop, history: generateHistory(crop.avg) }));

    try {
      const prompt = `
        Provide current estimated market prices (Mandi rates) in INR/quintal for the following crops in ${location}: 
        Wheat, Rice, Maize, Sugarcane, Soybean, Mustard, Potato, Onion, Tomato.
        
        Return ONLY a JSON array with objects containing:
        - name: string (Name in ${targetLang} and English, e.g., "गेहूँ (Wheat)")
        - min: number (Minimum price)
        - max: number (Maximum price)
        - avg: number (Average price)
        - current: number (Current market price)
        
        Ensure the JSON is valid and contains no other text. Do not include markdown formatting.
      `;

      const result = await vly.ai.completion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 1000,
        temperature: 0.3,
      });

      if (result.success && result.data) {
        const content = result.data.choices[0]?.message?.content;
        if (content) {
          // Clean up code blocks if present
          const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
          const crops = JSON.parse(jsonStr) as MarketItem[];
          
          return crops.map((crop: MarketItem) => ({
            ...crop,
            current: Math.round(crop.avg + (Math.random() * 100 - 50))
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching market prices:", error);
      return fallbackCrops;
    }
  },
});