// const express = require('express');
// const router = express.Router();
// const chatController = require('../controllers/chatcontroller');




// router.get('/', chatController.getHistory);
// router.post('/', chatController.askChatGPT);

// module.exports = router;

const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getChat,
  updateChatTitle,
  deleteChat,
  clearAllChats,
  searchChats
} = require('../controllers/chatcontroller');

const identification = require('../middlewares/identification');

router.use(identification); // protect all chat routes

// Middleware to authenticate user (you'll need to implement this)
// const authenticateUser = (req, res, next) => {
//   // Example authentication middleware
//   const token = req.header('Authorization')?.replace('Bearer ', '');
  
//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       error: 'Access denied. No token provided.'
//     });
//   }

//   try {
//     // Verify JWT token here
//     // const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // req.user = decoded;
    
//     // For demo purposes, using a mock user
//     req.user = { id: 'user123' }; // Replace with actual JWT verification
//     next();
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: 'Invalid token.'
//     });
//   }
// };

// Validation middleware
const validateMessage = (req, res, next) => {
  const { message } = req.body;
  
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Message is required and must be a non-empty string'
    });
  }

  if (message.length > 4000) {
    return res.status(400).json({
      success: false,
      error: 'Message is too long. Maximum 4000 characters allowed.'
    });
  }

  next();
};

const validateChatId = (req, res, next) => {
  const { chatId } = req.params;
  
  // Basic MongoDB ObjectId validation
  if (!/^[0-9a-fA-F]{24}$/.test(chatId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid chat ID format'
    });
  }

  next();
};

// // Rate limiting middleware (optional)
// const rateLimit = require('express-rate-limit');

// const chatRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     error: 'Too many requests, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Apply rate limiting to all chat routes
// router.use(chatRateLimit);

// Apply authentication to all routes
// router.use(authenticateUser);

// Routes

// POST /api/chat - Send a message (create new chat or continue existing)
router.post('/', validateMessage, sendMessage);

// GET /api/chat/history - Get user's chat history
router.get('/history', getChatHistory);

// GET /api/chat/search - Search through chats
router.get('/search', searchChats);

// GET /api/chat/:chatId - Get specific chat with all messages
router.get('/:chatId', validateChatId, getChat);

// PUT /api/chat/:chatId/title - Update chat title
router.put('/:chatId/title', validateChatId, (req, res, next) => {
  const { title } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Title is required and must be a non-empty string'
    });
  }

  if (title.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Title is too long. Maximum 100 characters allowed.'
    });
  }

  next();
}, updateChatTitle);

// DELETE /api/chat/:chatId - Delete specific chat
router.delete('/:chatId', validateChatId, deleteChat);

// DELETE /api/chat - Clear all chats
router.delete('/', clearAllChats);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Chat router error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.message
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate entry'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

module.exports = router;