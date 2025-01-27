import config from "../../config";
import { db } from "../../data/index";
import { apiKeysTable } from "../../data/schema";
import { test as setup } from "@playwright/test";

setup("authenticate", async () => {
  if (!config.enableAPI) throw new Error("API must be enabled for testing");

  await db
    .insert(apiKeysTable)
    .values({
      name: "testkey",
      key: "01234567-8901-2345-6789-012345678901",
      permissions: "files:*",
    })
    .onConflictDoNothing();
});
