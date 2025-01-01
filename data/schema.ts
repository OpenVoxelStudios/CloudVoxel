import { eq, sql, SQL, ilike as _ilike } from "drizzle-orm";
import { AnySQLiteColumn, index, int, primaryKey, SQLiteColumn, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const filesTable = sqliteTable("files", {
    name: text().notNull(),
    path: text().notNull(),
    size: text(),
    uploadedAt: int(),
    author: text(),
    directory: int().notNull(),
    hash: text(),
    code: text(),
}, (t) => [
    index('name').on(t.name),
    index('path').on(t.path),
    index('author').on(t.author),
    index('hash').on(t.hash),
    index('code').on(t.code),

    unique('fullpath').on(t.path, t.name),
    primaryKey({ name: 'fullpath', columns: [t.path, t.name] }),
]);

export const usersTable = sqliteTable("users", {
    email: text().notNull().primaryKey(),
    avatar: text().notNull(),
}, (t) => [
    index('email').on(lower(t.email)),
]);

export function lower(str: AnySQLiteColumn): SQL {
    return sql`lower(${str})`;
}

export function eqLow(left: SQLiteColumn, right: string): SQL {
    return eq(lower(left), right.toLowerCase());
}

export function ilike(
    column: Parameters<typeof _ilike>[0],
    value: Parameters<typeof _ilike>[1],
) {
    return sql`${column} LIKE ${value} COLLATE NOCASE`;
}