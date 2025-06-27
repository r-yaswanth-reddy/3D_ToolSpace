const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notescontroller');
const identification = require('../middlewares/identification'); // Auth middleware

router.use(identification); // Protect all routes
// Get all notes
router.get('/', notesController.getNotes);
// Get a single note by ID
router.get('/:id', notesController.getNoteById);
// Create a new note
router.post('/', notesController.createNote);
// Update a note by ID
router.put('/:id', notesController.updateNote);
// Delete a note by ID
router.delete('/:id', notesController.deleteNote);

module.exports = router;
// This router handles all note-related operations for authenticated users.         