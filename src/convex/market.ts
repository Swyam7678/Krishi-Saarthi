"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const getMarketPrices = action({
  args: {},
  handler: async (ctx) => {
    // Mock data for Mandi prices
    const crops = [
      { name: "Wheat", min: 2100, max: 2400, avg: 2250 },
      { name: "Rice", min: 2800, max: 3200, avg: 3000 },
      { name: "Maize", min: 1800, max: 2100, avg: 1950 },
      { name: "Sugarcane", min: 300, max: 350, avg: 325 },
      { name: "Soybean", min: 4500, max: 5200, avg: 4850 },
    ];

    // Add some random fluctuation
    return crops.map(crop => ({
      ...crop,
      current: Math.round(crop.avg + (Math.random() * 100 - 50))
    }));
  },
});
