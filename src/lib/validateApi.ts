"use server";

import { db } from "@/../data/index";
import { apiKeysTable, eqLow } from "@/../data/schema";
import config from "@/../config";

/**
 * @param requiredScopes Only one of the scopes in the array is required to pass
 */
export default async function validateApi(
  token: string,
  requiredScopes: (
    | "files:*"
    | "files:share"
    | "files:delete"
    | "files:edit"
    | "files:get"
  )[],
): Promise<boolean> {
  if (!config.enableAPI) return false;
  const apiKey = await db
    .select()
    .from(apiKeysTable)
    .where(eqLow(apiKeysTable.key, token))
    .get();
  if (!apiKey) return false;

  return !!requiredScopes.find((scope) =>
    apiKey.permissions.split(",").includes(scope),
  );
}
