import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const issue = sqliteTable("issues", {
  id: text("id").unique().notNull().primaryKey(),
  issueTitle: text("issueTitle").unique(),
  deliveryDate: integer({ mode: "timestamp" }),
});
