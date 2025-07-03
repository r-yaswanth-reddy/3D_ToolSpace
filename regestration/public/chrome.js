document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchHistory = document.getElementById('search-history');
    const clearHistoryButton = document.getElementById('clear-history');
  
    const API_BASE = '/api/chrome';
    const GOOGLE_SEARCH_API = {
      apiKey: 'AIzaSyCtqCIZFW_8NVv4o9_Z9JGMD2ymz_quOS0',
      searchEngineId: 'b7df0fcd1b71241d8'
    };
  
    async function performSearch(query) {
      if (!query) return;
  
      searchResults.innerHTML = '<div>Searching...</div>';
      try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API.apiKey}&cx=${GOOGLE_SEARCH_API.searchEngineId}&q=${encodeURIComponent(query)}&num=10`;
        const response = await fetch(url);
        const data = await response.json();
  
        const results = data.items || [];
        displayResults(results);
        await saveToBackend(query);
        await loadHistory();
      } catch (err) {
        console.error('Search failed:', err);
        searchResults.innerHTML = `<div>Search failed</div>`;
      }
    }
  
    function displayResults(items) {
      if (!items.length) {
        searchResults.innerHTML = `<div>No results found</div>`;
        return;
      }
  
      searchResults.innerHTML = items.map(item => `
        <a href="${item.link}" target="_blank">${item.title}</a>
      `).join('');
    }
  
    async function saveToBackend(query) {
      const token = localStorage.getItem("token");
      try {
        await fetch(API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ query })
        });
      } catch (err) {
        console.error('Error saving to backend:', err);
      }
    }
  
    async function loadHistory() {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(API_BASE, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          renderHistory(data.history);
        } else {
          searchHistory.innerHTML = "<div>No history found</div>";
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    }
  
    function renderHistory(historyArray) {
      searchHistory.innerHTML = '';
      historyArray.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
          <div>${item.query}</div>
          <small>${new Date(item.timestamp).toLocaleString()}</small>
        `;
        div.addEventListener('click', () => {
          searchInput.value = item.query;
          performSearch(item.query);
        });
        searchHistory.appendChild(div);
      });
    }
  
    async function clearHistory() {
      const token = localStorage.getItem("token");
      try {
        await fetch(API_BASE, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        searchHistory.innerHTML = "<div>History cleared</div>";
      } catch (err) {
        console.error('Error clearing history:', err);
      }
    }
  
    // Event Listeners
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) performSearch(query);
    });
  
    clearHistoryButton.addEventListener('click', clearHistory);
  
    // Load initial history
    loadHistory();
  });
  