import { index, int, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const filesTable = sqliteTable("files", {
    name: text().notNull(),
    path: text().notNull(),
    size: text(),
    uploadedAt: int(),
    author: text(),
    directory: int().notNull(),
}, (t) => [
    index('name').on(t.name),
    index('path').on(t.path),
    index('author').on(t.author),

    unique('fullpath').on(t.path, t.name),
    primaryKey({ name: 'fullpath', columns: [t.path, t.name] }),
]);

export const usersTable = sqliteTable("users", {
    email: text().notNull().primaryKey(),
    avatar: text().notNull(),
}, (t) => [
    index('email').on(t.email),
]);