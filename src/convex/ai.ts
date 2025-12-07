"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { vly } from '../src/lib/vly-integrations';

export const generateCropRecommendation = action({
  args: {
    nitrogen: v.number(),
    phosphorus: v.number(),
    potassium: v.number(),
    soilType: v.string(),
    ph: v.number(),
    rainfall: v.number(),
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

      Please provide:
      1. Top 3 recommended crops.
      2. A brief reasoning for why these crops are suitable.
      3. Fertilizer suggestions to improve yield.
      
      Format the response clearly in Markdown.
    `;

    const result = await vly.ai.completion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 1000
    });

    if (result.success && result.data) {
      return result.data.choices[0]?.message?.content || "Could not generate recommendation.";
    }
    return result.error || "Request failed";
  },
});
