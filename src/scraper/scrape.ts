import { Effect, Layer } from "effect";
import { CheerioClient } from "../clients/cheerio";

const regexOld = /\w+(?: \w+)* \#\d+/g;
const regex = /[\w\s&]+ \#\d+/g;

const make = Effect.gen(function* () {
	const fiber = yield* Effect.fork(
		Effect.gen(function* () {
			const cheerio = yield* CheerioClient;

			const page = yield* cheerio.load(
				"https://comixnow.com/category/dc-weekly/",
			);

			const posts = page("div.tdb_module_loop").find("a");

			yield* Effect.forEach(
				posts,
				(post) =>
					Effect.gen(function* () {
						const href = page(post).attr("href");
						const title = page(post).text();

						yield* Effect.logInfo({ href, title });

						if (href === "" || title === "" || href === undefined) {
							yield* Effect.logInfo("No Post found");
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

						yield* Effect.logInfo(parsed);
					}),
				{
					concurrency: "unbounded",
				},
			);
		}),
	);

	yield* Effect.acquireRelease(Effect.logInfo("Started Scraper"), () =>
		Effect.logInfo("Stopped Scraper"),
	);
}).pipe(
	Effect.annotateLogs({
		service: "scraper",
	}),
);

export const Scraper = {
	Live: Layer.scopedDiscard(make).pipe(Layer.provide(CheerioClient.live)),
};
