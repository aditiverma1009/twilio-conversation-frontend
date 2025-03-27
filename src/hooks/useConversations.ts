import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExtendedConversation } from '../types/twilio';

interface UseConversationsReturn {
  conversations: ExtendedConversation[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useConversations = (): UseConversationsReturn => {
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/conversations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      setConversations(response.data.conversations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch conversations'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    isLoading,
    error,
    refetch: fetchConversations
  };
}; 