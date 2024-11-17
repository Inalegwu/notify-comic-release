import { BunRuntime } from "@effect/platform-bun";
import { Layer } from "effect";
import { NotifierService } from "./notifier/service";
import { ScraperService } from "./scraper/service";

const MainLive = Layer.mergeAll(ScraperService, NotifierService);

BunRuntime.runMain(Layer.launch(MainLive));
