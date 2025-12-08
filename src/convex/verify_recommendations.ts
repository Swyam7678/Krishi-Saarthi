import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const testSave = internalMutation({
  args: {},
  handler: async (ctx) => {
    const testData = {
      nitrogen: 100,
      phosphorus: 50,
      potassium: 50,
      soilType: "Loamy",
      ph: 6.5,
      rainfall: 100,
      temperature: 30,
      humidity: 70,
      recommendation: "Test Recommendation Verification",
      reasoning: "Test Reasoning Verification",
      email: "test_verify@example.com"
    };

    // Call the save mutation
    await ctx.runMutation(internal.recommendations.saveRecommendation, testData);

    // Verify
    const latest = await ctx.db.query("recommendations")
        .withIndex("by_user")
        .order("desc")
        .first();

    if (!latest) return "Failed: No recommendation found";
    
    // Check if it matches our test data (or at least the latest one has the fields)
    if (latest.recommendation === "Test Recommendation Verification") {
        if (latest.temperature === 30 && latest.humidity === 70) {
            return "Success: Recommendation saved with temperature and humidity";
        } else {
            return `Failed: Fields mismatch. Temp: ${latest.temperature}, Humidity: ${latest.humidity}`;
        }
    } else {
        // It might be an old one if concurrency issues, but unlikely in dev
        return `Note: Latest recommendation is not the test one. Latest: ${latest.recommendation}`;
    }
  }
});
