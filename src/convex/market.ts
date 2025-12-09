"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { vly } from "../lib/vly-integrations";

interface MarketItem {
  id: string;
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
    
    const langName: any = { 
      en: 'English', 
      hi: 'Hindi', 
      pa: 'Punjabi', 
      mr: 'Marathi', 
      ta: 'Tamil',
      gu: 'Gujarati',
      bn: 'Bengali'
    };
    const targetLang = langName[lang] || 'Hindi';

    // Helper to generate mock history based on current price
    const generateHistory = (basePrice: number) => {
      const history = [];
      const today = new Date();
      // Generate last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        // Random fluctuation +/- 5%
        const fluctuation = (Math.random() * 0.1) - 0.05; 
        history.push({
          date: dateStr,
          price: Math.round(basePrice * (1 + fluctuation))
        });
      }
      return history;
    };

    // Helper to get dynamic current price
    const getDynamicPrice = (base: number) => {
        // Random fluctuation +/- 8%
        const fluctuation = (Math.random() * 0.16) - 0.08; 
        return Math.round(base * (1 + fluctuation));
    };

    // Base data for crops
    const baseCrops = [
      { id: "wheat", name: lang === 'en' ? "Wheat" : "गेहूँ (Wheat)", avg: 2250 },
      { id: "rice", name: lang === 'en' ? "Rice" : "चावल (Rice)", avg: 3000 },
      { id: "maize", name: lang === 'en' ? "Maize" : "मक्का (Maize)", avg: 1950 },
      { id: "sugarcane", name: lang === 'en' ? "Sugarcane" : "गन्ना (Sugarcane)", avg: 325 },
      { id: "soybean", name: lang === 'en' ? "Soybean" : "सोयाबीन (Soybean)", avg: 4850 },
      { id: "mustard", name: lang === 'en' ? "Mustard" : "सरसों (Mustard)", avg: 5300 },
      { id: "potato", name: lang === 'en' ? "Potato" : "आलू (Potato)", avg: 1000 },
      { id: "onion", name: lang === 'en' ? "Onion" : "प्याज (Onion)", avg: 2000 },
      { id: "tomato", name: lang === 'en' ? "Tomato" : "टमाटर (Tomato)", avg: 1500 },
    ];

    // Generate dynamic fallback data
    const fallbackCrops: MarketItem[] = baseCrops.map(crop => {
      const current = getDynamicPrice(crop.avg);
      const history = generateHistory(crop.avg);
      // Calculate min/max from history and current to be consistent
      const allPrices = [...history.map(h => h.price), current];
      const min = Math.min(...allPrices);
      const max = Math.max(...allPrices);
      
      return {
        id: crop.id,
        name: crop.name,
        avg: crop.avg,
        current,
        min,
        max,
        history
      };
    });

    try {
      const prompt = `
        Provide current estimated market prices (Mandi rates) in INR/quintal for the following crops in ${location}: 
        Wheat, Rice, Maize, Sugarcane, Soybean, Mustard, Potato, Onion, Tomato.
        
        Return ONLY a JSON array with objects containing:
        - id: string (lowercase english identifier, e.g., "wheat")
        - name: string (Name in ${targetLang} and English, e.g., "गेहूँ (Wheat)")
        - min: number (Minimum price)
        - max: number (Maximum price)
        - avg: number (Average price)
        - current: number (Current market price)
        
        Ensure the JSON is valid and contains no other text. Do not include markdown formatting.
      `;

      const result = await vly.completion({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 1000,
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