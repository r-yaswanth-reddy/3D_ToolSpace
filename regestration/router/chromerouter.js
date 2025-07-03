const express = require("express");
const router = express.Router();
const chromeController = require("../controllers/chromecontroller");
const identification = require("../middlewares/identification");

router.use(identification); // apply auth middleware to all

// GET /api/chrome - fetch history
router.get("/", chromeController.getHistory);

// POST /api/chrome - add new search
router.post("/", chromeController.addSearch);

// DELETE /api/chrome - clear history
router.delete("/", chromeController.clearHistory);

module.exports = router;
