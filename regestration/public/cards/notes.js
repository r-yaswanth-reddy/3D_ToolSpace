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

// Function to save a new note to the backend
function saveNote() {
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('Please enter both title and content for the note');
        return;
    }

    // Send note to backend
    fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // Add authentication headers if needed (e.g., JWT token)
        },
        body: JSON.stringify({ title, content })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to save note');
        return response.json();
    })
    .then(newNote => {
        // Optionally update the UI with the new note
        hideNewNoteForm();
        displayNotes(); // This should now fetch notes from backend, not localStorage
    })
    .catch(error => {
        alert('Error saving note: ' + error.message);
    });
}

// Function to display all notes from the backend
function displayNotes() {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';

    fetch('/api/notes')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch notes');
            return response.json();
        })
        .then(notes => {
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
                    <small>Created: ${new Date(note.createdAt).toLocaleString()}</small>
                    <div class="note-actions">
                        <button onclick="editNote('${note._id}')" class="edit-btn">Edit</button>
                        <button onclick="deleteNote('${note._id}')" class="delete-btn">Delete</button>
                    </div>
                `;
                notesList.appendChild(noteElement);
            });
        })
        .catch(error => {
            notesList.innerHTML = `<p>Error loading notes: ${error.message}</p>`;
        });
}

// Function to edit a note
function editNote(id) {
    fetch(`/api/notes/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch note');
            return res.json();
        })
        .then(note => {
            const form = document.getElementById('new-note-form');
            const titleInput = document.getElementById('note-title');
            const contentInput = document.getElementById('note-content');
            const saveBtn = document.querySelector('.save-btn');

            form.style.display = 'block';
            titleInput.value = note.title;
            contentInput.value = note.content;

            saveBtn.textContent = 'Save Changes';
            saveBtn.onclick = () => updateNote(id);

            titleInput.focus();
        })
        .catch(error => alert('Error loading note: ' + error.message));
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

    fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to update note');
        return res.json();
    })
    .then(() => {
        hideNewNoteForm();
        displayNotes();

        const saveBtn = document.querySelector('.save-btn');
        saveBtn.textContent = 'Save';
        saveBtn.onclick = saveNote;
    })
    .catch(error => alert('Error updating note: ' + error.message));
}

// Function to delete a note
function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        fetch(`/api/notes/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to delete note');
            return res.json();
        })
        .then(() => {
            displayNotes();
        })
        .catch(error => alert('Error deleting note: ' + error.message));
    }
}

// Display notes when the page loads
document.addEventListener('DOMContentLoaded', function() {
    displayNotes();
});

// Assuming you have a list of note titles rendered as <li data-id="...">Title</li>
document.querySelectorAll('.note-title').forEach(item => {
  item.addEventListener('click', function() {
    const noteId = this.getAttribute('data-id');
    fetch(`/api/notes/${noteId}`)
      .then(res => res.json())
      .then(note => {
        document.getElementById('note-content').innerText = note.content;
        // Optionally, set the title too
        document.getElementById('note-title').innerText = note.title;
      });
  });
});

// // On form submit
// fetch('/api/notes', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ title, content })
// })
// .then(res => res.json())
// .then(newNote => {
//   // Add new note to the UI
// });
