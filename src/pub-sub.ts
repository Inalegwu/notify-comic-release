import { PubSub } from "effect";

export const issuePub = PubSub.bounded<string>(3);
