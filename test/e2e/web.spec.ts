import { test, expect } from "@playwright/test";

test("full web test suite", async ({ page }) => {
    // ? LOGIN TEST
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
    // * LOGIN WORKS

    // ? FOLDER CREATION TEST
    await page.click('text=Add Directory');
    // Type name
    const folderName = 'Test Folder Name';
    await page.fill('input[id="folder-creation-name"]', folderName);
    // Submit
    await page.click('text=Create Directory');
    await page.locator(`#filelist :text("${folderName}")`).click();

    await expect(page).toHaveURL(`/dashboard/${encodeURIComponent(folderName)}`);
    // * FOLDER CREATION WORKS
});