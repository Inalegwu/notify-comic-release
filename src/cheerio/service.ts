import { Effect, Layer } from "effect";
import { CheerioClient } from "./client";

const make = Effect.gen(function* () {
	yield* Effect.logInfo("Starting Cheerio Service");

	yield* Effect.acquireRelease(Effect.logInfo("Cheerio service started"), () =>
		Effect.logInfo("Cheerio Service Stopped"),
	);
});

export const CheerioService = Layer.scopedDiscard(make).pipe(
	Layer.provide(CheerioClient.live),
);
