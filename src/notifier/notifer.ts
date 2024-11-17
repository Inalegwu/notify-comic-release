import { Effect, Layer, PubSub, Queue } from "effect";
import { issuePub } from "../pub-sub";

const make = Effect.gen(function* () {
  const issuePublisher = yield* issuePub;
  const issueSubscriber = yield* PubSub.subscribe(issuePublisher);

  const issue = yield* Queue.take(issueSubscriber);

  yield* Effect.logInfo("issue:", issue);
});

export const Notifier = {
  Live: Layer.scopedDiscard(make),
};
