import { VlyIntegrations } from "@vly-ai/integrations";

// Lazy initialization to avoid build-time errors if env vars are missing
class LazyVly {
  private instance: VlyIntegrations | null = null;

  get ai() {
    return this.getInstance().ai;
  }

  private getInstance() {
    if (!this.instance) {
      // Cast to any to avoid TS errors with different versions of the library
      const config: any = {
        token: process.env.VLY_INTEGRATION_KEY || "sk-proj-build-placeholder-key",
      };
      this.instance = new VlyIntegrations(config);
    }
    return this.instance;
  }
}

export const vly = new LazyVly();