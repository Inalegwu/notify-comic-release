import { PubSub } from "effect";

export const issuePub = PubSub.sliding<string>(3);
