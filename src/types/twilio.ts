import { Conversation, Message, Media, Paginator, Client, JSONValue } from '@twilio/conversations';

// We only extend what we absolutely need
export interface ExtendedConversation extends Conversation {
  sid: string;
  friendlyName: string | null;
}

export interface ExtendedMessage extends Message {
  attachedMedia: ExtendedMedia[] | null;
  attributes: JSONValue; // Remove optional since Twilio always provides attributes
}

export interface ExtendedMedia extends Media {
  url: string;
}

// Type assertion helpers
export const asExtendedConversation = (conversation: Conversation): ExtendedConversation => {
  return conversation as ExtendedConversation;
};

export const asExtendedMessage = (message: Message): ExtendedMessage => {
  return message as ExtendedMessage;
};

export const asExtendedMedia = (media: Media): ExtendedMedia => {
  return media as ExtendedMedia;
};

// Extend the Client type from @twilio/conversations
declare module '@twilio/conversations' {
  interface Client {
    initialize: () => Promise<void>;
    shutdown: () => Promise<void>;
    getSubscribedConversations: () => Promise<Paginator<Conversation>>;
  }

  interface Message {
    attachedMedia: ExtendedMedia[] | null;
    attributes: JSONValue;
  }

  interface Media {
    url: string;
  }
} 