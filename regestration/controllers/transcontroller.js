const Trans = require('../models/transmodel');

// Get all notes (no authentication for now)
exports.gettrans = async (req, res) => {
  try {

    const userId = req.user.userid;
    // For now, get all notes without user filtering since no auth
    const trans = await Trans.find({user: userId});
    
    // ✅ Return the format expected by frontend
    res.json({ 
      success: true, 
      trans: trans 
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch history' 
    });
  }
};

// Get a single note by ID
// exports.getNoteById = async (req, res) => {
//   try {
//     const userId = req.user.userid;
//     const note = await Note.findOne({ _id: req.params.id, user: userId }); // ✅ secure

//     if (!note) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Note not found or unauthorized' 
//       });
//     }

//     res.json({ 
//       success: true, 
//       note: note 
//     });
//   } catch (error) {
//     console.error('Error fetching note:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch note' 
//     });
//   }
// };


// Create a new note
exports.createtrans = async (req, res) => {
    console.log("Received translator POST request");
    console.log("Request body:", req.body);

    const { fromText, toText, fromLang, toLang, timestamp } = req.body;

    // ✅ Add validation
    if (!fromText || !toText) {
        return res.status(400).json({ 
          success: false, 
          //message: 'Title and content are required' 
        });
    }

    try {

        const userId = req.user.userid;
        // Create note without user field for now (no auth)
        const trans = new Trans({ toText, fromText, fromLang, toLang, timestamp, user: userId });
        await trans.save();

        console.log("Saved translation history:", trans);

        // ✅ Return the format expected by frontend
        res.status(201).json({ 
          success: true, 
          trans: trans,
          //message: 'Note created successfully' 
        });
    } catch (err) {
        console.error("Error saving translation history:", err);
        res.status(500).json({ 
          success: false, 
          //message: 'Server error while saving note' 
        });
    }
};

// Update a note
// exports.updateNote = async (req, res) => {
//   try {
//     const { title, content } = req.body;
//     const userId = req.user.userid;

//     if (!title || !content) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Title and content are required' 
//       });
//     }

//     // ✅ Only update if note belongs to user
//     const note = await Note.findOneAndUpdate(
//       { _id: req.params.id, user: userId },
//       { title, content },
//       { new: true }
//     );

//     if (!note) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Note not found or unauthorized' 
//       });
//     }

//     res.json({ 
//       success: true, 
//       note: note,
//       message: 'Note updated successfully' 
//     });
//   } catch (error) {
//     console.error('Error updating note:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to update note' 
//     });
//   }
// };


// Delete a note
exports.deletetrans = async (req, res) => {
  try {
    const userId = req.user.userid;

    // Delete all translation history for the user
    const result = await Trans.deleteMany({ user: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No translation history found to delete' 
      });
    }

    res.json({ 
      success: true, 
      message: 'All translation history deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting translation history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete translation history' 
    });
  }
};
