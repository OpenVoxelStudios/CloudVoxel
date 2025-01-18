import { defineConfig } from "drizzle-kit";
import config from "./config";

export default defineConfig({
  out: "./drizzle",
  schema: "./data/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: config.database.file,
  },
});
