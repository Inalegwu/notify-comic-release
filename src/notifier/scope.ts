import { Duration, Effect, Schedule } from "effect";
import { resource } from "../cheerio/resource";

const make = Effect.repeat(
	Effect.gen(function* () {
		const { page } = yield* resource;

		const links = page("div.tdb_module_loop").find("a");
	}),
	Schedule.duration(Duration.millis(1000)),
).pipe(
	Effect.annotateLogs({
		module: "notifier",
	}),
);

export const notifier = Effect.scoped(make);
