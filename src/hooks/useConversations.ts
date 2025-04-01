import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/reduxHooks';
import { ExtendedConversation, asExtendedConversation } from '../types/twilio';
import axios from 'axios';
import { API_ROUTES } from '../config/api';
import { setConversations } from '../store/slices/conversationsSlice';

export const useConversations = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(API_ROUTES.CONVERSATIONS.LIST, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        const conversations = response.data.map(asExtendedConversation);
        dispatch(setConversations(conversations));
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [dispatch]);
}; 