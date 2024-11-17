import { Effect, Layer } from "effect";

const make = Effect.gen(function* () {
	yield* Effect.logInfo("Starting Notifier Service");

	yield* Effect.acquireRelease(Effect.logInfo("Started Notifier Service"), () =>
		Effect.logInfo("Stopped Notifier Service"),
	);
});

export const NotifierService = Layer.scopedDiscard(make).pipe();
