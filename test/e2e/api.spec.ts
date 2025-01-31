import { db } from "@/../data/index";
import { apiKeysTable, eqLow } from "@/../data/schema";
import { test, expect } from "@playwright/test";
import { baseURL } from "../../playwright.config";

test.describe("Full Web Test Suite", () => {
  const folderName = "Test Folder";
  const file = {
    name: "test file.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Hello, World!"),
    rename: "renamed file.txt",
  };
  const API_KEY = "01234567-8901-2345-6789-012345678901";

  test("Folder creation", async () => {
    const answ = await (
      await fetch(
        `${baseURL}/api/dashboard/${encodeURIComponent(folderName)}?folder=true`,
        {
          method: "POST",
          headers: {
            Authorization: API_KEY,
            Accept: "application/json",
          },
        },
      )
    ).json();

    expect(answ.success).toBe(true);
  });

  test("File Upload", async () => {
    const answ = await (
      await fetch(
        `${baseURL}/api/dashboard/${encodeURIComponent(folderName)}`,
        {
          method: "POST",
          headers: {
            Authorization: API_KEY,
            Accept: "application/json",
          },
          body: (() => {
            const form = new FormData();
            form.append(
              "file",
              new Blob([file.buffer], { type: file.mimeType }),
              file.name,
            );
            return form;
          })(),
        },
      )
    ).json();

    expect(answ.success).toBe(true);
  });

  test("File Renaming", async () => {
    const answ = await (
      await fetch(
        `${baseURL}/api/dashboard/${encodeURIComponent(folderName)}/${encodeURIComponent(file.name)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: API_KEY,
            Accept: "application/json",
            "PATCH-rename": file.rename,
          },
        },
      )
    ).json();

    expect(answ.success).toBe(true);
  });

  test("File Moving", async () => {
    const answ = await (
      await fetch(
        `${baseURL}/api/dashboard/${encodeURIComponent(folderName)}/${encodeURIComponent(file.rename)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: API_KEY,
            Accept: "application/json",
            "PATCH-move": "../",
          },
        },
      )
    ).json();

    expect(answ.success).toBe(true);
  });

  test("File Fetching", async () => {
    const answ = await (
      await fetch(`${baseURL}/api/dashboard/`, {
        method: "GET",
        headers: {
          Authorization: API_KEY,
          Accept: "application/json",
        },
      })
    ).json();

    expect(answ.length).toBeGreaterThanOrEqual(2);
  });

  test("File Sharing", async () => {
    const answ = await (
      await fetch(
        `${baseURL}/api/sharelink/${encodeURIComponent(file.rename)}`,
        {
          method: "GET",
          headers: {
            Authorization: API_KEY,
            Accept: "application/json",
          },
        },
      )
    ).json();

    expect(answ.name).toBe(file.rename);
    expect(answ.hash).toBeDefined();
    expect(answ.code).toBeDefined();

    const answ2 = await fetch(
      `${baseURL}/api/share/${encodeURIComponent(file.rename)}?download=true&code=${encodeURIComponent(answ.code)}&hash=${encodeURIComponent(answ.hash)}`,
      {
        method: "GET",
        headers: {
          Authorization: API_KEY,
          Accept: "application/octet-stream",
        },
      },
    );

    expect(answ2.status).toBe(200);
  });

  test("File and Folder Deletion", async () => {
    const answ = await (
      await fetch(
        `${baseURL}/api/dashboard/${encodeURIComponent(folderName)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: API_KEY,
            Accept: "application/json",
          },
        },
      )
    ).json();

    expect(answ.success).toBe(true);

    const answ2 = await (
      await fetch(
        `${baseURL}/api/dashboard/${encodeURIComponent(file.rename)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: API_KEY,
            Accept: "application/json",
          },
        },
      )
    ).json();

    expect(answ2.success).toBe(true);
  });

  test("Cleanup", async () => {
    await db.delete(apiKeysTable).where(eqLow(apiKeysTable.key, API_KEY)).run();
  });
});
