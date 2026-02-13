/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent from "../agent.js";
import type * as agentContext from "../agentContext.js";
import type * as ai from "../ai.js";
import type * as applications from "../applications.js";
import type * as candidates from "../candidates.js";
import type * as interviews from "../interviews.js";
import type * as jobs from "../jobs.js";
import type * as messages from "../messages.js";
import type * as scraperConfigs from "../scraperConfigs.js";
import type * as scrapers from "../scrapers.js";
import type * as seed from "../seed.js";
import type * as stats from "../stats.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  agentContext: typeof agentContext;
  ai: typeof ai;
  applications: typeof applications;
  candidates: typeof candidates;
  interviews: typeof interviews;
  jobs: typeof jobs;
  messages: typeof messages;
  scraperConfigs: typeof scraperConfigs;
  scrapers: typeof scrapers;
  seed: typeof seed;
  stats: typeof stats;
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
