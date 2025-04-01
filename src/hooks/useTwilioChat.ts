import { useEffect } from 'react';
import { Client, Message } from '@twilio/conversations';
import { useAppDispatch } from '../hooks/reduxHooks';
import { addMessage } from '../store/slices/chatSlice';

export const useTwilioChat = (client: Client) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
      dispatch(addMessage({
        sid: message.sid,
        conversationSid: message.conversation.sid,
        body: message.body,
        author: message.author,
        dateCreated: message.dateCreated,
        index: message.index,
        attributes: message.attributes,
      }));
    };

    // Subscribe to message events
    client.on('messageAdded', handleMessageAdded);

    return () => {
      client.removeListener('messageAdded', handleMessageAdded);
    };
  }, [client, dispatch]);
}; 