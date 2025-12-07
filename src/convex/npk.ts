"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const getLiveNPK = action({
  args: {
    sheetUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Simulate reading from a sensor/sheet
    // In a real scenario, we would fetch the CSV from the sheetUrl
    
    // Generating realistic fluctuating values
    const n = 40 + Math.random() * 20; // 40-60
    const p = 30 + Math.random() * 15; // 30-45
    const k = 35 + Math.random() * 15; // 35-50

    return {
      n: Math.round(n),
      p: Math.round(p),
      k: Math.round(k),
      timestamp: Date.now(),
      status: {
        n: n < 30 ? "Low" : n > 50 ? "High" : "Optimal",
        p: p < 20 ? "Low" : p > 40 ? "High" : "Optimal",
        k: k < 25 ? "Low" : k > 45 ? "High" : "Optimal",
      }
    };
  },
});
