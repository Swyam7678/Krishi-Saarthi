"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const getMarketPrices = action({
  args: {},
  handler: async (ctx) => {
    const crops = [
      { name: "गेहूँ (Wheat)", min: 2100, max: 2400, avg: 2250 },
      { name: "चावल (Rice)", min: 2800, max: 3200, avg: 3000 },
      { name: "मक्का (Maize)", min: 1800, max: 2100, avg: 1950 },
      { name: "गन्ना (Sugarcane)", min: 300, max: 350, avg: 325 },
      { name: "सोयाबीन (Soybean)", min: 4500, max: 5200, avg: 4850 },
    ];

    return crops.map(crop => ({
      ...crop,
      current: Math.round(crop.avg + (Math.random() * 100 - 50))
    }));
  },
});