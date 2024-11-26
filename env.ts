import { cleanEnv, str } from "envalid";

export const Env = cleanEnv(process.env, {
  DB_FILE: str({ default: "newComics.db" }),
});
