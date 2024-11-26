import { Env } from "@env";
import { Database } from "bun:sqlite";
import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schema";

const sqlite = new Database(Env.DB_FILE);

export const db = drizzle(sqlite, { schema });

await migrate(db, { migrationsFolder: "drizzle" });
