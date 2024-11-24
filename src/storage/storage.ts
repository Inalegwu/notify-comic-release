import { Effect, Layer } from "effect";
import { PubSubClient } from "../pubsub/client";

const make = Effect.gen(function* () {
  const pubsub = yield* PubSubClient;

  const saveListener = yield* pubsub.subscribeTo("SaveForDelivery");

  yield* Effect.forkScoped(
    Effect.forever(
      Effect.gen(function* () {
        const message = yield* saveListener.take;
      }),
    ),
  );
});

export const Storage = {
  Live: Layer.scopedDiscard(make).pipe(Layer.provide(PubSubClient.live)),
};
