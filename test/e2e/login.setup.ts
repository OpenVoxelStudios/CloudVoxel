import config from "../../config";
import { db } from "../../data/index";
import { usersTable } from "../../data/schema";
import { hashPassword } from "@/lib/crypto";
import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
    if (!config.credentialLogin) throw new Error("Credential login must be enabled for testing");
    if (!config.enableAPI) throw new Error("API must be enabled for testing");

    const userPassword = await hashPassword('ASecurePassword123!');
    await db.insert(usersTable).values({
        email: 'test@example.com',
        name: 'Test User',
        password: userPassword.hash,
        salt: userPassword.salt,
    }).onConflictDoNothing()


    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto("/");
    // Find an element with the text 'Open Dashboard' and click on it
    await page.click("text=Open Dashboard");
    await page.waitForURL('/login');
    // Fill the form with the credentials
    await page.fill('input[id="credentials-email"]', 'test@example.com');
    await page.fill('input[id="credentials-password"]', 'ASecurePassword123!');
    // Submit the form
    await page.click('text=Sign in with Email');

    await expect(page).toHaveURL('/dashboard');
});