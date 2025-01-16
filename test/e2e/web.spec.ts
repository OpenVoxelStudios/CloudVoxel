import { db } from "@/../data/index";
import { eqLow, filesTable, usersTable } from "@/../data/schema";
import { test, expect } from "@playwright/test";
import { and } from "drizzle-orm";

test.describe('Full Web Test Suite', () => {
    const folderName = 'Test Folder';
    const file = {
        name: 'test file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Hello, World!'),
        rename: 'renamed file.txt',
    }

    test("Folder creation", async ({ page }) => {
        await page.goto('/dashboard');

        await page.getByRole('button', { name: 'Add Directory' }).click();
        await page.getByLabel('Name').fill(folderName);
        await page.getByRole('button', { name: 'Create Directory' }).click();
        await page.getByRole('link', { name: folderName }).click();

        await expect(page).toHaveURL(`/dashboard/${encodeURIComponent(folderName)}`);
    });

    test("File Upload", async ({ page }) => {
        await page.goto(`/dashboard/${encodeURIComponent(folderName)}`);

        await page.setInputFiles('input[type="file"]', {
            name: file.name,
            mimeType: file.mimeType,
            buffer: file.buffer,
        });
        await page.getByRole('heading', { name: file.name }).click({ button: 'right' });
        await page.getByRole('menuitem', { name: 'Rename' }).click();
        await page.getByLabel('Rename', { exact: true }).fill(file.rename);
        await page.getByRole('button', { name: 'Rename' }).click();

        await page.waitForSelector(`text=Renamed "${file.name}" to "${file.rename}".`, { strict: false });

        await expect(page.getByRole('heading', { name: file.rename })).toBeVisible();
    });

    test("File Renaming and Moving", async ({ page }) => {
        await page.goto(`/dashboard/${encodeURIComponent(folderName)}`);
        await page.waitForSelector('text="Loading...', { state: 'detached' });

        await page.getByRole('heading', { name: file.rename }).click({ button: 'right' });
        await page.getByRole('menuitem', { name: 'Move to' }).hover();
        await page.getByRole('menuitem', { name: 'Back' }).click();

        expect(await page.$(`text='Moved "${file.rename}" back.'`, { strict: false })).toBeDefined();
    });

    // test("Folder Deletion", async ({ page }) => {
    //     await page.goto(`/dashboard/`);
    //     await page.waitForSelector('data-test=fileitem', { state: 'detached' });

    //     const possible = await page.waitForSelector('data-test=fileitem', { strict: false, state: 'visible' });
    //     console.log(possible)

    //     expect(await page.$(`text='Deleted "${folderName}"'`, { strict: false })).toBeDefined();
    // });


    test('Cleanup', async ({ page }) => {
        await db.delete(usersTable).where(eqLow(usersTable.email, 'test@example.com')).run();

        await db.delete(filesTable).where(and(
            eqLow(filesTable.name, file.name),
            eqLow(filesTable.path, folderName),
        )).run();

        await db.delete(filesTable).where(and(
            eqLow(filesTable.name, file.rename),
            eqLow(filesTable.path, '/'),
        )).run();

        await db.delete(filesTable).where(and(
            eqLow(filesTable.name, folderName),
            eqLow(filesTable.path, '/'),
        )).run();
    });
});