import { drizzle } from "drizzle-orm/libsql";
import config from "../config";

export const db = drizzle({
  connection: {
    url: config.database.file,
  },
});
