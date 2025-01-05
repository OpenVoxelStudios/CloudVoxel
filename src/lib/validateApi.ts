'use server';

import { db } from "@/../data/index";
import { apiKeysTable, eqLow } from "@/../data/schema";

const apiScopes = ['files.*', 'files.share', 'files.delete', 'files.edit', 'files.get'] as const;

/**
 * @param requiredScopes Only one of the scopes in the array is required to pass
 */
export default async function validateApi(token: string, requiredScopes: (typeof apiScopes[number])[]): Promise<boolean> {
    const apiKey = await db.select().from(apiKeysTable).where(eqLow(apiKeysTable.key, token)).get();
    if (!apiKey) return false;
    
    return !!requiredScopes.find(scope => apiKey.permissions.split(',').includes(scope));
}