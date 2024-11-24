import { BunRuntime } from "@effect/platform-bun";
import { Layer } from "effect";
import { NotifierService } from "./notifier/service";
import { ScraperService } from "./scraper/service";
import { StorageService } from "./storage/service";

const MainLive = Layer.mergeAll(
  ScraperService,
  NotifierService,
  StorageService,
);

BunRuntime.runMain(Layer.launch(MainLive));
