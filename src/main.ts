import { Layer } from "effect";
import { CheerioService } from "./cheerio/service";
import { BunRuntime } from "@effect/platform-bun";

const MainLive = Layer.mergeAll(CheerioService);

BunRuntime.runMain(Layer.launch(MainLive));
