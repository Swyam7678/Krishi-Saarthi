import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const updateUser = mutation({
  args: {
    sheetUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    selectedCrops: v.optional(v.array(v.string())),
    name: v.optional(v.string()),
    farmLocation: v.optional(v.string()),
    farmSize: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const patchData: any = {};
    if (args.sheetUrl !== undefined) patchData.sheetUrl = args.sheetUrl;
    if (args.location !== undefined) patchData.location = args.location;
    if (args.selectedCrops !== undefined) patchData.selectedCrops = args.selectedCrops;
    if (args.name !== undefined) patchData.name = args.name;
    if (args.farmLocation !== undefined) patchData.farmLocation = args.farmLocation;
    if (args.farmSize !== undefined) patchData.farmSize = args.farmSize;
    if (args.phoneNumber !== undefined) patchData.phoneNumber = args.phoneNumber;

    await ctx.db.patch(userId, patchData);
  },
});