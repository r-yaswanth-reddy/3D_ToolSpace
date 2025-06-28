const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notescontroller');

// No authentication middleware for now as requested

// Get all notes
router.get('/n', notesController.getNotes);

// Get a single note by ID
router.get('/n/:id', notesController.getNoteById);
console.log("Notes router initialized");
// Create a new note
router.post('/n', notesController.createNote);

// Update a note by ID
router.put('/n/:id', notesController.updateNote);

// Delete a note by ID  
router.delete('/n/:id', notesController.deleteNote);

module.exports = router;