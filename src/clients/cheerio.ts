import { FetchHttpClient, HttpClient } from "@effect/platform";
import axios from "axios";
import * as cheerio from "cheerio";
import { Context, Data, Effect, Layer } from "effect";

class CheerioError extends Data.TaggedError("cheerio-error")<{
  cause: unknown;
}> {}

type ICheerioClient = Readonly<{
  load: (url: string) => Effect.Effect<cheerio.CheerioAPI, CheerioError, never>;
}>;

const make = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient;

  // loads page and provides cheerio
  // api for accessing page
  const load = (url: string) =>
    Effect.tryPromise({
      try: async () => {
        const page = await axios.get(url);

        return cheerio.load(page.data);
      },
      catch: (cause) => new CheerioError({ cause }),
    });

  return { load } satisfies ICheerioClient;
});

export class CheerioClient extends Context.Tag("cheerio-client")<
  CheerioClient,
  ICheerioClient
>() {
  static live = Layer.effect(this, make).pipe(
    Layer.provide(FetchHttpClient.layer),
  );
}
