// API endpoint base URL
const API_BASE = '/api/notes';

// Initialize notes array (will be loaded from backend)
let notes = [];
let isEditing = false;
let editingNoteId = null;

// Function to show the new note form
function showNewNoteForm() {
    const form = document.getElementById('new-note-form');
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    const saveBtn = document.getElementById('save-btn');
    
    form.style.display = 'block';
    titleInput.value = '';
    contentInput.value = '';
    titleInput.focus();
    
    // Reset for new note
    isEditing = false;
    editingNoteId = null;
    saveBtn.textContent = 'Save';
}

// Function to hide the new note form
function hideNewNoteForm() {
    const form = document.getElementById('new-note-form');
    form.style.display = 'none';
    
    // Reset editing state
    isEditing = false;
    editingNoteId = null;
    document.getElementById('save-btn').textContent = 'Save';
}

// Function to fetch all notes from backend
async function fetchNotes() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log(data);
        if (data.success) {
            notes = data.notes;
            displayNotes();
        } else {
            console.error('Failed to fetch notes:', data.message);
            alert('Failed to load notes: ' + data.message);
        }
    } catch (error) {
        console.error('Error fetching notes:', error);
        alert('Error loading notes. Please try again.');
    }
}

// Function to save a new note to backend
async function saveNote() {
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('Please enter both title and content for the note');
        return;
    }
    
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Hide the form and refresh the notes list
            hideNewNoteForm();
            await fetchNotes(); // Refresh notes from backend
            alert('Note saved successfully!');
        } else {
            alert('Failed to save note: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving note:', error);
        alert('Error saving note. Please try again.');
    }
}

// Function to handle save button click (either save new or update existing)
function handleSaveClick() {
    if (isEditing) {
        updateNote(editingNoteId);
    } else {
        saveNote();
    }
}

// Function to display all notes
function displayNotes() {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <p>No notes yet. Click the + button to create one!</p>
            </div>
        `;
        return;
    }
    
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        
        // Format the date
        const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Unknown date';
        
        noteElement.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <small>Created: ${dateStr}</small>
            <div class="note-actions">
                <button class="edit-btn" data-note-id="${note._id}">Edit</button>
                <button class="delete-btn" data-note-id="${note._id}">Delete</button>
            </div>
        `;
        notesList.appendChild(noteElement);
    });
    
    // Setup event listeners for the newly created buttons
    setupNoteActionListeners();
}

// Function to edit a note
function editNote(id) {
    const note = notes.find(n => n._id === id);
    if (!note) return;
    
    const form = document.getElementById('new-note-form');
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    const saveBtn = document.getElementById('save-btn');
    
    // Show the form
    form.style.display = 'block';
    
    // Fill the input fields
    titleInput.value = note.title;
    contentInput.value = note.content;
    
    // Set editing state
    isEditing = true;
    editingNoteId = id;
    saveBtn.textContent = 'Save Changes';
    
    // Focus on the title input
    titleInput.focus();
}

// Function to update an existing note in backend
async function updateNote(id) {
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('Please enter both title and content for the note');
        return;
    }
    
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Hide the form and refresh the display
            hideNewNoteForm();
            await fetchNotes(); // Refresh notes from backend
            alert('Note updated successfully!');
        } else {
            alert('Failed to update note: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating note:', error);
        alert('Error updating note. Please try again.');
    }
}

// Function to delete a note from backend
async function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        try {
            const token = localStorage.getItem("token");    
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                await fetchNotes(); // Refresh notes from backend
                alert('Note deleted successfully!');
            } else {
                alert('Failed to delete note: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Error deleting note. Please try again.');
        }
    }
}

// Function to setup main event listeners
function setupEventListeners() {
    // Add note button
    const addBtn = document.getElementById('add-note-btn');
    if (addBtn) {
        addBtn.addEventListener('click', showNewNoteForm);
    }
    
    // Save button - handles both save and update
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveClick);
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideNewNoteForm);
    }
}

// Function to setup note action event listeners (for edit/delete buttons)
function setupNoteActionListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const noteId = this.getAttribute('data-note-id');
            editNote(noteId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const noteId = this.getAttribute('data-note-id');
            deleteNote(noteId);
        });
    });
}

// Load notes when the page loads
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    fetchNotes();
});