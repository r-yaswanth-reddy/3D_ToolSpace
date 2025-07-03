const mongoose = require("mongoose");

const ChromeSearchSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

module.exports = mongoose.model("ChromeSearch", ChromeSearchSchema);
