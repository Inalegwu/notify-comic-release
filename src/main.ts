import { Effect } from "effect";
import { notifier } from "./notifier/scope";

Effect.runPromise(notifier);
