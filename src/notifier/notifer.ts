import { PubSubClient } from "@/pubsub/client";
import { db } from "@/storage/database/db";
import { BunFileSystem } from "@effect/platform-bun";
import { Effect, Layer, Schedule } from "effect";

const make = Effect.gen(function* () {
  const pubSub = yield* PubSubClient;
  const policy = Schedule.exponential("2000 millis");

  yield* Effect.forkDaemon(
    Effect.schedule(
      Effect.gen(function* (_) {
        const issues = yield* Effect.tryPromise(
          async () =>
            await db.query.issue.findMany({
              where: (issue, { eq }) => eq(issue.deliveryDate, new Date()),
            }),
        );

        if (issues.length === 0) {
          yield* Effect.logInfo("No Issues To Be Delivered Today");
          return;
        }

        yield* Effect.forEach(issues, (issue) =>
          Effect.gen(function* () {
            yield* Effect.logInfo(`${issue} is to be published today`);
          }),
        );
      }),
      policy,
    ),
  );
});

export const Notifier = {
  Live: Layer.scopedDiscard(make).pipe(
    Layer.provide(PubSubClient.live),
    Layer.provide(BunFileSystem.layer),
  ),
};
