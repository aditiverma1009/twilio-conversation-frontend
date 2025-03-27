import { useEffect, useState } from 'react';
import { Client, Conversation, Message } from '@twilio/conversations';
import { ExtendedConversation, ExtendedMessage, asExtendedConversation, asExtendedMessage } from '../types/twilio';
import { useDispatch } from 'react-redux';
import { addMessage, updateConversation, removeConversation, updateUnreadCount } from '../store/slices/chatSlice';
import axios from 'axios';

export const useTwilioChat = (initialToken: string) => {
  const dispatch = useDispatch();
  const [client, setClient] = useState<Client | null>(null);

  const refreshToken = async () => {
    try {
      // The backend will verify the current JWT and return a new Twilio token
      const response = await axios.get('/api/twilio/token', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}` // Your JWT token
        }
      });
      return response.data.accessToken;
    } catch (error) {
      console.error('Error refreshing Twilio token:', error);
      throw error;
    }
  };

  const fetchUnreadCount = async (conversation: Conversation) => {
    try {
      const count = await conversation.getUnreadMessagesCount();
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  };

  const fetchParticipants = async (conversationId: string) => {
    try {
      const response = await axios.get(`/api/conversations/${conversationId}/participants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      return response.data.participants;
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  };

  useEffect(() => {
    if (!initialToken) return;

    const conversationsClient = new Client(initialToken);

    // Handle connection state changes
    conversationsClient.on('connectionStateChanged', (state) => {
      console.log('Connection state changed:', state);
    });

    // Handle new conversations
    conversationsClient.on('conversationAdded', async (conversation) => {
      const extendedConversation = asExtendedConversation(conversation);
      const unreadCount = await fetchUnreadCount(conversation);
      const participants = await fetchParticipants(conversation.sid);
      
      dispatch(updateConversation({
        ...extendedConversation,
        unreadMessageCount: unreadCount,
        participants
      }));
    });

    // Handle conversation updates
    conversationsClient.on('conversationUpdated', async (conversation) => {
      const extendedConversation = asExtendedConversation(conversation);
      const unreadCount = await fetchUnreadCount(conversation);
      const participants = await fetchParticipants(conversation.sid);
      
      dispatch(updateConversation({
        ...extendedConversation,
        unreadMessageCount: unreadCount,
        participants
      }));
    });

    // Handle leaving conversations
    conversationsClient.on('conversationLeft', (conversation) => {
      dispatch(removeConversation(conversation.sid));
    });

    // Handle new messages
    conversationsClient.on('messageAdded', async (message) => {
      const extendedMessage = asExtendedMessage(message);
      const conversation = message.conversation;
      
      // Update unread count for the conversation
      const unreadCount = await fetchUnreadCount(conversation);
      dispatch(updateUnreadCount({
        conversationId: conversation.sid,
        count: unreadCount
      }));

      // Add the message
      dispatch(addMessage(extendedMessage));
    });

    // Handle message read status
    conversationsClient.on('messageRead', async (message) => {
      const conversation = message.conversation;
      const unreadCount = await fetchUnreadCount(conversation);
      dispatch(updateUnreadCount({
        conversationId: conversation.sid,
        count: unreadCount
      }));
    });

    // Handle token expiration
    conversationsClient.on('tokenAboutToExpire', async () => {
      try {
        const newToken = await refreshToken();
        conversationsClient.updateToken(newToken);
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    });

    conversationsClient.on('tokenExpired', async () => {
      try {
        const newToken = await refreshToken();
        conversationsClient.updateToken(newToken);
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    });

    // Initialize the client
    conversationsClient.initialize().then(async () => {
      console.log('Twilio client initialized');
      
      // Fetch initial unread counts for all conversations
      const conversations = conversationsClient.conversations;
      for (const conversation of conversations) {
        const unreadCount = await fetchUnreadCount(conversation);
        const participants = await fetchParticipants(conversation.sid);
        
        dispatch(updateConversation({
          ...asExtendedConversation(conversation),
          unreadMessageCount: unreadCount,
          participants
        }));
      }
      
      setClient(conversationsClient);
    }).catch((error) => {
      console.error('Error initializing Twilio client:', error);
    });

    // Cleanup on unmount
    return () => {
      if (conversationsClient) {
        conversationsClient.shutdown();
      }
    };
  }, [initialToken, dispatch]);

  return client;
}; 