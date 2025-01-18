import config from "../../config";
import { db } from "../../data/index";
import { apiKeysTable, usersTable } from "../../data/schema";
import { hashPassword } from "@/lib/crypto";
import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  if (!config.credentialLogin)
    throw new Error("Credential login must be enabled for testing");
  if (!config.enableAPI) throw new Error("API must be enabled for testing");

  const userPassword = await hashPassword("ASecurePassword123!");
  await db
    .insert(usersTable)
    .values({
      email: "test@example.com",
      name: "Test User",
      password: userPassword.hash,
      salt: userPassword.salt,
    })
    .onConflictDoNothing();

  await db
    .insert(apiKeysTable)
    .values({
      name: "testkey",
      key: "01234567-8901-2345-6789-012345678901",
      permissions: "files:*",
    })
    .onConflictDoNothing();

  await page.goto("/");
  await page.getByRole("button", { name: "Open Dashboard" }).click();
  await page.waitForURL("/login");

  await page.fill('input[id="credentials-email"]', "test@example.com");
  await page.fill('input[id="credentials-password"]', "ASecurePassword123!");
  await page.getByRole("button", { name: "Sign in with Email" }).click();

  await expect(page).toHaveURL("/dashboard");
  await page.context().storageState({ path: __dirname + "/storage.json" });
});
