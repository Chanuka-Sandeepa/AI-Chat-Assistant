import { useState, useCallback, useEffect } from 'react';
import { chatAPI } from '../services/api';

export const useChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  // Generate unique session ID
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const response = await chatAPI.sendMessage(messageText, sessionId);
      
      // Update session ID if new
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
      }

      // Simulate typing delay for better UX
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: response.response,
          sender: 'bot',
          timestamp: new Date(),
          metadata: {
            processingTime: response.processingTime
          }
        }]);
        setIsLoading(false);
        setIsTyping(false);
      }, Math.min(1000, Math.max(500, messageText.length * 20))); // Dynamic typing delay

    } catch (err) {
      console.error('Send message error:', err);
      
      let errorMessage = 'Sorry, there was an error processing your request. Please try again.';
      
      if (err.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment before sending another message.';
      } else if (err.response?.status === 504) {
        errorMessage = 'Request timeout. The server is taking too long to respond.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection.';
      }

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: errorMessage,
          sender: 'bot',
          timestamp: new Date(),
          isError: true
        }]);
        setIsLoading(false);
        setIsTyping(false);
      }, 1000);

      setError(err.response?.data?.error || err.message);
    }
  }, [sessionId]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 1,
        text: "👋 Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setError(null);
    // Generate new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  return {
    messages,
    isLoading,
    isTyping,
    error,
    sessionId,
    sendMessage,
    clearChat
  };
};
