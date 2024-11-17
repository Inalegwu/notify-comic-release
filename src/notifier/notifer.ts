import { Effect, Layer } from "effect";

const make = Effect.gen(function* () {
  yield* Effect.acquireRelease(Effect.logInfo("Notifier Active"), () =>
    Effect.logInfo("Deactivated Notifier"),
  );
});

export const Notifier = {
  Live: Layer.scopedDiscard(make),
};
