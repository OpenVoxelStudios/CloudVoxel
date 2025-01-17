import { db } from "@/../data/index";
import { apiKeysTable, eqLow, usersTable } from "@/../data/schema";
import { test, expect } from "@playwright/test";
import { baseURL } from "../../playwright.config";

test.describe('Full Web Test Suite', () => {
    const folderName = 'Test Folder';
    const file = {
        name: 'test file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Hello, World!'),
        rename: 'renamed file.txt',
    }
    const API_KEY = '01234567-8901-2345-6789-012345678901';

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

    test('File Fetching', async () => {
        const answ = await (await fetch(`${baseURL}/api/dashboard/`, {
            method: 'GET',
            headers: {
                'Authorization': API_KEY,
                'Accept': 'application/json',
            },
        })).json();

        expect(answ.length).toBeGreaterThanOrEqual(2);
    });

    test("File Sharing", async () => {
        const answ = await (await fetch(`${baseURL}/api/sharelink/${encodeURIComponent(file.rename)}`, {
            method: 'GET',
            headers: {
                'Authorization': API_KEY,
                'Accept': 'application/json',
            },
        })).json();

        expect(answ.name).toBe(file.rename);
        expect(answ.hash).toBeDefined();
        expect(answ.code).toBeDefined();

        const answ2 = await fetch(`${baseURL}/api/share/${encodeURIComponent(file.rename)}?download=true&code=${encodeURIComponent(answ.code)}&hash=${encodeURIComponent(answ.hash)}`, {
            method: 'GET',
            headers: {
                'Authorization': API_KEY,
                'Accept': 'application/octet-stream',
            },
        });

        expect(answ2.status).toBe(200);
    });

    test("File and Folder Deletion", async () => {
        const answ = await (await fetch(`${baseURL}/api/dashboard/${encodeURIComponent(folderName)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': API_KEY,
                'Accept': 'application/json',
            },
        })).json();

        expect(answ.success).toBe(true);

        const answ2 = await (await fetch(`${baseURL}/api/dashboard/${encodeURIComponent(file.rename)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': API_KEY,
                'Accept': 'application/json',
            },
        })).json();

        expect(answ2.success).toBe(true);
    });


    test('Cleanup', async () => {
        await db.delete(usersTable).where(eqLow(usersTable.email, 'test@example.com')).run();
        await db.delete(apiKeysTable).where(eqLow(apiKeysTable.key, API_KEY)).run();
    });
});