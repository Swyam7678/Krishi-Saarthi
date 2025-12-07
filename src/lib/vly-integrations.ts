import { VlyIntegrations } from "@vly-ai/integrations";

// Lazy initialization to avoid build-time errors when env vars are missing
// The library validates the key in the constructor, so we must delay creation
let instance: VlyIntegrations | undefined;

function getInstance() {
  if (!instance) {
    // Use a fallback key if env var is missing to prevent runtime crashes in dev
    // In production, the env var should be set
    instance = new VlyIntegrations({
      token: process.env.VLY_INTEGRATION_KEY || "sk-proj-build-placeholder-key",
    });
  }
  return instance;
}

export const vly = {
  get ai() {
    return getInstance().ai;
  },
  get email() {
    return getInstance().email;
  }
};