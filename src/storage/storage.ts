import { db } from "@/storage/database/db";
import { issue } from "@/storage/database/schema";
import { Hash } from "@disgruntleddevs/prelude";
import { Effect, Layer } from "effect";
import { PubSubClient } from "../pubsub/client";

const make = Effect.gen(function* () {
  const pubsub = yield* PubSubClient;

  const newIssue = yield* pubsub.subscribeTo("NewIssue");

  yield* Effect.forkScoped(
    Effect.forever(
      Effect.gen(function* () {
        const { issues, deliveryDate } = yield* newIssue.take;

        yield* Effect.logInfo({ issues, deliveryDate });

        yield* Effect.forEach(
          issues,
          (title) =>
            Effect.gen(function* () {
              const exists = yield* Effect.tryPromise(
                async () =>
                  await db.query.issue.findFirst({
                    where: (issue, { eq }) => eq(issue.issueTitle, title),
                  }),
              );

              if (exists) {
                yield* Effect.logInfo(
                  "This issue is already Saved and Awaiting publishing",
                );
                return;
              }

              yield* Effect.tryPromise(
                async () =>
                  await db.insert(issue).values({
                    id: Hash.randomuuid("issue", "-", 20),
                    issueTitle: title,
                    deliveryDate,
                  }),
              );

              yield* Effect.logInfo("Issues Saved for Notifying");
            }),
          {
            concurrency: "unbounded",
          },
        );
      }),
    ),
  );
});

export const Storage = {
  Live: Layer.scopedDiscard(make).pipe(Layer.provide(PubSubClient.live)),
};
