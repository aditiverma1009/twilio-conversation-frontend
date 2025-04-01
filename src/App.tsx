import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Login from './components/Login';
import Register from './components/Register';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import ChatInitializer from './components/ChatInitializer';
import { useAppSelector } from './hooks/reduxHooks';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { Client } from '@twilio/conversations';

const AppContent: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [twilioClient, setTwilioClient] = useState<Client | null>(null);

  return (
    <div className="flex h-screen">
      <ChatInitializer 
        isAuthenticated={isAuthenticated} 
        onClientInitialized={setTwilioClient}
      />
      <div className="w-1/4 border-r">
        <ChatList client={twilioClient} />
      </div>
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<AppContent />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
