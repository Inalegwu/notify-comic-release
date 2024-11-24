import { Data, type Types } from "effect";

export type Message = Data.TaggedEnum<{
  NewIssue: {
    issues: Array<string>;
    deliveryDate: Date;
  };
  DeliverPayload: {
    date: Date;
    subscribers: Array<string>;
  };
  SaveForDelivery: {
    date: Date;
    issues: Array<string>;
  };
}>;

export const Message = Data.taggedEnum<Message>();

export type MessageType = Types.Tags<Message>;

type ExtractMessage<T extends MessageType> = Types.ExtractTag<Message, T>;

export type NewIssueMessage = ExtractMessage<"NewIssue">;
export type DeliverPayloadMessage = ExtractMessage<"DeliverPayload">;
export type SaveForDeliveryMessage = ExtractMessage<"SaveForDelivery">;

export type MessageTypeToMessage = {
  NewIssue: NewIssueMessage;
  DeliverPayload: DeliverPayloadMessage;
  SaveForDelivery: SaveForDeliveryMessage;
};
