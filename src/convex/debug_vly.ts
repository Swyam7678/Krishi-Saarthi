"use node";
import { action } from "./_generated/server";
import { vly } from "../lib/vly-integrations";

export const debug = action({
  args: {},
  handler: async (ctx) => {
    try {
      console.log("Testing Vly AI connection...");
      const result = await vly.ai.completion({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 10,
      });
      console.log("Vly Result:", JSON.stringify(result, null, 2));
      return result;
    } catch (e: any) {
      console.error("Vly Exception:", e);
      return { success: false, error: e.message, stack: e.stack };
    }
  }
});
