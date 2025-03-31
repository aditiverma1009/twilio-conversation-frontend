import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import authReducer from './slices/authSlice';
import conversationsReducer from './slices/conversationsSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer,
    conversations: conversationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 