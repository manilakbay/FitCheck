import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { serverEnv } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

function keyBuffer(): Buffer {
  const raw = serverEnv.AI_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "AI_ENCRYPTION_KEY is not configured. Set it in your environment (32 bytes base64) before using AI features.",
    );
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error("AI_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }
  return buf;
}

export interface EncryptedPayload {
  /** base64(ciphertext || auth-tag) — ciphertext followed by 16-byte auth tag. */
  ciphertext: string;
  /** base64(iv), 12 bytes. */
  iv: string;
}

/**
 * Encrypts a plaintext string with AES-256-GCM using a random 12-byte IV.
 * The 16-byte GCM authentication tag is appended to the ciphertext, giving
 * us authenticated encryption with associated data (AEAD) semantics.
 */
export function encryptSecret(plaintext: string): EncryptedPayload {
  if (!plaintext) throw new Error("Cannot encrypt an empty string.");
  const key = keyBuffer();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([enc, tag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

/**
 * Reverses {@link encryptSecret}. Throws if the ciphertext has been
 * tampered with (auth tag verification failure) or if the encryption
 * key has been rotated since the value was written.
 */
export function decryptSecret(payload: EncryptedPayload): string {
  if (!payload.ciphertext || !payload.iv) {
    throw new Error("Encrypted payload is missing ciphertext or IV.");
  }
  const key = keyBuffer();
  const iv = Buffer.from(payload.iv, "base64");
  if (iv.length !== IV_BYTES) {
    throw new Error(`Unexpected IV length: ${iv.length} (expected ${IV_BYTES}).`);
  }
  const combined = Buffer.from(payload.ciphertext, "base64");
  if (combined.length < 17) {
    throw new Error("Ciphertext is too short to contain an auth tag.");
  }
  const tag = combined.subarray(combined.length - 16);
  const enc = combined.subarray(0, combined.length - 16);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}

/** Extract the last N characters of a key for display purposes. */
export function keyLast4(key: string): string {
  const cleaned = key.trim();
  return cleaned.length <= 4 ? cleaned : cleaned.slice(-4);
}
