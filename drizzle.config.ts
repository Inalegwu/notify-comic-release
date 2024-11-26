import { Env } from "@env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/storage/database/schema.ts",
  dbCredentials: {
    url: Env.DB_FILE,
  },
});
