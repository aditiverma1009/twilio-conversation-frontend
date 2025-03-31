import React, { useEffect, useState } from 'react';
import { useTwilioChat } from '../hooks/useTwilioChat';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Client } from '@twilio/conversations';

export const ChatInitializer: React.FC = () => {
  const dispatch = useDispatch();
  const [token, setToken] = React.useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get('/api/twilio/token', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        const token = response.data.accessToken;
        if (token) {
          const newClient = new Client(token);
          setToken(response.data.accessToken);
          setClient(newClient);
        }
      } catch (error) {
        console.error('Error fetching Twilio token:', error);
      }
    };

    fetchToken();
  }, []);

  // Initialize Twilio client with the token
  if (client) {
    useTwilioChat(client);
  }

  return null;
}; 