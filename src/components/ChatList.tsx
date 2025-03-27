import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setCurrentConversation } from '../store/slices/chatSlice';
import { ExtendedConversation } from '../types/twilio';

const ChatList: React.FC = () => {
  const dispatch = useDispatch();
  const { conversations, currentConversation } = useSelector((state: RootState) => state.chat);

  const handleConversationClick = (conversation: ExtendedConversation) => {
    dispatch(setCurrentConversation(conversation));
  };

  return (
    <div className="w-1/2 h-full border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>
        {conversations.map((conversation) => (
          <div
            key={conversation.sid}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${
              currentConversation?.sid === conversation.sid ? 'bg-blue-50' : ''
            }`}
            onClick={() => handleConversationClick(conversation)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{conversation.friendlyName || 'Unnamed Chat'}</h3>
                <p className="text-sm text-gray-500">
                  {conversation.participants?.length || 0} participants
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(conversation.dateUpdated || '').toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList; 