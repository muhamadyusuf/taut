/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as articles from "../articles.js";
import type * as billing from "../billing.js";
import type * as billingActions from "../billingActions.js";
import type * as brand from "../brand.js";
import type * as categories from "../categories.js";
import type * as certificateActions from "../certificateActions.js";
import type * as certificates from "../certificates.js";
import type * as certificatesInternal from "../certificatesInternal.js";
import type * as crons from "../crons.js";
import type * as entitlements from "../entitlements.js";
import type * as forms from "../forms.js";
import type * as http from "../http.js";
import type * as links from "../links.js";
import type * as microsites from "../microsites.js";
import type * as midtransActions from "../midtransActions.js";
import type * as plans from "../plans.js";
import type * as qr from "../qr.js";
import type * as seed from "../seed.js";
import type * as seedData_batch01 from "../seedData/batch01.js";
import type * as seedData_batch02 from "../seedData/batch02.js";
import type * as seedData_batch03 from "../seedData/batch03.js";
import type * as seedData_batch04 from "../seedData/batch04.js";
import type * as seedData_batch05 from "../seedData/batch05.js";
import type * as seedData_batch06 from "../seedData/batch06.js";
import type * as seedData_batch07 from "../seedData/batch07.js";
import type * as seedData_batch08 from "../seedData/batch08.js";
import type * as seedData_batch09 from "../seedData/batch09.js";
import type * as seedData_batch10 from "../seedData/batch10.js";
import type * as seedData_index from "../seedData/index.js";
import type * as seedData_types from "../seedData/types.js";
import type * as shop from "../shop.js";
import type * as shopActions from "../shopActions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  articles: typeof articles;
  billing: typeof billing;
  billingActions: typeof billingActions;
  brand: typeof brand;
  categories: typeof categories;
  certificateActions: typeof certificateActions;
  certificates: typeof certificates;
  certificatesInternal: typeof certificatesInternal;
  crons: typeof crons;
  entitlements: typeof entitlements;
  forms: typeof forms;
  http: typeof http;
  links: typeof links;
  microsites: typeof microsites;
  midtransActions: typeof midtransActions;
  plans: typeof plans;
  qr: typeof qr;
  seed: typeof seed;
  "seedData/batch01": typeof seedData_batch01;
  "seedData/batch02": typeof seedData_batch02;
  "seedData/batch03": typeof seedData_batch03;
  "seedData/batch04": typeof seedData_batch04;
  "seedData/batch05": typeof seedData_batch05;
  "seedData/batch06": typeof seedData_batch06;
  "seedData/batch07": typeof seedData_batch07;
  "seedData/batch08": typeof seedData_batch08;
  "seedData/batch09": typeof seedData_batch09;
  "seedData/batch10": typeof seedData_batch10;
  "seedData/index": typeof seedData_index;
  "seedData/types": typeof seedData_types;
  shop: typeof shop;
  shopActions: typeof shopActions;
  users: typeof users;
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
