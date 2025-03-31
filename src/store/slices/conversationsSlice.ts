import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExtendedConversation } from '../../types/twilio';

interface ConversationsState {
  conversations: ExtendedConversation[];
  currentConversation: ExtendedConversation | null;
}

const initialState: ConversationsState = {
  conversations: [],
  currentConversation: null,
};

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<ExtendedConversation[]>) => {
      state.conversations = action.payload;
    },
    setCurrentConversation: (state, action: PayloadAction<ExtendedConversation | null>) => {
      state.currentConversation = action.payload;
    },
    updateConversation: (state, action: PayloadAction<ExtendedConversation>) => {
      const index = state.conversations.findIndex(conv => conv.sid === action.payload.sid);
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
    },
    removeConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(conv => conv.sid !== action.payload);
      if (state.currentConversation?.sid === action.payload) {
        state.currentConversation = null;
      }
    },
  },
});

export const {
  setConversations,
  setCurrentConversation,
  updateConversation,
  removeConversation,
} = conversationsSlice.actions;

export default conversationsSlice.reducer; 