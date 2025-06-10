document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        form: document.getElementById('search-form'),
        input: document.getElementById('search-input'),
        button: document.getElementById('search-button'),
        results: document.getElementById('search-results'),
        history: document.getElementById('search-history'),
        clearHistory: document.getElementById('clear-history')
    };

    // Configuration
    const config = {
        apiUrl: 'https://api.duckduckgo.com/',
        maxResults: 10,
        maxHistoryItems: 10,
        debounceTime: 300,
        timeout: 5000
    };

    // State management
    const state = {
        isSearching: false,
        currentQuery: '',
        history: JSON.parse(localStorage.getItem('braveSearchHistory')) || []
    };

    // Utility functions
    const utils = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

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

        async fetchWithTimeout(url, options = {}, timeout = config.timeout) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(id);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response;
            } catch (error) {
                clearTimeout(id);
                throw error;
            }
        },

        async searchDuckDuckGo(query) {
            const url = new URL(config.apiUrl);
            url.searchParams.append('q', query);
            url.searchParams.append('format', 'json');
            url.searchParams.append('no_html', '1');
            url.searchParams.append('skip_disambig', '1');
            url.searchParams.append('t', 'brave_search'); // Add user agent
            url.searchParams.append('kl', 'wt-wt'); // Set language to worldwide

            try {
                const response = await this.fetchWithTimeout(url.toString());
                const data = await response.json();
                return this.formatDuckDuckGoResults(data, query);
            } catch (error) {
                console.error('DuckDuckGo API error:', error);
                throw new Error('Search service temporarily unavailable');
            }
        },

        formatDuckDuckGoResults(data, query) {
            const results = [];

            // Add instant answer if available
            if (data.Abstract) {
                results.push({
                    title: data.Heading || 'Instant Answer',
                    link: data.AbstractURL || '#',
                    snippet: data.Abstract,
                    displayLink: new URL(data.AbstractURL || 'https://duckduckgo.com').hostname,
                    type: 'instant_answer'
                });
            }

            // Add related topics
            if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                data.RelatedTopics.forEach(topic => {
                    if (topic.Text && topic.FirstURL) {
                        const title = topic.Text.split(' - ')[0];
                        if (title.toLowerCase().includes(query.toLowerCase())) {
                            results.push({
                                title: title,
                                link: topic.FirstURL,
                                snippet: topic.Text,
                                displayLink: new URL(topic.FirstURL).hostname,
                                type: 'related_topic'
                            });
                        }
                    }
                });
            }

            // Add web results
            if (data.Results && data.Results.length > 0) {
                data.Results.forEach(result => {
                    if (result.Text && result.FirstURL) {
                        const title = result.Text.split(' - ')[0];
                        results.push({
                            title: title,
                            link: result.FirstURL,
                            snippet: result.Text,
                            displayLink: new URL(result.FirstURL).hostname,
                            type: 'web_result'
                        });
                    }
                });
            }

            // If no results found, add a fallback result
            if (results.length === 0) {
                results.push({
                    title: 'No direct results found',
                    link: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
                    snippet: `Try searching for "${query}" directly on DuckDuckGo for more results.`,
                    displayLink: 'duckduckgo.com',
                    type: 'web_result'
                });
            }

            return results.slice(0, config.maxResults);
        }
    };

    // Search manager
    const searchManager = {
        async performSearch(query) {
            if (!query.trim() || state.isSearching) return;

            state.isSearching = true;
            state.currentQuery = query;
            this.updateUI('loading');

            try {
                const results = await utils.searchDuckDuckGo(query);
                this.displayResults(results);
                this.addToHistory(query);
            } catch (error) {
                console.error('Search error:', error);
                this.displayError(error);
                this.displayMockResults(query);
            } finally {
                state.isSearching = false;
            }
        },

        updateUI(status) {
            switch (status) {
                case 'loading':
                    elements.results.innerHTML = `
                        <div class="loading">
                            <i class="fas fa-spinner fa-spin"></i>
                            Searching...
                        </div>
                    `;
                    elements.button.disabled = true;
                    break;
                case 'error':
                    elements.button.disabled = false;
                    break;
                case 'idle':
                    elements.button.disabled = false;
                    break;
            }
        },

        displayResults(items) {
            if (!items || items.length === 0) {
                elements.results.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <p>No results found for "${state.currentQuery}"</p>
                        <p class="suggestion">Try different keywords or check your spelling.</p>
                    </div>
                `;
                return;
            }

            elements.results.innerHTML = items.map(item => `
                <div class="result-item ${item.type}">
                    <div class="result-header">
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="result-title">
                            ${item.type === 'instant_answer' ? '<i class="fas fa-bolt"></i> ' : ''}
                            ${item.type === 'related_topic' ? '<i class="fas fa-link"></i> ' : ''}
                            ${item.title}
                        </a>
                        <div class="result-url">${item.displayLink}</div>
                    </div>
                    <div class="result-snippet">${item.snippet}</div>
                    ${item.type === 'instant_answer' ? 
                        `<div class="result-source">Source: <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.displayLink}</a></div>` 
                        : ''}
                </div>
            `).join('');
        },

        displayError(error) {
            elements.results.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-circle"></i>
                    ${error.message || 'Search failed. Please try again.'}
                </div>
            `;
        },

        displayMockResults(query) {
            const mockResults = [
                {
                    title: 'Brave Search Result 1',
                    link: 'https://example.com/1',
                    snippet: `This is a sample result for "${query}". The actual search is currently unavailable.`,
                    displayLink: 'example.com',
                    type: 'web_result'
                },
                {
                    title: 'Brave Search Result 2',
                    link: 'https://example.com/2',
                    snippet: 'This is a fallback result when the search service is unavailable.',
                    displayLink: 'example.com',
                    type: 'web_result'
                }
            ];
            this.displayResults(mockResults);
        },

        addToHistory(query) {
            const timestamp = Date.now();
            const historyItem = { query, timestamp };
            
            // Remove duplicate if exists
            state.history = state.history.filter(item => item.query !== query);
            
            // Add new item and maintain max size
            state.history.push(historyItem);
            if (state.history.length > config.maxHistoryItems) {
                state.history.shift();
            }
            
            localStorage.setItem('braveSearchHistory', JSON.stringify(state.history));
            this.updateHistoryDisplay();
        },

        clearHistory() {
            state.history = [];
            localStorage.removeItem('braveSearchHistory');
            this.updateHistoryDisplay();
        },

        updateHistoryDisplay() {
            elements.history.innerHTML = '';
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
                    elements.input.value = item.query;
                    this.performSearch(item.query);
                });

                elements.history.appendChild(historyItem);
            });
        }
    };

    // Event Listeners
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = elements.input.value.trim();
        if (query) {
            searchManager.performSearch(query);
        }
    });

    elements.clearHistory.addEventListener('click', () => {
        searchManager.clearHistory();
    });

    // Initialize
    searchManager.updateHistoryDisplay();
});
