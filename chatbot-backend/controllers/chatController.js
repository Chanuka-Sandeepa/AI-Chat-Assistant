const axios = require('axios');
const Message = require('../models/Message');

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const currentSessionId = sessionId || generateSessionId();
    const startTime = Date.now();

    // Save user message to database
    const userMessage = new Message({
      sessionId: currentSessionId,
      content: message.trim(),
      sender: 'user'
    });
    await userMessage.save();

    // Call OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1:free',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.HTTP_REFERER || 'https://www.webstylepress.com',
          'X-Title': process.env.X_TITLE || 'WebStylePress',
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    const botResponse = response.data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process your request.';
    const processingTime = Date.now() - startTime;

    // Save bot response to database
    const botMessage = new Message({
      sessionId: currentSessionId,
      content: botResponse,
      sender: 'bot',
      metadata: {
        model: 'deepseek/deepseek-r1:free',
        tokens: response.data.usage?.total_tokens || 0,
        processingTime
      }
    });
    await botMessage.save();

    res.json({
      response: botResponse,
      sessionId: currentSessionId,
      processingTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timeout. Please try again.' });
    }

    res.status(500).json({ 
      error: 'Failed to get AI response',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const messages = await Message.find({ sessionId })
      .sort({ timestamp: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('content sender timestamp metadata');

    const total = await Message.countDocuments({ sessionId });

    res.json({
      messages,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total
    });

  } catch (error) {
    console.error('Get chat history error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
};

module.exports = {
  sendMessage,
  getChatHistory
};