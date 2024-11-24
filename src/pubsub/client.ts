import { Context, Effect, Layer, PubSub, Queue, type Scope } from "effect";
import type { Message, MessageType, MessageTypeToMessage } from "./message";

type IPubSubClient = Readonly<{
  publish: (message: Message) => Effect.Effect<boolean>;
  unsafePublish: (message: Message) => boolean;
  subscribe: () => Effect.Effect<Queue.Dequeue<Message>, never, Scope.Scope>;
  subscribeTo: <T extends MessageType>(
    messageType: T,
  ) => Effect.Effect<
    Queue.Dequeue<MessageTypeToMessage[T]>,
    never,
    Scope.Scope
  >;
}>;

const make = Effect.gen(function* () {
  const pubSub: PubSub.PubSub<Message> = yield* Effect.acquireRelease(
    PubSub.unbounded<Message>().pipe(
      Effect.tap(Effect.logInfo("Message Bus Started")),
    ),
    (queue) =>
      PubSub.shutdown(queue).pipe(
        Effect.tap(Effect.logInfo("Message Bus Stopped")),
      ),
  );

  return PubSubClient.of({
    publish: (message) => PubSub.publish(pubSub, message),
    unsafePublish: (message) => pubSub.unsafeOffer(message),
    subscribe: () => PubSub.subscribe(pubSub),
    subscribeTo: <T extends MessageType>(messageType: T) =>
      Effect.gen(function* () {
        const queue = yield* Effect.acquireRelease(
          Queue.unbounded<MessageTypeToMessage[T]>(),
          (queue) => Queue.shutdown(queue),
        );

        const subscription = yield* PubSub.subscribe(pubSub);

        function predicate(
          message: Message,
        ): message is MessageTypeToMessage[T] {
          return message._tag === messageType;
        }

        yield* Effect.forkScoped(
          Effect.forever(
            Effect.gen(function* () {
              const message = yield* subscription.take;

              if (predicate(message)) {
                yield* Queue.offer(queue, message);
              }
            }),
          ),
        );

        return queue;
      }),
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
