/**
 * AI service surface. Nothing in this folder should be imported outside of
 * server-only contexts once a real provider (e.g. OpenAI) is wired in.
 *
 * TODO(ai): Wire up OpenAI or another LLM provider. See individual parsers
 * for details on the expected contract.
 */

export * from "./types";
export * from "./errors";
export { mealParser } from "./mealParser";
export { activityParser } from "./activityParser";
