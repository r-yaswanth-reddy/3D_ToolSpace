// DOM Elements
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeSidebar = document.getElementById('closeSidebar');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const welcomeSection = document.getElementById('welcomeSection');
const chatContainer = document.getElementById('chatContainer');
const messagesContainer = document.getElementById('messagesContainer');

// State management
let currentChatId = null;
let conversationHistory = [];
let isTyping = false;
let chatHistoryList = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadChatHistory();
});

// Event Listeners
function initializeEventListeners() {
    menuBtn.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    newChatBtn.addEventListener('click', startNewChat);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', handleInputKeydown);
    messageInput.addEventListener('input', handleInputChange);
}

function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

function handleInputKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function handleInputChange() {
    const hasText = messageInput.value.trim().length > 0;
    
    if (hasText) {
        sendBtn.style.display = 'flex';
        sendBtn.classList.add('active');
    } else {
        sendBtn.style.display = 'none';
        sendBtn.classList.remove('active');
    }
}

function startNewChat() {
    currentChatId = null;
    conversationHistory = [];
    messagesContainer.innerHTML = '';
    welcomeSection.style.display = 'flex';
    chatContainer.style.display = 'none';
    toggleSidebar();
    
    // Remove active class from all chat items
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (message && !isTyping) {
        // Switch to chat view if first message
        if (conversationHistory.length === 0) {
            switchToChatView();
        }
        
        // Add user message
        addMessage('user', message);
        conversationHistory.push({ role: 'user', content: message });
        
        // Clear input
        messageInput.value = '';
        handleInputChange();
        
        // Send to backend
        await sendToBackend(message);
    }
}

async function sendToBackend(message) {
    try {
        isTyping = true;
        const typingBubble = addMessage('assistant', '', true);
        
        // Simulate API call - replace with actual backend call
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                message: message,
                chatId: currentChatId
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        typingBubble.parentElement.parentElement.remove();
        
        if (data.success) {
            // Add AI response
            addMessage('assistant', data.response);
            conversationHistory.push({ role: 'assistant', content: data.response });
            
            // Update current chat ID
            if (data.chatId) {
                currentChatId = data.chatId;
            }
            
            // Reload chat history
            loadChatHistory();
        } else {
            addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        }
        
        isTyping = false;
    } catch (error) {
        console.error('Error:', error);
        // Remove typing indicator
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.parentElement.parentElement.remove();
        }
        addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        isTyping = false;
    }
}

function addMessage(sender, content, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? 'Y' : 'AI';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';
    
    if (isTyping) {
        messageBubble.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
    } else {
        messageBubble.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageContent.appendChild(messageTime);
    }
    
    messageContent.appendChild(messageBubble);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
    
    return messageBubble;
}

function switchToChatView() {
    welcomeSection.style.display = 'none';
    chatContainer.style.display = 'flex';
}

function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

async function loadChatHistory() {
    try {
        const response = await fetch('/api/chat/history', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            chatHistoryList = data.history;
            renderChatHistory();
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

function renderChatHistory() {
    chatHistory.innerHTML = '';
    
    chatHistoryList.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }
        
        chatItem.innerHTML = `
            <div class="chat-item-title">${chat.title}</div>
            <div class="chat-item-time">${new Date(chat.lastMessage).toLocaleDateString()}</div>
        `;
        
        chatItem.addEventListener('click', () => loadChat(chat.id));
        chatHistory.appendChild(chatItem);
    });
}

async function loadChat(chatId) {
    try {
        const response = await fetch(`/api/chat/${chatId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentChatId = chatId;
            conversationHistory = data.messages;
            
            // Clear current messages
            messagesContainer.innerHTML = '';
            
            // Add messages to UI
            data.messages.forEach(msg => {
                addMessage(msg.role === 'user' ? 'user' : 'assistant', msg.content);
            });
            
            // Switch to chat view
            switchToChatView();
            
            // Update active chat item
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`.chat-item[data-id="${chatId}"]`)?.classList.add('active');
            
            // Close sidebar
            toggleSidebar();
        }
    } catch (error) {
        console.error('Error loading chat:', error);
    }
}

// Demo functionality - remove in production
function simulateBackendResponse(message) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                response: `You asked: "${message}". This is a simulated response.`,
                chatId: currentChatId || 'chat_' + Date.now()
            });
        }, 1000 + Math.random() * 2000);
    });
}