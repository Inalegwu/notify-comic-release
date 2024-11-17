import { Effect, Layer } from "effect";
import { Scraper } from "./scrape";

const make = Effect.gen(function* () {
  yield* Effect.logInfo("Starting Scraper Service");

  yield* Effect.acquireRelease(Effect.logInfo("Started Scraper Service"), () =>
    Effect.logInfo("Stopped Scraper Service"),
  );
}).pipe(
  Effect.annotateLogs({
    service: "scraper",
  }),
);

export const ScraperService = Layer.scopedDiscard(make).pipe(
  Layer.provide(Scraper.Live),
);
