document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');
    const searchHistory = document.getElementById('search-history');
    const clearHistoryButton = document.getElementById('clear-history');

    // Configuration
    const config = {
        apiUrl: 'https://api.duckduckgo.com/',
        maxResults: 10,
        maxHistoryItems: 10
    };

    // State management
    const state = {
        isSearching: false,
        currentQuery: '',
        history: JSON.parse(localStorage.getItem('chromeSearchHistory')) || []
    };

    // Utility functions
    const utils = {
        formatTime(timestamp) {
            const now = Date.now();
            const diff = now - timestamp;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (minutes < 1) return 'just now';
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            return `${days}d ago`;
        },

        async fetchWithTimeout(url, options, timeout = 5000) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(id);
                return response;
            } catch (error) {
                clearTimeout(id);
                throw error;
            }
        },

        // Fallback search function using DuckDuckGo
        async searchDuckDuckGo(query) {
            const url = new URL(config.apiUrl);
            url.searchParams.append('q', query);
            url.searchParams.append('format', 'json');
            url.searchParams.append('no_html', '1');
            url.searchParams.append('skip_disambig', '1');

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            return this.formatDuckDuckGoResults(data);
        },

        formatDuckDuckGoResults(data) {
            const results = [];

            // Add instant answer if available
            if (data.Abstract) {
                results.push({
                    title: data.Heading || 'Instant Answer',
                    link: data.AbstractURL || '#',
                    snippet: data.Abstract,
                    displayLink: new URL(data.AbstractURL || 'https://duckduckgo.com').hostname
                });
            }

            // Add related topics
            if (data.RelatedTopics) {
                data.RelatedTopics.forEach(topic => {
                    if (topic.Text && topic.FirstURL) {
                        results.push({
                            title: topic.Text.split(' - ')[0],
                            link: topic.FirstURL,
                            snippet: topic.Text,
                            displayLink: new URL(topic.FirstURL).hostname
                        });
                    }
                });
            }

            // Add web results
            if (data.Results) {
                data.Results.forEach(result => {
                    results.push({
                        title: result.Text.split(' - ')[0],
                        link: result.FirstURL,
                        snippet: result.Text,
                        displayLink: new URL(result.FirstURL).hostname
                    });
                });
            }

            return results;
        }
    };

    // Search functions
    const searchManager = {
        async performSearch(query) {
            if (!query.trim() || state.isSearching) return;

            state.isSearching = true;
            state.currentQuery = query;
            searchResults.innerHTML = '<div class="loading">Searching...</div>';

            try {
                const results = await utils.searchDuckDuckGo(query);
                this.displayResults(results);
                this.addToHistory(query);
            } catch (error) {
                console.error('Search error:', error);
                // Fallback to mock results if search fails
                this.displayMockResults(query);
            } finally {
                state.isTranslating = false;
            }
        },

        displayResults(items) {
            if (!items.length) {
                searchResults.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        No results found for "${state.currentQuery}"
                    </div>
                `;
                return;
            }

            searchResults.innerHTML = items.map(item => `
                <div class="result-item">
                    <div class="result-header">
                        <a href="${item.link}" target="_blank" class="result-title">
                            ${item.title}
                        </a>
                        <div class="result-url">${item.displayLink}</div>
                    </div>
                    <div class="result-snippet">${item.snippet}</div>
                </div>
            `).join('');
        },

        displayMockResults(query) {
            const mockResults = [
                {
                    title: 'Example Search Result 1',
                    link: 'https://example.com/1',
                    snippet: `This is a sample result for "${query}". The actual search is currently unavailable.`,
                    displayLink: 'example.com'
                },
                {
                    title: 'Example Search Result 2',
                    link: 'https://example.com/2',
                    snippet: 'This is a fallback result when the search service is unavailable.',
                    displayLink: 'example.com'
                }
            ];
            this.displayResults(mockResults);
        },

        addToHistory(query) {
            const timestamp = Date.now();
            const historyItem = { query, timestamp };
            
            // Remove duplicate if exists
            state.history = state.history.filter(item => item.query !== query);
            
            state.history.push(historyItem);
            if (state.history.length > config.maxHistoryItems) {
                state.history.shift();
            }
            
            localStorage.setItem('chromeSearchHistory', JSON.stringify(state.history));
            this.updateHistoryDisplay();
        },

        clearHistory() {
            state.history = [];
            localStorage.removeItem('chromeSearchHistory');
            this.updateHistoryDisplay();
        },

        updateHistoryDisplay() {
            searchHistory.innerHTML = '';
            state.history.slice().reverse().forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-content">
                        <div class="history-query">${item.query}</div>
                        <div class="history-time">${utils.formatTime(item.timestamp)}</div>
                    </div>
                    <button class="reuse-btn" title="Search again">
                        <i class="fas fa-redo"></i>
                    </button>
                `;

                historyItem.querySelector('.reuse-btn').addEventListener('click', () => {
                    searchInput.value = item.query;
                    this.performSearch(item.query);
                });

                searchHistory.appendChild(historyItem);
            });
        }
    };

    // Event Listeners
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            searchManager.performSearch(query);
        }
    });

    clearHistoryButton.addEventListener('click', () => {
        searchManager.clearHistory();
    });

    // Initialize
    searchManager.updateHistoryDisplay();
});
