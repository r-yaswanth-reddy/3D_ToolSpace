const Chat = require('../models/chatmodel'); // Adjust the path as necessary
const OpenAI = require('openai'); // You'll need to install: npm install openai

// Initialize OpenAI (you can also use other AI services)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this in your .env file
});

// Create a new chat or send message to existing chat
const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user.id; // Assuming user ID comes from auth middleware

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    let chat;

    // Find existing chat or create new one
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: userId, isActive: true });
      if (!chat) {
        return res.status(404).json({
          success: false,
          error: 'Chat not found'
        });
      }
    } else {
      // Create new chat
      chat = new Chat({
        user: userId,
        title: 'New Chat',
        messages: []
      });
    }

    // Add user message
    await chat.addMessage('user', message);

    // Prepare conversation history for AI
    const conversationMessages = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get AI response
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // or "gpt-4" if you have access
        messages: conversationMessages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message.content;

      // Add AI response to chat
      await chat.addMessage('assistant', aiResponse);

      res.json({
        success: true,
        response: aiResponse,
        chatId: chat._id,
        messageCount: chat.messages.length
      });

    } catch (aiError) {
      console.error('AI API Error:', aiError);
      
      // Fallback response if AI service fails
      const fallbackResponse = "I'm sorry, I'm experiencing technical difficulties right now. Please try again in a moment.";
      await chat.addMessage('assistant', fallbackResponse);

      res.json({
        success: true,
        response: fallbackResponse,
        chatId: chat._id,
        messageCount: chat.messages.length
      });
    }

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get chat history list
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      user: userId,
      isActive: true
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('title createdAt updatedAt messages');

    const chatHistory = chats.map(chat => ({
      id: chat._id,
      title: chat.title,
      lastMessage: chat.lastMessage,
      messageCount: chat.messages.length,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }));

    const totalChats = await Chat.countDocuments({
      user: userId,
      isActive: true
    });

    res.json({
      success: true,
      history: chatHistory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalChats / limit),
        totalChats: totalChats,
        hasMore: skip + chats.length < totalChats
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get specific chat with all messages
const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      _id: chatId,
      user: userId,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    res.json({
      success: true,
      chat: {
        id: chat._id,
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Update chat title
const updateChatTitle = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, user: userId, isActive: true },
      { title: title.trim() },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    res.json({
      success: true,
      chat: {
        id: chat._id,
        title: chat.title,
        updatedAt: chat.updatedAt
      }
    });

  } catch (error) {
    console.error('Update chat title error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Delete chat (soft delete)
const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, user: userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Clear all chats for user
const clearAllChats = async (req, res) => {
  try {
    const userId = req.user.id;

    await Chat.updateMany(
      { user: userId, isActive: true },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'All chats cleared successfully'
    });

  } catch (error) {
    console.error('Clear all chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Search chats
const searchChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(query.trim(), 'i');

    const chats = await Chat.find({
      user: userId,
      isActive: true,
      $or: [
        { title: searchRegex },
        { 'messages.content': searchRegex }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(20)
    .select('title createdAt updatedAt messages');

    const searchResults = chats.map(chat => ({
      id: chat._id,
      title: chat.title,
      lastMessage: chat.lastMessage,
      messageCount: chat.messages.length,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }));

    res.json({
      success: true,
      results: searchResults,
      query: query.trim()
    });

  } catch (error) {
    console.error('Search chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getChat,
  updateChatTitle,
  deleteChat,
  clearAllChats,
  searchChats
};