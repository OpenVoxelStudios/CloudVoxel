import * as crypto from "crypto";

const HASH_CONFIG = {
  iterations: 100000, // Number of iterations for PBKDF2
  keyLength: 64, // Length of the derived key in bytes
  digest: "sha512", // Hash algorithm to use
} as const;

/**
 * Generates a random salt for password hashing
 * @returns Promise<string> Base64 encoded salt
 */
function generateSalt(): string {
  const saltBytes = crypto.randomBytes(16);
  return saltBytes.toString("base64");
}

/**
 * Hashes a password using PBKDF2 with a random salt
 * @param password - The plain text password to hash
 * @returns Promise<{hash: string, salt: string}> Object containing the hash and salt
 */
function hashPassword(
  password: string,
): Promise<{ hash: string; salt: string }> {
  return new Promise((resolve, reject) => {
    const salt = generateSalt();

    crypto.pbkdf2(
      password,
      salt,
      HASH_CONFIG.iterations,
      HASH_CONFIG.keyLength,
      HASH_CONFIG.digest,
      (err, derivedKey) => {
        if (err) reject(err);
        resolve({
          hash: derivedKey.toString("base64"),
          salt: salt,
        });
      },
    );
  });
}

/**
 * Verifies a password against a stored hash and salt
 * @param password - The plain text password to verify
 * @param storedHash - The stored hash to compare against
 * @param storedSalt - The salt used to generate the stored hash
 * @returns Promise<boolean> True if the password matches, false otherwise
 */
function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      storedSalt,
      HASH_CONFIG.iterations,
      HASH_CONFIG.keyLength,
      HASH_CONFIG.digest,
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString("base64") === storedHash);
      },
    );
  });
}

export { hashPassword, verifyPassword };
