const mongoose = require('mongoose');

const transSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromText: { type: String, required: true },
  toText: { type: String, required: true },
  fromLang: { type: String, required: true },
  toLang: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trans', transSchema);