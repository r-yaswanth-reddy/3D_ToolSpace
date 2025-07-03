const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  // Uncomment user field - this is essential for user-specific notes
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  title: { type: String, required: true },
  content: { type: String, required: true },
  // Uncomment createdAt - frontend expects this field
  createdAt: { type: Date, default: Date.now },
  // Add updatedAt for better tracking
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
noteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field before updating
noteSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('notes', noteSchema);