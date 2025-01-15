import { test, expect } from "@playwright/test";

test("folder creation", async ({ page }) => {
    await page.click('text=Add Directory');
    // Type name
    const folderName = 'Test Folder Name';
    await page.fill('input[id="folder-creation-name"]', folderName);
    // Submit
    await page.click('text=Create Directory');
    await page.locator(`#filelist :text("${folderName}")`).click();

    await expect(page).toHaveURL(`/dashboard/${encodeURIComponent(folderName)}`);
});