import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Client, Conversation, Message } from '@twilio/conversations';
import { addConversation, updateConversation, updateUnreadCount } from '../store/slices/chatSlice';
import { ExtendedConversation, asExtendedConversation } from '../types/twilio';
import { useAppDispatch } from './reduxHook';

export const useTwilioChat = (conversationsClient: Client) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUnreadCount = async (conversation: Conversation) => {
      const count = await conversation.getUnreadMessagesCount();
      return count || 0;
    };

    // Handle conversation updates
    conversationsClient.on('conversationUpdated', async (data: { conversation: Conversation; updateReasons: string[] }) => {
      const conversation = data.conversation;
      const extendedConversation = asExtendedConversation(conversation);
      dispatch(updateConversation(extendedConversation));
      
      // Update unread count
      const unreadCount = await fetchUnreadCount(conversation);
      dispatch(updateUnreadCount({
        conversationId: conversation.sid,
        count: unreadCount
      }));
    });

    // Handle message updates (including read status)
    conversationsClient.on('messageUpdated', async ({ message }) => {
      const conversation = await conversationsClient.getConversationBySid(message.conversation.sid);
      if (!conversation) return; // Prevent errors if conversation is undefined
    
      const unreadCount = await fetchUnreadCount(conversation);
      dispatch(updateUnreadCount({
        conversationId: conversation.sid,
        count: unreadCount
      }));
    });

    // Initialize conversations
    const initializeConversations = async () => {
      try {
        await conversationsClient.initialize();
        
        // Fetch initial conversations
        const paginator = await conversationsClient.getSubscribedConversations();
        for (const conversation of paginator.items) {
          const extendedConversation = asExtendedConversation(conversation);
          dispatch(addConversation(extendedConversation));
          
          // Fetch unread count
          const unreadCount = await fetchUnreadCount(conversation);
          dispatch(updateUnreadCount({
            conversationId: conversation.sid,
            count: unreadCount
          }));
        }
      } catch (error) {
        console.error('Error initializing conversations:', error);
      }
    };

    initializeConversations();

    return () => {
      conversationsClient.removeAllListeners();
    };
  }, [conversationsClient, dispatch]);
}; 