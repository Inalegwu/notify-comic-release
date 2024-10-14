import { Duration, Effect, Schedule, Supervisor } from "effect";
import { resource } from "../cheerio/resource";

const repeat = Effect.forever(
	Effect.gen(function* () {
		const supervisor = yield* Supervisor.track;

		const { page } = yield* resource.pipe(Effect.supervised(supervisor));

		const links = page("div.tdb_module_loop").find("a");

		yield* Effect.logInfo("hmmm...");
	}),
);

const make = Effect.repeat(
	repeat,
	Schedule.duration(Duration.seconds(10)),
).pipe(
	Effect.annotateLogs({
		scope: "notifier",
	}),
);

export const notifier = Effect.scoped(make);
