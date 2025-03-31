import { useState, useEffect, useCallback } from 'react';
import { Message, Paginator, MessageUpdateReason } from '@twilio/conversations';
import { ExtendedMessage, ExtendedConversation, asExtendedMessage } from '../types/twilio';
import axios from 'axios';
interface Participant {
  sid: string;
  identity: string;
  attributes: Record<string, any>;
}

interface UseConversationDataProps {
  conversation: ExtendedConversation | null;
  pageSize?: number;
}

interface UseConversationDataReturn {
  messages: ExtendedMessage[];
  participants: Participant[];
  unreadCount: number;
  hasMoreMessages: boolean;
  loadMoreMessages: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useConversationData = ({
  conversation,
  pageSize = 30
}: UseConversationDataProps): UseConversationDataReturn => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [paginator, setPaginator] = useState<Paginator<Message> | null>(null);

  // Fetch participants from backend
  const fetchParticipants = useCallback(async () => {
    if (!conversation) return;
    try {
      const response = await axios.get(`/api/conversations/${conversation.sid}/participants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      setParticipants(response.data.participants);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch participants'));
    }
  }, [conversation]);

  // Get real-time unread count
  const updateUnreadCount = useCallback(async () => {
    if (!conversation) return;
    try {
      const count = await conversation.getUnreadMessagesCount();
      setUnreadCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch unread count'));
    }
  }, [conversation]);

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
      setMessages(prev => [...prev, asExtendedMessage(message)]);
      updateUnreadCount();
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

    const handleParticipantUpdated = () => {
      fetchParticipants();
    };

    conversation.on('messageAdded', handleNewMessage);
    conversation.on('messageUpdated', handleMessageUpdated);
    conversation.on('participantUpdated', handleParticipantUpdated);

    // Initial load
    loadInitialMessages();
    fetchParticipants();
    updateUnreadCount();

    return () => {
      conversation.off('messageAdded', handleNewMessage);
      conversation.off('messageUpdated', handleMessageUpdated);
      conversation.off('participantUpdated', handleParticipantUpdated);
      // Clear data when conversation changes
      setMessages([]);
      setParticipants([]);
      setUnreadCount(0);
      setPaginator(null);
    };
  }, [conversation, loadInitialMessages, fetchParticipants, updateUnreadCount]);

  return {
    messages,
    participants,
    unreadCount,
    hasMoreMessages,
    loadMoreMessages,
    isLoading,
    error
  };
}; 