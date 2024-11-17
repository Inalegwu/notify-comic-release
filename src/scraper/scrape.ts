import { Duration, Effect, Layer, Schedule } from "effect";
import { CheerioClient } from "../clients/cheerio";
import { PubSubClient } from "../pub-sub";

const regexOld = /\w+(?: \w+)* \#\d+/g;
const regex = /[\w\s&]+ \#\d+/g;

const make = Effect.gen(function* () {
  const policy = Schedule.addDelay(Schedule.recurs(2), () => Duration.days(2));

  const effect = Effect.gen(function* () {
    const cheerio = yield* CheerioClient;

    const page = yield* cheerio.load(
      "https://comixnow.com/category/dc-weekly/",
    );

    const pubSub = yield* PubSubClient;

    const posts = page("div.tdb_module_loop").find("a");

    yield* Effect.forEach(
      posts,
      (post) =>
        Effect.gen(function* () {
          const href = page(post).attr("href");
          const title = page(post).text();

          if (href === "" || title === "" || href === undefined) {
            return;
          }

          if (title.split(":").length < 2) return;

          const date = title.match(/\b((\w{3,9})\s+\d{1,2},\s+\d{4})\b/)?.[0];
          const timestamp = Date.parse(date!);
          const isNew = Date.now() <= timestamp;

          if (!isNew) return;

          const newPage = yield* cheerio.load(href);
          const body = newPage("div.tdb-block-inner").find("p");

          const parsed = body
            .text()
            .split("\n")
            .map((v) => v.trim())
            .join("\n")
            .match(regex)
            ?.map((v) => v.trim());

          if (parsed === undefined) return;

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
