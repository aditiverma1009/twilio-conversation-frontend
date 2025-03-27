import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Client, Paginator } from '@twilio/conversations';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import Login from './components/Login';
import Register from './components/Register';
import { setConversations } from './store/slices/chatSlice';
import { RootState } from './store/store';
import { ExtendedConversation, asExtendedConversation } from './types/twilio';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [client, setClient] = React.useState<Client | null>(null);

  useEffect(() => {
    const initializeTwilioClient = async () => {
      if (!isAuthenticated) return;

      try {
        // TODO: Get token from backend
        const token = 'YOUR_TWILIO_TOKEN';
        const twilioClient = new Client(token);
        
        twilioClient.on('conversationAdded', (conversation) => {
          const extendedConversation = asExtendedConversation(conversation);
          dispatch(setConversations([...client?.conversations || [], extendedConversation]));
        });

        await twilioClient.initialize();
        setClient(twilioClient);
        
        // Get initial conversations
        const conversations = await twilioClient.getSubscribedConversations();
        const extendedConversations = conversations.items.map(asExtendedConversation);
        dispatch(setConversations(extendedConversations));
      } catch (error) {
        console.error('Error initializing Twilio client:', error);
      }
    };

    initializeTwilioClient();

    return () => {
      if (client) {
        client.shutdown();
      }
    };
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div className="h-screen flex">
                <ChatList />
                <ChatWindow />
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
