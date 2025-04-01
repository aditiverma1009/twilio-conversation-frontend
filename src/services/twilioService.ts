import axios from 'axios';
import { API_ROUTES } from '../config/api';

export const getTwilioToken = async (): Promise<string> => {
  try {
    const response = await axios.get(API_ROUTES.TWILIO.TOKEN, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`
      }
    });
    return response.data.accessToken;
  } catch (error) {
    console.error('Error fetching Twilio token:', error);
    throw error;
  }
}; 