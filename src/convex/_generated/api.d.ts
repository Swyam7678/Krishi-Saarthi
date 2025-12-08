/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as http from "../http.js";
import type * as market from "../market.js";
import type * as npk from "../npk.js";
import type * as recommendations from "../recommendations.js";
import type * as schemes from "../schemes.js";
import type * as test_ai_debug from "../test_ai_debug.js";
import type * as test_chat from "../test_chat.js";
import type * as test_features from "../test_features.js";
import type * as users from "../users.js";
import type * as verify_recommendations from "../verify_recommendations.js";
import type * as weather from "../weather.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  http: typeof http;
  market: typeof market;
  npk: typeof npk;
  recommendations: typeof recommendations;
  schemes: typeof schemes;
  test_ai_debug: typeof test_ai_debug;
  test_chat: typeof test_chat;
  test_features: typeof test_features;
  users: typeof users;
  verify_recommendations: typeof verify_recommendations;
  weather: typeof weather;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
