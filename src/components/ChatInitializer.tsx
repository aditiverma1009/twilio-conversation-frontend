import React, { useEffect } from 'react';
import { useTwilioChat } from '../hooks/useTwilioChat';
import { useDispatch } from 'react-redux';
import axios from 'axios';

export const ChatInitializer: React.FC = () => {
  const dispatch = useDispatch();
  const [token, setToken] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get('/api/twilio/token', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        setToken(response.data.accessToken);
      } catch (error) {
        console.error('Error fetching Twilio token:', error);
      }
    };

    fetchToken();
  }, []);

  // Initialize Twilio client with the token
  useTwilioChat(token || '');

  return null;
}; 