import { useState, useEffect, useCallback } from 'react';
import { ExtendedConversation } from '../types/twilio';

interface UseUnreadCountProps {
  conversation: ExtendedConversation | null;
}

interface UseUnreadCountReturn {
  unreadCount: number;
  markAsRead: () => Promise<void>;
  error: Error | null;
}

export const useUnreadCount = ({ conversation }: UseUnreadCountProps): UseUnreadCountReturn => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const updateUnreadCount = useCallback(async () => {
    if (!conversation) return;
    try {
      const count = await conversation.getUnreadMessagesCount();
      setUnreadCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch unread count'));
    }
  }, [conversation]);

  const markAsRead = async () => {
    if (!conversation) return;
    try {
      await conversation.setAllMessagesRead();
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark messages as read'));
    }
  };

  useEffect(() => {
    if (!conversation) return;

    const handleNewMessage = () => {
      updateUnreadCount();
    };

    conversation.on('messageAdded', handleNewMessage);

    // Get initial count
    updateUnreadCount();

    return () => {
      conversation.off('messageAdded', handleNewMessage);
    };
  }, [conversation, updateUnreadCount]);

  return {
    unreadCount,
    markAsRead,
    error
  };
}; 