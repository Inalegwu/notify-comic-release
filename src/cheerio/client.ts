import { Context, Data, Effect, Layer } from "effect";
import type { CheerioAPI } from "cheerio";
import { HttpClient } from "@effect/platform";
import { load } from "cheerio";
import axios from "axios";

class CheerioError extends Data.TaggedError("cheerio-error")<{
	cause: unknown;
}> {}

type ICheerioClient = Readonly<{
	loadFromUrl: (url: string) => Effect.Effect<CheerioAPI, CheerioError>;
}>;

const make = Effect.gen(function* () {
	const loadFromUrl = (url: string) =>
		Effect.tryPromise({
			try: async () => {
				const page = await axios.get(url);

				return load(page.data);
			},
			catch: (error) => new CheerioError({ cause: error }),
		});

	return { loadFromUrl } satisfies ICheerioClient;
});

export class CheerioClient extends Context.Tag("cheerio-client")<
	CheerioClient,
	ICheerioClient
>() {
	static live = Layer.effect(this, make);
}
