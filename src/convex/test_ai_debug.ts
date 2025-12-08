"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const testLanguageCompliance = action({
  args: {},
  handler: async (ctx) => {
    const languages = [
      { code: 'hi', name: 'Hindi' },
      { code: 'pa', name: 'Punjabi' },
      { code: 'ta', name: 'Tamil' }
    ];

    const results: any[] = [];

    for (const lang of languages) {
      console.log(`Testing ${lang.name} (${lang.code})...`);
      try {
        // Explicitly cast the response or define the type if possible, 
        // but for now we know it returns a string.
        const response = await ctx.runAction(api.ai.chat, {
            message: "Hello, how are you?",
            history: [],
            lang: lang.code
        }) as string;

        results.push({
            language: lang.name,
            code: lang.code,
            response: response.substring(0, 100) + "..." // Log first 100 chars
        });
      } catch (e: any) {
        results.push({
            language: lang.name,
            code: lang.code,
            error: e.message
        });
      }
    }

    return results;
  }
});