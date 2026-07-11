import "server-only";

import {
  ZodArray,
  ZodBoolean,
  ZodEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodString,
  z,
} from "zod";

/**
 * Minimal Zod → JSON-Schema converter tailored to the shapes we send
 * to OpenAI's Structured Outputs. We deliberately keep this in-tree
 * (instead of pulling `zod-to-json-schema` as a dep) because we only
 * use a handful of primitives and want to emit the exact keys that
 * OpenAI's strict mode accepts:
 *
 *   - `additionalProperties: false` on every object
 *   - `required` listing every property (optional/nullable use `null`
 *     alongside their underlying type in the `type` union)
 *
 * If we ever outgrow this, swap in the npm package.
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  return convert(schema);
}

function convert(schema: z.ZodTypeAny): Record<string, unknown> {
  if (schema instanceof ZodString) return { type: "string" };
  if (schema instanceof ZodNumber) return { type: "number" };
  if (schema instanceof ZodBoolean) return { type: "boolean" };
  if (schema instanceof ZodEnum) {
    return { type: "string", enum: [...schema.options] };
  }
  if (schema instanceof ZodArray) {
    return { type: "array", items: convert(schema.element) };
  }
  if (schema instanceof ZodOptional) {
    // Represent optional properties by making them nullable — OpenAI
    // strict mode requires every property to be listed in `required`,
    // so we can't use JSON-Schema's own `required` omission here.
    const inner = convert(schema.unwrap());
    return unionWithNull(inner);
  }
  if (schema instanceof ZodNullable) {
    const inner = convert(schema.unwrap());
    return unionWithNull(inner);
  }
  if (schema instanceof ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = convert(value);
      required.push(key);
    }
    return {
      type: "object",
      additionalProperties: false,
      properties,
      required,
    };
  }
  throw new Error(`Unsupported Zod type: ${schema.constructor.name}`);
}

function unionWithNull(inner: Record<string, unknown>): Record<string, unknown> {
  if (Array.isArray(inner.type)) {
    if (!inner.type.includes("null")) inner.type.push("null");
    return inner;
  }
  if (typeof inner.type === "string") {
    return { ...inner, type: [inner.type, "null"] };
  }
  return { anyOf: [inner, { type: "null" }] };
}
