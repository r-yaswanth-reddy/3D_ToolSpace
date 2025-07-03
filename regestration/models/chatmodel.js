const mongoose = require('mongoose');

// Individual message schema
const messageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ['user', 'assistant'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Chat conversation schema
const chatSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    maxLength: 100
  },
  messages: [messageSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update the updatedAt field before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for getting the last message timestamp
chatSchema.virtual('lastMessage').get(function() {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1].timestamp;
  }
  return this.createdAt;
});

// Generate chat title from first user message
chatSchema.methods.generateTitle = function() {
  if (this.messages && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      // Take first 50 characters of the first user message
      let title = firstUserMessage.content.substring(0, 50);
      if (firstUserMessage.content.length > 50) {
        title += '...';
      }
      return title;
    }
  }
  return 'New Chat';
};

// Add a message to the chat
chatSchema.methods.addMessage = function(role, content) {
  this.messages.push({
    role: role,
    content: content,
    timestamp: new Date()
  });
  
  // Update title if it's the first user message and title is still default
  if (this.title === 'New Chat' && role === 'user' && this.messages.length === 1) {
    this.title = this.generateTitle();
  }
  
  return this.save();
};

// Get chat summary for history list
chatSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    lastMessage: this.lastMessage,
    messageCount: this.messages.length,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Index for better query performance
chatSchema.index({ user: 1, updatedAt: -1 });
chatSchema.index({ user: 1, isActive: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);