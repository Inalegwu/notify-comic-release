import { Effect, Layer } from "effect";
import { Notifier } from "./notifer";

const make = Effect.gen(function* () {
  yield* Effect.logInfo("Starting Notifier Service");

  yield* Effect.acquireRelease(Effect.logInfo("Started Notifier Service"), () =>
    Effect.logInfo("Stopped Notifier Service"),
  );
}).pipe(
  Effect.annotateLogs({
    service: "notifier",
  }),
);

export const NotifierService = Layer.scopedDiscard(make).pipe(
  Layer.provide(Notifier.Live),
);
