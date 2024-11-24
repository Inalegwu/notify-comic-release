import { FileSystem } from "@effect/platform";
import { BunFileSystem } from "@effect/platform-bun";
import { Effect, Layer, Queue } from "effect";
import { PubSubClient } from "../pubsub/client";
import { Message } from "../pubsub/message";

const make = Effect.gen(function* () {
  const pubSub = yield* PubSubClient;

  const issueSubscriber = yield* pubSub.subscribeTo("NewIssue");
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.forkDaemon(
    Effect.forever(
      Effect.gen(function* (_) {
        const { issues, deliveryDate } = yield* Queue.take(issueSubscriber);

        const today = new Date();

        if (deliveryDate !== today) {
          yield* pubSub.publish(
            Message.SaveForDelivery({
              date: deliveryDate,
              issues,
            }),
          );
          return;
        }

        yield* Effect.logInfo(
          `Attempting to Notify of ${issues.length} Issues`,
        );

        yield* fs.writeFileString(
          "./issues.json",
          JSON.stringify(issues, null, 2),
        );

        yield* Effect.try(() =>
          console.log(`Successfully Notified of ${issues.length} Issues`),
        );
      }),
    ),
  );
});

export const Notifier = {
  Live: Layer.scopedDiscard(make).pipe(
    Layer.provide(PubSubClient.live),
    Layer.provide(BunFileSystem.layer),
  ),
};
