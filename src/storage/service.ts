import { Effect, Layer } from "effect";
import { Storage } from "./storage";

const make = Effect.gen(function* () {
  yield* Effect.logInfo("Starting Storage Service");

  yield* Effect.acquireRelease(Effect.logInfo("Started Storage Service"), () =>
    Effect.logInfo("Stopped Storage Service"),
  );
}).pipe(
  Effect.annotateLogs({
    service: "storage",
  }),
);

export const StorageService = Layer.scopedDiscard(make).pipe(
  Layer.provide(Storage.Live),
);
