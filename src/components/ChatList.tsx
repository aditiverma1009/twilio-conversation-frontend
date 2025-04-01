import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchConversations, fetchFullConversation } from '../store/slices/chatSlice';
import { useTwilioChat } from '../hooks/useTwilioChat';
import { Client } from '@twilio/conversations';

interface ChatListProps {
  client: Client | null;
}

const ChatList: React.FC<ChatListProps> = ({ client }) => {
  const dispatch = useAppDispatch();
  const { conversations, currentConversation, isLoading } = useAppSelector(state => state.chat);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleConversationSelect = async (conversationSid: string) => {
    if (client) {
      await dispatch(fetchFullConversation({ client, conversationSid }));
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading conversations...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.sid}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${
              currentConversation?.sid === conversation.sid ? 'bg-gray-100' : ''
            }`}
            onClick={() => handleConversationSelect(conversation.sid)}
          >
            <div className="font-medium">{conversation.friendlyName || 'Unnamed Chat'}</div>
            <div className="text-sm text-gray-500">
              {new Date(conversation.dateUpdated).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList; 