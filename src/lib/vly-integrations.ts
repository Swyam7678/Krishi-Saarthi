import { VlyAI } from "@vly-ai/integrations";

export const vly = new VlyAI({
  token: process.env.VLY_INTEGRATION_KEY || "dummy",
} as any);