import { Data, type Types } from "effect";

export type Message = Data.TaggedEnum<{
  NewIssues: {
    issues: Array<string>;
    subscribers: Array<string>;
  };
}>;

export const Message = Data.taggedEnum<Message>();
export type MessageType = Types.Tags<Message>;
type ExtractMessage<T extends MessageType> = Types.ExtractTag<Message, T>;

export type NewIssueMessage = ExtractMessage<"NewIssues">;

export type MessageTypeToMessage = {
  NewIssueMessage: NewIssueMessage;
};
