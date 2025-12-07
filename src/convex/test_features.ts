"use node";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const testAll = action({
  args: {},
  handler: async (ctx) => {
    const results: any = {};

    console.log("Testing Weather...");
    try {
      results.weather = await ctx.runAction(api.weather.getWeather, {
        location: "Delhi",
        lang: "en"
      });
      console.log("✅ Weather Test Passed");
    } catch (e: any) {
      console.error("❌ Weather Test Failed:", e);
      results.weatherError = e.message;
    }

    console.log("Testing Market Prices...");
    try {
      results.market = await ctx.runAction(api.market.getMarketPrices, {
        location: "Delhi",
        lang: "en"
      });
      console.log("✅ Market Test Passed");
    } catch (e: any) {
      console.error("❌ Market Test Failed:", e);
      results.marketError = e.message;
    }

    console.log("Testing NPK Data...");
    try {
      results.npk = await ctx.runAction(api.npk.getLiveNPK, {});
      console.log("✅ NPK Test Passed");
    } catch (e: any) {
      console.error("❌ NPK Test Failed:", e);
      results.npkError = e.message;
    }

    console.log("Testing AI Recommendation...");
    try {
      results.ai = await ctx.runAction(api.ai.generateCropRecommendation, {
        nitrogen: 100,
        phosphorus: 50,
        potassium: 50,
        soilType: "Loamy",
        ph: 6.5,
        rainfall: 100,
        temperature: 25,
        humidity: 60,
        lang: "en"
      });
      console.log("✅ AI Test Passed");
    } catch (e: any) {
      console.error("❌ AI Test Failed:", e);
      results.aiError = e.message;
    }

    return results;
  },
});
