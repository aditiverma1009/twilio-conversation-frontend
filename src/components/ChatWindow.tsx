import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { ExtendedConversation, ExtendedMessage, asExtendedMessage, asExtendedMedia } from '../types/twilio';

const ChatWindow: React.FC = () => {
  const dispatch = useDispatch();
  const { currentConversation, messages } = useSelector((state: RootState) => state.chat);
  const [message, setMessage] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.sid, messages[currentConversation?.sid || '']]);

  const handleSendMessage = async () => {
    if (!currentConversation || (!message && mediaFiles.length === 0)) return;

    try {
      if (mediaFiles.length > 0) {
        // Handle media upload
        for (const file of mediaFiles) {
          const formData = new FormData();
          formData.append('media', file);
          if (message) {
            formData.append('body', message);
          }
          await currentConversation.sendMessage(formData);
        }
        setMediaFiles([]);
      } else {
        await currentConversation.sendMessage(message);
      }
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMediaFiles(Array.from(event.target.files));
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  if (!currentConversation) {
    return (
      <div className="w-1/2 h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }

  const conversationMessages = messages[currentConversation.sid] || [];

  return (
    <div className="w-1/2 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">{currentConversation.friendlyName || 'Chat'}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {conversationMessages.map((msg) => {
          const extendedMessage = asExtendedMessage(msg);
          return (
            <div
              key={msg.sid}
              className={`mb-4 flex ${
                msg.author === currentConversation.client?.identity ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.author === currentConversation.client?.identity
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {msg.author === currentConversation.client?.identity ? 'You' : msg.author}
                </div>
                <div className="text-sm">{msg.body}</div>
                {extendedMessage.attachedMedia && extendedMessage.attachedMedia.length > 0 && (
                  <div className="mt-2">
                    {extendedMessage.attachedMedia.map((media, index) => {
                      const extendedMedia = asExtendedMedia(media);
                      return (
                        <img
                          key={index}
                          src={extendedMedia.url}
                          alt={`Media ${index + 1}`}
                          className="max-w-full rounded mt-2"
                        />
                      );
                    })}
                  </div>
                )}
                <div className="text-xs mt-1 opacity-75">
                  {new Date(msg.dateCreated || '').toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        {mediaFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 