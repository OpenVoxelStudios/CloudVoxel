import { hashPassword, verifyPassword } from "@/lib/crypto";
import { test, expect } from "@playwright/test";

test("password encryption test", async () => {
  const password = "ASecurePassword123!";

  const { hash, salt } = await hashPassword(password);

  expect(hash).toBeDefined();
  expect(salt).toBeDefined();

  const verified = await verifyPassword(password, hash, salt);
  expect(verified).toBe(true);

  const wrong = await verifyPassword("WrongPassword123!", hash, salt);
  expect(wrong).toBe(false);
});
