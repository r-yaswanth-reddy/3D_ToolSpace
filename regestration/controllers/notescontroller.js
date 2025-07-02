const Note = require('../models/notesmodel');

// Get all notes (no authentication for now)
exports.getNotes = async (req, res) => {
  try {

    const userId = req.user.userid;
    // For now, get all notes without user filtering since no auth
    const notes = await Note.find({user: userId});
    
    // ✅ Return the format expected by frontend
    res.json({ 
      success: true, 
      notes: notes 
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notes' 
    });
  }
};

// Get a single note by ID
exports.getNoteById = async (req, res) => {
  try {
    const userId = req.user.userid;
    const note = await Note.findOne({ _id: req.params.id, user: userId }); // ✅ secure

    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found or unauthorized' 
      });
    }

    res.json({ 
      success: true, 
      note: note 
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch note' 
    });
  }
};


// Create a new note
exports.createNote = async (req, res) => {
    console.log("Received note POST request");
    console.log("Request body:", req.body);

    const { title, content } = req.body;

    // ✅ Add validation
    if (!title || !content) {
        return res.status(400).json({ 
          success: false, 
          message: 'Title and content are required' 
        });
    }

    try {

        const userId = req.user.userid;
        // Create note without user field for now (no auth)
        const note = new Note({ title, content, user: userId });
        await note.save();

        console.log("Saved note:", note);

        // ✅ Return the format expected by frontend
        res.status(201).json({ 
          success: true, 
          note: note,
          message: 'Note created successfully' 
        });
    } catch (err) {
        console.error("Error saving note:", err);
        res.status(500).json({ 
          success: false, 
          message: 'Server error while saving note' 
        });
    }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.userid;

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }

    // ✅ Only update if note belongs to user
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { title, content },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found or unauthorized' 
      });
    }

    res.json({ 
      success: true, 
      note: note,
      message: 'Note updated successfully' 
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update note' 
    });
  }
};


// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user.userid;

    // ✅ Only delete if the note belongs to the user
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found or unauthorized' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Note deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete note' 
    });
  }
};
