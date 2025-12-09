import { api } from './_generated/api';
import { action } from './_generated/server';

export const test = action({
  args: {},
  handler: async (ctx) => {
    const data = await ctx.runAction(api.market.getMarketPrices, { location: 'Test City', lang: 'en' });
    console.log('Market Data:', JSON.stringify(data, null, 2));
  }
});
