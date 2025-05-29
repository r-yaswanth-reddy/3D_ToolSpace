// Initialize notes from localStorage or empty array
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// Function to show the new note form
function showNewNoteForm() {
    const form = document.getElementById('new-note-form');
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    
    form.style.display = 'block';
    titleInput.value = '';
    contentInput.value = '';
    titleInput.focus();
}

// Function to hide the new note form
function hideNewNoteForm() {
    const form = document.getElementById('new-note-form');
    form.style.display = 'none';
}

// Function to save a new note
function saveNote() {
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('Please enter both title and content for the note');
        return;
    }
    
    const note = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleString()
    };
    
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    
    // Hide the form and refresh the notes list
    hideNewNoteForm();
    displayNotes();
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
        noteElement.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <small>Created: ${note.date}</small>
            <div class="note-actions">
                <button onclick="editNote(${note.id})" class="edit-btn">Edit</button>
                <button onclick="deleteNote(${note.id})" class="delete-btn">Delete</button>
            </div>
        `;
        notesList.appendChild(noteElement);
    });
}

// Function to edit a note
function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    const form = document.getElementById('new-note-form');
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    const saveBtn = document.querySelector('.save-btn');
    
    // Show the form
    form.style.display = 'block';
    
    // Fill the input fields
    titleInput.value = note.title;
    contentInput.value = note.content;
    
    // Update save button to save changes
    saveBtn.textContent = 'Save Changes';
    saveBtn.onclick = () => updateNote(id);
    
    // Focus on the title input
    titleInput.focus();
}

// Function to update an existing note
function updateNote(id) {
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('Please enter both title and content for the note');
        return;
    }
    
    // Find and update the note
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex !== -1) {
        notes[noteIndex] = {
            ...notes[noteIndex],
            title: title,
            content: content,
            date: new Date().toLocaleString()
        };
        
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // Hide the form and refresh the display
        hideNewNoteForm();
        displayNotes();
        
        // Reset save button
        const saveBtn = document.querySelector('.save-btn');
        saveBtn.textContent = 'Save';
        saveBtn.onclick = saveNote;
    }
}

// Function to delete a note
function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== id);
        localStorage.setItem('notes', JSON.stringify(notes));
        displayNotes();
    }
}

// Display notes when the page loads
document.addEventListener('DOMContentLoaded', displayNotes);
