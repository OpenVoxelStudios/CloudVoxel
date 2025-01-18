import { eq, sql, SQL, ilike as _ilike } from "drizzle-orm";
import {
  AnySQLiteColumn,
  index,
  int,
  primaryKey,
  SQLiteColumn,
  sqliteTable,
  text,
  unique,
  integer,
} from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const filesTable = sqliteTable(
  "files",
  {
    name: text().notNull(),
    path: text().notNull(),
    size: text(),
    uploadedAt: int(),
    author: text().notNull(),
    directory: int().notNull(),
    hash: text(),
    code: text(),
    partition: text(),
  },
  (t) => [
    index("name").on(t.name),
    index("path").on(t.path),
    index("author").on(t.author),
    index("hash").on(t.hash),
    index("code").on(t.code),
    index("partition").on(t.partition),

    unique("fullpath").on(t.path, t.name, t.partition),
    primaryKey({ name: "fullpath", columns: [t.path, t.name, t.partition] }),
  ],
);

export const apiKeysTable = sqliteTable(
  "apiKeys",
  {
    key: text().notNull().primaryKey(),
    name: text().notNull().unique(),
    permissions: text().notNull(),
  },
  (t) => [index("key").on(lower(t.key))],
);

export const groupsTable = sqliteTable(
  "groups",
  {
    name: text().notNull().primaryKey(),
    displayName: text().notNull(),
    users: text().notNull().default(""),
  },
  (t) => [
    index("group").on(lower(t.name)),
    index("group_users").on(lower(t.users)),
  ],
);

export const usersTable = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text().notNull().unique(),
    name: text().notNull().unique(),
    image: text(),
    emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
    password: text(),
    salt: text(),
  },
  (t) => [index("email").on(lower(t.email))],
);

export const accountsTable = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessionsTable = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const authenticatorsTable = sqliteTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp", {
      mode: "boolean",
    }).notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  ],
);

export const rateLimitTable = sqliteTable(
  "rateLimit",
  {
    ip: text("ip").notNull(),
    key: text("key").notNull(),
    limit: integer("limit").notNull(),
    reset: integer("reset").notNull(),
  },
  (t) => [primaryKey({ columns: [t.ip, t.key] })],
);

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
