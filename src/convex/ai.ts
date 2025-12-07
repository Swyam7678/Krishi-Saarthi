"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { vly } from "../lib/vly-integrations";

export const generateCropRecommendation = action({
  args: {
    nitrogen: v.number(),
    phosphorus: v.number(),
    potassium: v.number(),
    soilType: v.string(),
    ph: v.number(),
    rainfall: v.number(),
    temperature: v.number(),
    humidity: v.number(),
  },
  handler: async (ctx, args) => {
    const prompt = `
      As an expert agriculturalist, recommend the best crops to grow based on the following soil and environmental conditions:
      
      Nitrogen (N): ${args.nitrogen}
      Phosphorus (P): ${args.phosphorus}
      Potassium (K): ${args.potassium}
      Soil Type: ${args.soilType}
      pH Level: ${args.ph}
      Rainfall: ${args.rainfall} mm
      Temperature: ${args.temperature}°C
      Humidity: ${args.humidity}%

      Please provide:
      1. Top 3 recommended crops.
      2. A brief reasoning for why these crops are suitable, specifically referencing the NPK, pH, and soil values provided.
      3. Fertilizer suggestions to improve yield.
      
      IMPORTANT: Provide the response in HINDI language.
      Format the response clearly in Markdown.
    `;

    try {
      const result = await vly.ai.completion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 1000
      });

      if (result.success && result.data) {
        return result.data.choices[0]?.message?.content || "सिफारिश उत्पन्न नहीं की जा सकी।";
      }
      // Log error and fall through to catch block
      console.error("Vly AI Error:", result.error);
      throw new Error(result.error || "Request failed");
    } catch (e) {
      console.error("AI Error:", e);
      
      // Enhanced Fallback Logic based on inputs
      // Define crops with their specific requirements
      const crops = [
        { 
          name: "धान (Rice)", 
          minRain: 100, 
          minTemp: 20, maxTemp: 35,
          soil: ["Clay", "Loamy", "Silt", "Peaty"], 
          minPh: 5.0, maxPh: 8.0, 
          reason: "अधिक वर्षा और नमी वाली मिट्टी उपयुक्त है।",
          nutrientNeeds: { n: "high", p: "medium", k: "medium" }
        },
        { 
          name: "गेहूँ (Wheat)", 
          minRain: 50, maxRain: 100, 
          minTemp: 10, maxTemp: 25,
          soil: ["Loamy", "Clay", "Silt", "Chalky"], 
          minPh: 6.0, maxPh: 7.5, 
          reason: "ठंडी जलवायु और मध्यम पानी की आवश्यकता।",
          nutrientNeeds: { n: "medium", p: "medium", k: "medium" }
        },
        { 
          name: "मक्का (Maize)", 
          minRain: 50, 
          minTemp: 18, maxTemp: 30,
          soil: ["Loamy", "Sandy", "Silt", "Chalky"], 
          minPh: 5.5, maxPh: 7.5, 
          reason: "अच्छी जल निकासी वाली मिट्टी की आवश्यकता।",
          nutrientNeeds: { n: "high", p: "medium", k: "medium" }
        },
        { 
          name: "गन्ना (Sugarcane)", 
          minRain: 150, 
          minTemp: 20, maxTemp: 35,
          soil: ["Loamy", "Clay", "Peaty"], 
          minPh: 6.0, maxPh: 8.0, 
          reason: "उच्च वर्षा और उपजाऊ मिट्टी की आवश्यकता।",
          nutrientNeeds: { n: "high", p: "high", k: "medium" }
        },
        { 
          name: "सरसों (Mustard)", 
          maxRain: 60, 
          minTemp: 10, maxTemp: 25,
          soil: ["Sandy", "Loamy", "Chalky"], 
          minPh: 6.0, maxPh: 7.5, 
          reason: "कम पानी और रेतीली मिट्टी में अच्छी उपज।",
          nutrientNeeds: { n: "medium", p: "medium", k: "medium" }
        },
        { 
          name: "चना (Chickpea)", 
          maxRain: 50, 
          minTemp: 15, maxTemp: 30,
          soil: ["Loamy", "Sandy", "Chalky"], 
          minPh: 6.0, maxPh: 8.0, 
          reason: "कम नमी और हल्की मिट्टी उपयुक्त है।",
          nutrientNeeds: { n: "low", p: "medium", k: "medium" } // Legume
        },
        { 
          name: "आलू (Potato)", 
          minRain: 50, 
          minTemp: 15, maxTemp: 25,
          soil: ["Sandy", "Loamy", "Peaty"], 
          minPh: 4.8, maxPh: 6.5, 
          reason: "भुरभुरी मिट्टी और मध्यम पानी की आवश्यकता।",
          nutrientNeeds: { n: "medium", p: "medium", k: "high" } // Needs K
        },
        { 
          name: "बाजरा (Pearl Millet)", 
          maxRain: 50, 
          minTemp: 25, maxTemp: 35,
          soil: ["Sandy", "Loamy", "Chalky"], 
          minPh: 6.5, maxPh: 8.0, 
          reason: "सूखा प्रतिरोधी और कम उपजाऊ मिट्टी में भी उगता है।",
          nutrientNeeds: { n: "low", p: "low", k: "low" } // Hardy
        },
        { 
          name: "सोयाबीन (Soybean)", 
          minRain: 60, 
          minTemp: 20, maxTemp: 30,
          soil: ["Loamy", "Clay"], 
          minPh: 6.0, maxPh: 7.0, 
          reason: "मध्यम वर्षा और कार्बनिक मिट्टी उपयुक्त है।",
          nutrientNeeds: { n: "low", p: "medium", k: "medium" } // Legume
        },
        { 
          name: "मूंगफली (Groundnut)", 
          maxRain: 100, 
          minTemp: 20, maxTemp: 30,
          soil: ["Sandy", "Loamy"], 
          minPh: 5.0, maxPh: 7.0, 
          reason: "रेतीली दोमट मिट्टी इसके लिए सर्वोत्तम है।",
          nutrientNeeds: { n: "low", p: "medium", k: "medium" } // Legume
        }
      ];

      // Determine input levels
      const nLevel = args.nitrogen < 50 ? "low" : args.nitrogen > 150 ? "high" : "medium";
      const pLevel = args.phosphorus < 50 ? "low" : args.phosphorus > 100 ? "high" : "medium";
      const kLevel = args.potassium < 50 ? "low" : args.potassium > 150 ? "high" : "medium";

      // Calculate suitability score
      const scoredCrops = crops.map(crop => {
         let score = 0;
         // Rainfall check
         if ((crop.minRain === undefined || args.rainfall >= crop.minRain) && 
             (crop.maxRain === undefined || args.rainfall <= crop.maxRain)) {
             score += 3;
         } else if (crop.minRain && args.rainfall < crop.minRain && args.rainfall > crop.minRain - 20) {
             score += 1; // Close enough
         }

         // Soil check
         if (crop.soil.some(s => args.soilType.includes(s))) score += 3;

         // pH check
         if (args.ph >= crop.minPh && args.ph <= crop.maxPh) score += 2;
         else if (Math.abs(args.ph - crop.minPh) < 0.5 || Math.abs(args.ph - crop.maxPh) < 0.5) score += 1;

         // Temperature check
         if (args.temperature >= crop.minTemp && args.temperature <= crop.maxTemp) score += 2;
         else if (Math.abs(args.temperature - crop.minTemp) < 5 || Math.abs(args.temperature - crop.maxTemp) < 5) score += 1;

         // Nutrient compatibility check
         // Nitrogen
         if (crop.nutrientNeeds.n === nLevel) score += 2;
         else if (nLevel === "high" && crop.nutrientNeeds.n === "medium") score += 1;
         else if (nLevel === "low" && crop.nutrientNeeds.n === "high") score -= 1;

         // Potassium (Important for roots/fruits)
         if (crop.nutrientNeeds.k === kLevel) score += 1;
         
         return { ...crop, score };
      });

      // Sort by score descending
      scoredCrops.sort((a, b) => b.score - a.score);

      // Take top 3
      let topCrops = scoredCrops.slice(0, 3);
      
      // Ensure we have at least some crops if nothing matched well
      if (topCrops.length < 3) {
          const topNames = new Set(topCrops.map(tc => tc.name));
          const remaining = crops
            .filter(c => !topNames.has(c.name))
            .map(c => ({ ...c, score: 0 }));
          topCrops = [...topCrops, ...remaining.slice(0, 3 - topCrops.length)];
      }

      let response = `### 🌾 अनुशंसित फसलें (AI सिमुलेशन)\n\nतकनीकी समस्या के कारण हम वास्तविक समय AI से संपर्क नहीं कर सके, लेकिन आपकी मिट्टी की स्थिति (N: ${args.nitrogen}, P: ${args.phosphorus}, K: ${args.potassium}, pH: ${args.ph}, वर्षा: ${args.rainfall}mm, तापमान: ${args.temperature}°C) के आधार पर यहाँ एक अनुमानित सुझाव है:\n\n`;

      topCrops.forEach((crop, index) => {
          response += `${index + 1}. **${crop.name}**\n   - **कारण:** ${crop.reason} `;
          
          // Add specific reason based on match
          if (crop.soil.some(s => args.soilType.includes(s))) {
            response += `आपकी **${args.soilType}** मिट्टी इसके लिए उपयुक्त है। `;
          }
          
          // Dynamic NPK feedback
          if (crop.nutrientNeeds.n === "low" && nLevel === "low") {
             response += `कम नाइट्रोजन (${args.nitrogen}) वाली मिट्टी में भी यह अच्छी उपज देती है। `;
          }
          if (crop.nutrientNeeds.n === "high" && nLevel === "high") {
             response += `उच्च नाइट्रोजन (${args.nitrogen}) का यह फसल अच्छा लाभ उठाएगी। `;
          }
          
          response += `\n`;
          
          // Dynamic fertilizer tip
          let tips = [];
          if (args.nitrogen < 50 && crop.nutrientNeeds.n !== "low") tips.push("नाइट्रोजन (यूरिया)");
          if (args.phosphorus < 50) tips.push("फॉस्फोरस (DAP)");
          if (args.potassium < 50 && crop.nutrientNeeds.k === "high") tips.push("पोटाश (MOP)"); // Emphasize K for K-loving crops
          else if (args.potassium < 50) tips.push("पोटाश");
          
          let tipStr = tips.length > 0 
            ? `मिट्टी में पोषक तत्वों की कमी है। ${tips.join(", ")} का प्रयोग करें।` 
            : "मिट्टी का स्वास्थ्य अच्छा है। संतुलित जैविक खाद का प्रयोग करें।";

          response += `   - **सुझाव:** ${tipStr}\n\n`;
      });

      response += `*नोट: यह एक स्वचालित अनुमान है (सिमुलेशन मोड)। कृपया कृषि विशेषज्ञ से सलाह लें।*`;

      return response;
    }
  },
});