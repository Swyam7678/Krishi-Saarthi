import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSchemes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("schemes").collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("schemes").first();
    if (existing) return "Already seeded";

    const schemes = [
      {
        schemeId: "pm_kisan",
        title: "PM Kisan Samman Nidhi",
        description: "Financial support of ₹6,000 per year for farmers.",
        link: "https://pmkisan.gov.in/",
        icon: "coins"
      },
      {
        schemeId: "pmfby",
        title: "Pradhan Mantri Fasal Bima Yojana",
        description: "Crop insurance scheme for farmers.",
        link: "https://pmfby.gov.in/",
        icon: "shield"
      },
      {
        schemeId: "shc",
        title: "Soil Health Card Scheme",
        description: "Get soil nutrient status and recommendations.",
        link: "https://soilhealth.dac.gov.in/",
        icon: "sprout"
      },
      {
        schemeId: "pkvy",
        title: "Paramparagat Krishi Vikas Yojana",
        description: "Promotion of organic farming.",
        link: "https://pgsindia-ncof.gov.in/pkvy/index.aspx",
        icon: "book"
      }
    ];

    for (const scheme of schemes) {
      await ctx.db.insert("schemes", scheme);
    }
    return "Seeded successfully";
  },
});
