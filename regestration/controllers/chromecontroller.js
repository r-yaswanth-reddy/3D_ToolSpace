const ChromeSearch = require("../models/chromemodel");

// GET all searches for current user
exports.getHistory = async (req, res) => {
  try {
    const history = await ChromeSearch.find({ user: req.user.userid })
      .sort({ timestamp: -1 })
      .limit(10); // latest 10

    res.json({ success: true, history });
  } catch (err) {
    console.error("Error fetching chrome search history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST a new search query
exports.addSearch = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, message: "Query is required" });
  }

  try {
    const chromeSearch = new ChromeSearch({
      query,
      user: req.user.userid,
      timestamp: Date.now()
    });

    await chromeSearch.save();

    res.status(201).json({ success: true, search: chromeSearch });
  } catch (err) {
    console.error("Error saving chrome search:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE all history for a user
exports.clearHistory = async (req, res) => {
  try {
    const result = await ChromeSearch.deleteMany({ user: req.user.userid });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} items`
    });
  } catch (err) {
    console.error("Error deleting chrome search history:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
