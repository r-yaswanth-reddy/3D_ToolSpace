const express = require('express');
const router = express.Router();
const transController = require('../controllers/transcontroller');
const identification = require('../middlewares/identification'); // Auth middleware

router.use(identification); // Protect all routes
// Get all notes
router.get('/', transController.gettrans);
// Get a single note by ID
//router.get('/:id', transController.getNoteById);
// Create a new note
router.post('/', transController.createtrans);
// Update a note by ID
//router.put('/:id', transController.updateNote);
// Delete a note by ID
router.delete('/:id', transController.deletetrans);

module.exports = router;
// This router handles all note-related operations for authenticated users.         