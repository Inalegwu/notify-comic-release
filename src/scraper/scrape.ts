import { Duration, Effect, Layer, Option, Schedule } from "effect";
import { CheerioClient } from "../clients/cheerio";
import { PubSubClient } from "../pubsub/client";

const regexOld = /\w+(?: \w+)* \#\d+/g;
const regex = /[\w\s&]+ \#\d+/g;

const make = Effect.gen(function* () {
  const policy = Schedule.addDelay(Schedule.recurs(2), () => Duration.days(2));
  const pubSub = yield* PubSubClient;

  const effect = Effect.gen(function* () {
    const cheerio = yield* CheerioClient;

    yield* Effect.logInfo("Attempting to load url");
    const page = yield* cheerio.load(
      "https://comixnow.com/category/dc-weekly/",
    );

    yield* Effect.logInfo("Parsing Posts");
    const posts = page("div.tdb_module_loop").find("a");

    yield* Effect.logInfo("Processing Posts");
    yield* Effect.forEach(
      posts,
      (post) =>
        Effect.gen(function* () {
          const href = yield* Option.fromNullable(page(post).attr("href"));
          const title = yield* Option.fromNullable(page(post).text());

          yield* Effect.logInfo(`Found post ${title} at ${href}`);

          if (title.split(":").length < 2) return;

          const date = yield* Option.fromNullable(
            title.match(/\b((\w{3,9})\s+\d{1,2},\s+\d{4})\b/)?.[0],
          );
          const timestamp = Date.parse(date);
          const isNew = Date.now() <= timestamp;

          if (!isNew) return;

          yield* Effect.logInfo(`Reading Page '${title}'`);

          const newPage = yield* cheerio.load(href);
          const body = newPage("div.tdb-block-inner").find("p");

          const parsed = yield* Option.fromNullable(
            body
              .text()
              .split("\n")
              .map((v) => v.trim())
              .join("\n")
              .match(regex)
              ?.map((v) => v.trim()),
          );

          if (parsed === undefined) return;

          yield* Effect.logInfo(`Found ${parsed.length} Issues`);

          yield* pubSub.publish(parsed);
        }),
      {
        concurrency: "unbounded",
      },
    );
  });

  yield* Effect.forkDaemon(Effect.repeat(effect, policy));
});

export const Scraper = {
  Live: Layer.scopedDiscard(make).pipe(
    Layer.provide(CheerioClient.live),
    Layer.provide(PubSubClient.live),
  ),
};
