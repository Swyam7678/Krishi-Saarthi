"use node";
import { action } from "./_generated/server";
import { vly } from "../lib/vly-integrations";

export const debugAI = action({
  args: {},
  handler: async (ctx) => {
    console.log("Testing Vly AI connection...");
    try {
      const result = await vly.ai.completion({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello, are you working?" }],
        maxTokens: 50
      });
      
      console.log("Vly AI Result:", JSON.stringify(result, null, 2));
      
      if (!result.success) {
        console.error("Vly AI Failed:", result.error);
      }
      return result;
    } catch (e: any) {
      console.error("Vly AI Exception:", e);
      return { success: false, error: e.message };
    }
  },
});
