import crypto from "crypto";

// AES-256-GCM encryption for secrets
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

// Get or create encryption key from environment or generate a machine-specific one
function getEncryptionKey(): Buffer {
  // Use BUNKER_SECRET_KEY if provided
  const envKey = process.env.BUNKER_SECRET_KEY;
  if (envKey) {
    // Hash the provided key to ensure it's the right length
    return crypto.createHash("sha256").update(envKey).digest();
  }

  // Generate a machine-specific key based on available system info
  // This provides basic protection while keeping the app portable
  const machineId = [
    process.env.COMPUTERNAME || process.env.HOSTNAME || "unknown",
    process.env.USERNAME || process.env.USER || "user",
    __dirname,
  ].join("|");

  return crypto.createHash("sha256").update(machineId).digest();
}

export interface EncryptedData {
  encrypted: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded IV
  authTag: string; // Base64 encoded auth tag
}

/**
 * Encrypt a string value using AES-256-GCM
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Combine IV, auth tag, and encrypted data into a single string
  // Format: base64(iv):base64(authTag):base64(encrypted)
  const result: EncryptedData = {
    encrypted,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };

  return JSON.stringify(result);
}

/**
 * Decrypt an encrypted string using AES-256-GCM
 */
export function decrypt(encryptedJson: string): string {
  const key = getEncryptionKey();

  let data: EncryptedData;
  try {
    data = JSON.parse(encryptedJson);
  } catch {
    throw new Error("Invalid encrypted data format");
  }

  const { encrypted, iv, authTag } = data;

  if (!encrypted || !iv || !authTag) {
    throw new Error("Missing encryption components");
  }

  const ivBuffer = Buffer.from(iv, "base64");
  const authTagBuffer = Buffer.from(authTag, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTagBuffer);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Check if a value can be decrypted (valid encrypted format)
 */
export function isValidEncrypted(value: string): boolean {
  try {
    const data = JSON.parse(value);
    return !!(data.encrypted && data.iv && data.authTag);
  } catch {
    return false;
  }
}

/**
 * Generate a random secret key
 */
export function generateSecretKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString("base64");
}
