import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExtendedConversation, ExtendedMessage } from '../../types/twilio';

interface ChatState {
  conversations: ExtendedConversation[];
  currentConversation: ExtendedConversation | null;
  messages: { [key: string]: ExtendedMessage[] };
  unreadCounts: { [key: string]: number };
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  unreadCounts: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addConversation: (state, action: PayloadAction<ExtendedConversation>) => {
      const conversation = action.payload;
      const exists = state.conversations.some(conv => conv.sid === conversation.sid);
      if (!exists) {
        // @ts-expect-error ts-migrate(2339) 
        state.conversations.push(conversation);
      }
    },
    updateConversation: (state, action: PayloadAction<ExtendedConversation>) => {
      const index = state.conversations.findIndex(
        (conv) => conv.sid === action.payload.sid
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
    },
    removeConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(
        (conv) => conv.sid !== action.payload
      );
      if (state.currentConversation?.sid === action.payload) {
        state.currentConversation = null;
      }
    },
    setCurrentConversation: (state, action: PayloadAction<ExtendedConversation | null>) => {
      state.currentConversation = action.payload;
    },
    setConversations: (state, action: PayloadAction<ExtendedConversation[]>) => {
      state.conversations = action.payload;
    },
    updateUnreadCount: (state, action: PayloadAction<{ conversationId: string; count: number }>) => {
      const { conversationId, count } = action.payload;
      state.unreadCounts[conversationId] = count;
    },
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] = 0;
    },
  },
});

export const {
  addConversation,
  updateConversation,
  removeConversation,
  setCurrentConversation,
  updateUnreadCount,
  markMessagesAsRead,
  setConversations,
} = chatSlice.actions;

export default chatSlice.reducer; 