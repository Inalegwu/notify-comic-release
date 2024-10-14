import axios from "axios";
import { load, type CheerioAPI } from "cheerio";
import { Data, Effect } from "effect";

class CheerioResourceError extends Data.TaggedError("cheerio-resource-error")<{
	cause: unknown;
}> {}

type Cheerio = Readonly<{
	page: CheerioAPI;
	close: () => Promise<void>;
}>;

const getCheerio = async (url: string) => {
	const data = await axios.get(url);
	const page = load(data.data);

	return {
		page,
		close: () => new Promise((resolve) => resolve()),
	} satisfies Cheerio;
};

const acquire = Effect.tryPromise({
	try: () => getCheerio("https://comixnow.com").then((resource) => resource),
	catch: (error) => new CheerioResourceError({ cause: error }),
});

const release = (resource: Cheerio) => Effect.promise(() => resource.close());

export const resource = Effect.acquireRelease(acquire, release).pipe(
	Effect.annotateLogs({
		resource: "cheerio",
	}),
);
