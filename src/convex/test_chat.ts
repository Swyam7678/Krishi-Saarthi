"use node";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const testChat = action({
  args: {},
  handler: async (ctx) => {
    console.log("Testing Chat Action...");
    try {
      // Test 1: Basic Question
      console.log("Test 1: Basic Question");
      const response1: string = await ctx.runAction(api.ai.chat, {
        message: "What is the best fertilizer for wheat?",
        history: [],
        context: "Soil N: 120, P: 40, K: 100. Location: Punjab.",
        lang: "en"
      });
      console.log("Response 1:", response1);

      // Test 2: Hindi Question with Context
      console.log("\nTest 2: Hindi Question");
      const response2: string = await ctx.runAction(api.ai.chat, {
        message: "मेरी मिट्टी में नाइट्रोजन कम है, मैं क्या करूँ?",
        history: [],
        context: "Soil N: 40 (Low), P: 150, K: 200.",
        lang: "hi"
      });
      console.log("Response 2:", response2);

      return { success: true, test1: response1, test2: response2 };
    } catch (e: any) {
      console.error("Chat Test Failed:", e);
      return { success: false, error: e.message };
    }
  },
});