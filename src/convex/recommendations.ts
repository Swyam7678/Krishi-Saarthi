import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const saveRecommendation = internalMutation({
  args: {
    email: v.optional(v.string()),
    nitrogen: v.number(),
    phosphorus: v.number(),
    potassium: v.number(),
    soilType: v.string(),
    ph: v.number(),
    rainfall: v.number(),
    recommendation: v.string(),
    reasoning: v.string(),
  },
  handler: async (ctx, args) => {
    let userId = undefined;
    if (args.email) {
        const user = await ctx.db.query("users").withIndex("email", q => q.eq("email", args.email!)).first();
        if (user) userId = user._id;
    }

    await ctx.db.insert("recommendations", {
        userId,
        nitrogen: args.nitrogen,
        phosphorus: args.phosphorus,
        potassium: args.potassium,
        soilType: args.soilType,
        ph: args.ph,
        rainfall: args.rainfall,
        recommendation: args.recommendation,
        reasoning: args.reasoning,
    });
  },
});

export const getUserRecommendations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) return [];
    
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();
      
    if (!user) return [];

    return await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});
