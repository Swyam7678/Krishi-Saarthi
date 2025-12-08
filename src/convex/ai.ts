"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { vly } from "../lib/vly-integrations";
import { internal } from "./_generated/api";

export const chat = action({
  args: {
    message: v.string(),
    history: v.array(v.object({ role: v.string(), content: v.string() })),
    context: v.optional(v.string()),
    lang: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lang = args.lang || 'hi';
    
    const langName: Record<string, string> = { 
      en: 'English', 
      hi: 'Hindi', 
      pa: 'Punjabi', 
      mr: 'Marathi', 
      ta: 'Tamil',
      gu: 'Gujarati',
      bn: 'Bengali'
    };
    const targetLang = langName[lang] || 'Hindi';

    const systemPrompt = `
      You are KrishiSaarthi, an expert AI agricultural assistant for Indian farmers.
      Language: Respond in ${targetLang}.
      
      Context:
      ${args.context || "No specific soil data provided."}

      Role:
      - Answer questions about farming, crops, fertilizers, weather, and government schemes.
      - Be helpful, encouraging, and practical.
      - Keep answers concise and easy to understand for a farmer.
      - If the user asks about the soil data provided in context, analyze it.
    `;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string; }[] = [
      { role: 'system', content: systemPrompt },
      ...args.history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: args.message }
    ];

    try {
      const result = await vly.ai.completion({
        model: 'gpt-4o',
        messages: messages,
        maxTokens: 1000,
      });

      if (result.success && result.data) {
        return result.data.choices[0]?.message?.content || "Error generating response.";
      }
      return "Sorry, I am unable to process your request at the moment.";
    } catch (e) {
      console.error("Chat Error:", e);
      return "Error connecting to AI service.";
    }
  },
});

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
    lang: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    const prompt = `
      Act as a senior agricultural scientist and expert farmer (Krishi Vigyanik) for Indian agriculture.
      Analyze the following field conditions to recommend the most suitable crops:

      **Soil & Environment Profile:**
      - Nitrogen (N): ${args.nitrogen} mg/kg
      - Phosphorus (P): ${args.phosphorus} mg/kg
      - Potassium (K): ${args.potassium} mg/kg
      - Soil Type: ${args.soilType}
      - pH Level: ${args.ph}
      - Rainfall: ${args.rainfall} mm (Average)
      - Temperature: ${args.temperature}°C
      - Humidity: ${args.humidity}%

      **Task:**
      Recommend the top 3 most viable crops for these specific conditions.

      **Response Format (in ${targetLang}):**
      For each crop, provide:
      1. **Crop Name**: (Name in ${targetLang})
      2. **Suitability Analysis**: Why this crop fits the NPK, pH, and weather data.
      3. **Water Management**: Irrigation needs based on the rainfall provided.
      4. **Fertilizer Guide**: Specific dosage corrections for the N, P, K levels provided.
      5. **Disease Warning**: Potential risks given the Temperature/Humidity.

      **Tone:** Professional, encouraging, and practical for a farmer.
      **Format:** Clean Markdown with bold headers and bullet points. Use emojis where appropriate.
    `;

    try {
      const result = await vly.ai.completion({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 2000
      });

      if (result.success && result.data) {
        const content = result.data.choices[0]?.message?.content || "सिफारिश उत्पन्न नहीं की जा सकी।";
        
        // Save to DB (Success path)
        const identity = await ctx.auth.getUserIdentity();
        if (identity && identity.email) {
            await ctx.runMutation(internal.recommendations.saveRecommendation, {
                email: identity.email,
                nitrogen: args.nitrogen,
                phosphorus: args.phosphorus,
                potassium: args.potassium,
                soilType: args.soilType,
                ph: args.ph,
                rainfall: args.rainfall,
                recommendation: content,
                reasoning: "AI Analysis (GPT-4o)",
            });
        }
        return content;
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
          name: lang === 'en' ? "Rice (Paddy)" : "धान (Rice)", 
          minRain: 100, 
          minTemp: 20, maxTemp: 35,
          soil: ["Clay", "Loamy", "Silt", "Peaty"], 
          minPh: 5.0, maxPh: 8.0, 
          reason: lang === 'en' ? "Suitable for high rainfall and clayey soil." : "अधिक वर्षा और नमी वाली मिट्टी उपयुक्त है।",
          nutrientNeeds: { n: "high", p: "medium", k: "medium" }
        },
        { 
          name: lang === 'en' ? "Wheat" : "गेहूँ (Wheat)", 
          minRain: 50, maxRain: 100, 
          minTemp: 10, maxTemp: 25,
          soil: ["Loamy", "Clay", "Silt", "Chalky"], 
          minPh: 6.0, maxPh: 7.5, 
          reason: lang === 'en' ? "Cool climate and moderate water needs." : "ठंडी जलवायु और मध्यम पानी की आवश्यकता।",
          nutrientNeeds: { n: "medium", p: "medium", k: "medium" }
        },
        { 
          name: lang === 'en' ? "Maize" : "मक्का (Maize)", 
          minRain: 50, 
          minTemp: 18, maxTemp: 30,
          soil: ["Loamy", "Sandy", "Silt", "Chalky"], 
          minPh: 5.5, maxPh: 7.5, 
          reason: lang === 'en' ? "Needs well-drained soil." : "अच्छी जल निकासी वाली मिट्टी की आवश्यकता।",
          nutrientNeeds: { n: "high", p: "medium", k: "medium" }
        },
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

      let response = lang === 'en' 
        ? `### 🌾 Recommended Crops (AI Simulation)\n\nDue to technical issues, we are using a simulation based on your soil conditions (N: ${args.nitrogen}, P: ${args.phosphorus}, K: ${args.potassium}, pH: ${args.ph}, Rain: ${args.rainfall}mm, Temp: ${args.temperature}°C):\n\n`
        : `### 🌾 अनुशंसित फसलें (AI सिमुलेशन)\n\nतकनीकी समस्या के कारण हम वास्तविक समय AI से संपर्क नहीं कर सके, लेकिन आपकी मिट्टी की स्थिति (N: ${args.nitrogen}, P: ${args.phosphorus}, K: ${args.potassium}, pH: ${args.ph}, वर्षा: ${args.rainfall}mm, तापमान: ${args.temperature}°C) के आधार पर यहाँ एक अनुमानित सुझाव है:\n\n`;

      // Simple fallback for other languages if not English
      if (lang !== 'en' && lang !== 'hi') {
         response = `### 🌾 Recommended Crops (AI Simulation - ${targetLang})\n\n(Simulation Mode) Based on your soil conditions:\n\n`;
      }

      topCrops.forEach((crop, index) => {
          response += `${index + 1}. **${crop.name}**\n   - **${lang === 'en' ? 'Reason' : 'कारण'}:** ${crop.reason} `;
          
          // Add specific reason based on match
          if (crop.soil.some(s => args.soilType.includes(s))) {
            response += lang === 'en' 
                ? `Your **${args.soilType}** soil is suitable. `
                : `आपकी **${args.soilType}** मिट्टी इसके लिए उपयुक्त है। `;
          }
          
          response += `\n`;
          
          // Dynamic fertilizer tip
          let tips = [];
          if (args.nitrogen < 50 && crop.nutrientNeeds.n !== "low") tips.push(lang === 'en' ? "Nitrogen (Urea)" : "नाइट्रोजन (यूरिया)");
          if (args.phosphorus < 50) tips.push(lang === 'en' ? "Phosphorus (DAP)" : "फॉस्फोरस (DAP)");
          if (args.potassium < 50) tips.push(lang === 'en' ? "Potash (MOP)" : "पोटाश (MOP)");
          
          let tipStr = tips.length > 0 
            ? (lang === 'en' ? `Soil lacks nutrients. Use ${tips.join(", ")}.` : `मिट्टी में पोषक तत्वों की कमी है। ${tips.join(", ")} का प्रयोग करें।`)
            : (lang === 'en' ? "Soil health is good. Use balanced organic manure." : "मिट्टी का स्वास्थ्य अच्छा है। संतुलित जैविक खाद का प्रयोग करें।");

          response += `   - **${lang === 'en' ? 'Fertilizer' : 'खाद सुझाव'}:** ${tipStr}\n`;

          // Dynamic Water Tip
          let waterTip = lang === 'en' ? "Normal irrigation needed." : "सामान्य सिंचाई की आवश्यकता है।";
          if (crop.minRain && args.rainfall < crop.minRain) waterTip = lang === 'en' ? "Low rainfall, ensure extra irrigation." : "वर्षा कम है, अतिरिक्त सिंचाई की व्यवस्था करें।";
          if (crop.maxRain && args.rainfall > crop.maxRain) waterTip = lang === 'en' ? "Ensure drainage, avoid waterlogging." : "जल निकासी का उचित प्रबंध करें, अधिक पानी से बचें।";
          response += `   - **${lang === 'en' ? 'Water' : 'जल प्रबंधन'}:** ${waterTip}\n`;

          // Dynamic Disease Warning
          let diseaseWarning = "";
          if (args.humidity > 80) diseaseWarning = lang === 'en' ? "⚠️ High humidity: Risk of fungus. Use fungicides." : "⚠️ उच्च नमी के कारण फफूंद (Fungus) का खतरा। समय पर कीटनाशक का प्रयोग करें।";
          else if (args.temperature > 35) diseaseWarning = lang === 'en' ? "⚠️ High heat: Light irrigation recommended." : "⚠️ उच्च तापमान से फसल को बचाने के लिए हल्की सिंचाई करें।";
          
          if (diseaseWarning) response += `   - **${lang === 'en' ? 'Caution' : 'सावधानी'}:** ${diseaseWarning}\n`;
          
          response += `\n`;
      });

      response += lang === 'en' 
        ? `*Note: This is an automated estimate (Simulation Mode). Please consult an expert.*`
        : `*नोट: यह एक स्वचालित अनुमान है (सिमुलेशन मोड)। कृपया कृषि विशेषज्ञ से सलाह लें।*`;

      // Save to DB (Fallback path)
      const identity = await ctx.auth.getUserIdentity();
      if (identity && identity.email) {
        await ctx.runMutation(internal.recommendations.saveRecommendation, {
            email: identity.email,
            nitrogen: args.nitrogen,
            phosphorus: args.phosphorus,
            potassium: args.potassium,
            soilType: args.soilType,
            ph: args.ph,
            rainfall: args.rainfall,
            recommendation: response,
            reasoning: "AI Simulation (Fallback)",
        });
      }

      return response;
    }
  },
});