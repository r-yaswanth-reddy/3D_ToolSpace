const Note = require('../models/notesmodel');

// Get all notes for the logged-in user
exports.getNotes = async (req, res) => {
  const notes = await Note.find({ user: req.user._id });
  res.json(notes);
};

// Get a single note by ID
exports.getNoteById = async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
};

// Create a new note
exports.createNote = async (req, res) => {
  const { title, content } = req.body;
  const note = new Note({ user: req.user._id, title, content });
  await note.save();
  res.status(201).json(note);
};

// Update a note
exports.updateNote = async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
};

// Delete a note
exports.deleteNote = async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ message: 'Note deleted' });
};