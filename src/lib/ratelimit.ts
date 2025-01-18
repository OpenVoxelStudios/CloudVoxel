import { Client } from "@libsql/client";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { eqLow, rateLimitTable } from "../../data/schema";
import { and } from "drizzle-orm";

/**
 *
 * @param limit How many requests are allowed for every duration
 * @param duration In how many seconds the limit will reset
 * @returns Promise<boolean>
 */
export default function rateLimit(
  db: LibSQLDatabase<Record<string, never>> & { $client: Client },
  ip: string,
  key: string,
  limit: number,
  duration: number,
): Promise<boolean> {
  const whereCondition = and(
    eqLow(rateLimitTable.ip, ip),
    eqLow(rateLimitTable.key, key),
  );

  return new Promise(async (resolve) => {
    const get = (await db
      .select()
      .from(rateLimitTable)
      .where(whereCondition)
      .get()) || {
      ip,
      key,
      limit: limit,
      reset: Date.now() + duration * 1000,
    };

    if (get.reset < Date.now()) {
      get.reset = Date.now() + duration * 1000;
      get.limit = limit;
    }
    if (get.limit > 0) get.limit--;

    await db
      .insert(rateLimitTable)
      .values({
        ip: get.ip,
        key: get.key,
        limit: get.limit,
        reset: get.reset,
      })
      .onConflictDoUpdate({
        target: [rateLimitTable.ip, rateLimitTable.key],
        set: {
          limit: get.limit,
          reset: get.reset,
        },
        where: whereCondition,
      })
      .run();

    return resolve(get.limit <= 0);
  });
}
