import { FileSystem } from "@effect/platform";
import { BunFileSystem } from "@effect/platform-bun";
import { Effect, Layer, Queue } from "effect";
import { PubSubClient } from "../pub-sub";

const make = Effect.gen(function* () {
  const pubSub = yield* PubSubClient;

  const issueSubscriber = yield* pubSub.subscribe();
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.forkDaemon(
    Effect.forever(
      Effect.gen(function* (_) {
        const message = yield* Queue.take(issueSubscriber);

        yield* Effect.logInfo(message);

        const issues = message.map((issue) => ({ issue: issue }));

        yield* fs.writeFileString(
          "./issues.json",
          JSON.stringify(issues, null, 2),
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
