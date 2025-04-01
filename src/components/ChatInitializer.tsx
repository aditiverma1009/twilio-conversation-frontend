import React, { useEffect, useState } from 'react';
import { Client } from '@twilio/conversations';
import { useTwilioChat } from '../hooks/useTwilioChat';
import { getTwilioToken } from '../services/twilioService';

interface ChatInitializerProps {
  isAuthenticated: boolean;
  onClientInitialized: (client: Client | null) => void;
}

const ChatInitializer: React.FC<ChatInitializerProps> = ({ isAuthenticated, onClientInitialized }) => {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const initializeTwilioClient = async () => {
      if (isAuthenticated) {
        try {
          const token = await getTwilioToken();
          const newClient = new Client(token);
          await newClient.initialize();
          setClient(newClient);
          onClientInitialized(newClient);
        } catch (error) {
          console.error('Error initializing Twilio client:', error);
          onClientInitialized(null);
        }
      }
    };

    initializeTwilioClient();

    return () => {
      if (client) {
        client.shutdown();
      }
    };
  }, [isAuthenticated, onClientInitialized]);

  if (client) {
    useTwilioChat(client);
  }

  return null;
};

export default ChatInitializer; 