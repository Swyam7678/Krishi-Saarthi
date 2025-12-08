"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const testLanguageCompliance = action({
  args: {},
  handler: async (ctx) => {
    const languages = [
      { code: 'hi', name: 'Hindi', fallbackSnippet: "क्षमा करें" },
      { code: 'pa', name: 'Punjabi', fallbackSnippet: "ਮਾਫ ਕਰਨਾ" },
      { code: 'ta', name: 'Tamil', fallbackSnippet: "மன்னிக்கவும்" },
      { code: 'kn', name: 'Kannada', fallbackSnippet: "ಕ್ಷಮಿಸಿ" },
      { code: 'bho', name: 'Bhojpuri', fallbackSnippet: "माफ करीं" },
      { code: 'sat', name: 'Santali', fallbackSnippet: "ᱤᱠᱟᱹᱧ ᱢᱮ" }
    ];

    const results: any[] = [];

    for (const lang of languages) {
      console.log(`Testing ${lang.name} (${lang.code})...`);
      try {
        const response = await ctx.runAction(api.ai.chat, {
            message: "Hello, how are you?",
            history: [],
            lang: lang.code
        }) as string;

        const isFallback = response.includes(lang.fallbackSnippet);
        const status = isFallback ? "FALLBACK_COMPLIANT" : "AI_RESPONSE";

        results.push({
            language: lang.name,
            code: lang.code,
            status: status,
            responsePreview: response.substring(0, 50) + "..."
        });
      } catch (e: any) {
        results.push({
            language: lang.name,
            code: lang.code,
            status: "ERROR",
            error: e.message
        });
      }
    }

    return results;
  }
});