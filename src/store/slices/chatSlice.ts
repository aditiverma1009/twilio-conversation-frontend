import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ROUTES } from '../../config/api';
import { Client, Conversation, Message } from '@twilio/conversations';

interface ConversationSummary {
  sid: string;
  friendlyName: string;
  dateUpdated: string;
  dateCreated: string;
}

interface ChatState {
  conversations: ConversationSummary[];
  currentConversation: Conversation | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  isLoading: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async () => {
    const response = await axios.get(API_ROUTES.CONVERSATIONS.LIST);
    return response.data.conversations;
  }
);

export const fetchFullConversation = createAsyncThunk(
  'chat/fetchFullConversation',
  async ({ client, conversationSid }: { client: Client; conversationSid: string }) => {
    const conversation = await client.getConversationBySid(conversationSid);
    return conversation;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      if (!state.messages[message.conversationSid]) {
        state.messages[message.conversationSid] = [];
      }
      state.messages[message.conversationSid].push(message);
    },
    updateMessage: (state, action) => {
      const message = action.payload;
      if (state.messages[message.conversationSid]) {
        const index = state.messages[message.conversationSid].findIndex(m => m.sid === message.sid);
        if (index !== -1) {
          state.messages[message.conversationSid][index] = message;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      })
      .addCase(fetchFullConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFullConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        // @ts-expect-error ts-migrate
        state.currentConversation = action.payload;
      })
      .addCase(fetchFullConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch conversation details';
      });
  },
});

export const { setCurrentConversation, addMessage, updateMessage, clearError } = chatSlice.actions;
export default chatSlice.reducer; 