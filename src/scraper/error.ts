import { Data } from "effect";

export class ScraperError extends Data.TaggedError("scraper-error")<{
  cause: unknown;
}> {}
