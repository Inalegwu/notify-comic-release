import { Context, Effect, Layer, PubSub, type Queue, type Scope } from "effect";

type IPubSubClient = Readonly<{
  publish: (message: string[]) => Effect.Effect<boolean>;
  unsafePublish: (message: string[]) => boolean;
  subscribe: () => Effect.Effect<Queue.Dequeue<string[]>, never, Scope.Scope>;
}>;

const make = Effect.gen(function* () {
  const pubSub: PubSub.PubSub<string[]> = yield* Effect.acquireRelease(
    PubSub.unbounded<string[]>().pipe(
      Effect.tap(Effect.logInfo("PubSub Started")),
    ),
    (queue) =>
      PubSub.shutdown(queue).pipe(Effect.tap(Effect.logInfo("PubSub Stopped"))),
  );

  return PubSubClient.of({
    publish: (message) => PubSub.publish(pubSub, message),
    unsafePublish: (message) => pubSub.unsafeOffer(message),
    subscribe: () => PubSub.subscribe(pubSub),
  });
}).pipe(
  Effect.annotateLogs({
    module: "pubsub-client",
  }),
);

export class PubSubClient extends Context.Tag("pubsub-client")<
  PubSubClient,
  IPubSubClient
>() {
  static live = Layer.scoped(this, make);
}
