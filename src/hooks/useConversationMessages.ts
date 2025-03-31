import { useState, useEffect, useCallback } from 'react';
import { Message, Paginator, MessageUpdateReason } from '@twilio/conversations';
import { ExtendedMessage, ExtendedConversation, asExtendedMessage } from '../types/twilio';

interface UseConversationMessagesProps {
  conversation: ExtendedConversation | null;
  pageSize?: number;
}

interface UseConversationMessagesReturn {
  messages: ExtendedMessage[];
  hasMoreMessages: boolean;
  loadMoreMessages: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useConversationMessages = ({
  conversation,
  pageSize = 30
}: UseConversationMessagesProps): UseConversationMessagesReturn => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [paginator, setPaginator] = useState<Paginator<Message> | null>(null);

  // Load initial messages
  const loadInitialMessages = useCallback(async () => {
    if (!conversation) return;
    setIsLoading(true);
    try {
      const messagePaginator = await conversation.getMessages(pageSize);
      setPaginator(messagePaginator);
      setMessages(messagePaginator.items.map(asExtendedMessage));
      setHasMoreMessages(messagePaginator.hasNextPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load messages'));
    } finally {
      setIsLoading(false);
    }
  }, [conversation, pageSize]);

  // Load more messages
  const loadMoreMessages = async () => {
    if (!paginator || !hasMoreMessages || isLoading) return;
    setIsLoading(true);
    try {
      const nextPage = await paginator.nextPage();
      setPaginator(nextPage);
      setMessages(prev => [...prev, ...nextPage.items.map(asExtendedMessage)]);
      setHasMoreMessages(nextPage.hasNextPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more messages'));
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time updates
  useEffect(() => {
    if (!conversation) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleMessageUpdated = (data: { message: Message; updateReasons: MessageUpdateReason[] }) => {
      const message = data.message;
      setMessages(prev => {
        const index = prev.findIndex(m => m.sid === message.sid);
        if (index !== -1) {
          const newMessages = [...prev];
          newMessages[index] = message;
          return newMessages;
        }
        return prev;
      });
    };

    conversation.on('messageAdded', handleNewMessage);
    conversation.on('messageUpdated', handleMessageUpdated);

    // Initial load
    loadInitialMessages();

    return () => {
      conversation.off('messageAdded', handleNewMessage);
      conversation.off('messageUpdated', handleMessageUpdated);
      // Clear messages when conversation changes
      setMessages([]);
      setPaginator(null);
    };
  }, [conversation, loadInitialMessages]);

  return {
    messages,
    hasMoreMessages,
    loadMoreMessages,
    isLoading,
    error
  };
}; 