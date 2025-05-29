document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Using a single object for better organization
    const elements = {
        fromLanguage: document.getElementById('from-language'),
        toLanguage: document.getElementById('to-language'),
        swapButton: document.getElementById('swap-languages'),
        inputText: document.getElementById('input-text'),
        outputText: document.getElementById('output-text'),
        clearInputButton: document.getElementById('clear-input'),
        copyOutputButton: document.getElementById('copy-output'),
        clearHistoryButton: document.getElementById('clear-history'),
        translationHistory: document.getElementById('translation-history')
    };

    // Configuration
    const config = {
        apiUrl: 'https://libretranslate.de/translate',
        debounceTime: 500,
        maxHistoryItems: 10,
        supportedLanguages: {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese'
        }
    };

    // State management
    const state = {
        history: JSON.parse(localStorage.getItem('translationHistory')) || [],
        isTranslating: false,
        lastTranslation: null
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
        }
    };

    // Translation functions
    const translator = {
        async translate(text, fromLang, toLang) {
            if (!text.trim() || fromLang === toLang) {
                return text;
            }

            try {
                const response = await utils.fetchWithTimeout(config.apiUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        q: text,
                        source: fromLang,
                        target: toLang,
                        format: 'text'
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Translation failed: ${response.statusText}`);
                }

                const data = await response.json();
                return data.translatedText;
            } catch (error) {
                console.error('Translation error:', error);
                // Fallback to mock translations for common phrases
                return this.getMockTranslation(text, fromLang, toLang);
            }
        },

        getMockTranslation(text, fromLang, toLang) {
            const mockTranslations = {
                'en-es': {
                    'hello': 'hola',
                    'good morning': 'buenos días',
                    'how are you': '¿cómo estás?',
                    'thank you': 'gracias',
                    'goodbye': 'adiós'
                },
                'es-en': {
                    'hola': 'hello',
                    'buenos días': 'good morning',
                    '¿cómo estás?': 'how are you',
                    'gracias': 'thank you',
                    'adiós': 'goodbye'
                }
            };

            const key = `${fromLang}-${toLang}`;
            const mockDict = mockTranslations[key] || {};
            const lowerText = text.toLowerCase();

            return mockDict[lowerText] || `[${toLang}] ${text}`;
        }
    };

    // History management
    const historyManager = {
        add(fromText, toText, fromLang, toLang) {
            const timestamp = Date.now();
            const historyItem = { fromText, toText, fromLang, toLang, timestamp };
            
            // Remove duplicate if exists
            state.history = state.history.filter(item => 
                item.fromText !== fromText || 
                item.toText !== toText || 
                item.fromLang !== fromLang || 
                item.toLang !== toLang
            );
            
            state.history.push(historyItem);
            if (state.history.length > config.maxHistoryItems) {
                state.history.shift();
            }
            
            localStorage.setItem('translationHistory', JSON.stringify(state.history));
            this.updateDisplay();
        },

        clear() {
            state.history = [];
            localStorage.removeItem('translationHistory');
            this.updateDisplay();
        },

        updateDisplay() {
            elements.translationHistory.innerHTML = '';
            state.history.slice().reverse().forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-content">
                        <div class="history-text">
                            <div class="from-text">${item.fromText}</div>
                            <div class="to-text">${item.toText}</div>
                        </div>
                        <div class="history-languages">
                            ${config.supportedLanguages[item.fromLang]} → ${config.supportedLanguages[item.toLang]}
                            <span class="time">${utils.formatTime(item.timestamp)}</span>
                        </div>
                    </div>
                    <button class="reuse-btn" title="Reuse this translation">
                        <i class="fas fa-redo"></i>
                    </button>
                `;

                historyItem.querySelector('.reuse-btn').addEventListener('click', () => {
                    elements.fromLanguage.value = item.fromLang;
                    elements.toLanguage.value = item.toLang;
                    elements.inputText.value = item.fromText;
                    performTranslation();
                });

                elements.translationHistory.appendChild(historyItem);
            });
        }
    };

    // Main translation function
    async function performTranslation() {
        const text = elements.inputText.value.trim();
        if (!text || state.isTranslating) return;

        const fromLang = elements.fromLanguage.value;
        const toLang = elements.toLanguage.value;

        if (fromLang === toLang) {
            elements.outputText.value = text;
            return;
        }

        state.isTranslating = true;
        elements.outputText.value = 'Translating...';

        try {
            const translatedText = await translator.translate(text, fromLang, toLang);
            elements.outputText.value = translatedText;
            historyManager.add(text, translatedText, fromLang, toLang);
            state.lastTranslation = { text, translatedText, fromLang, toLang };
        } catch (error) {
            console.error('Translation failed:', error);
            elements.outputText.value = 'Translation failed. Please try again.';
        } finally {
            state.isTranslating = false;
        }
    }

    // Event Listeners
    elements.inputText.addEventListener('input', utils.debounce(performTranslation, config.debounceTime));
    elements.fromLanguage.addEventListener('change', performTranslation);
    elements.toLanguage.addEventListener('change', performTranslation);

    elements.swapButton.addEventListener('click', () => {
        if (state.lastTranslation) {
            const { fromLang, toLang } = state.lastTranslation;
            elements.fromLanguage.value = toLang;
            elements.toLanguage.value = fromLang;
            elements.inputText.value = state.lastTranslation.translatedText;
            performTranslation();
        } else {
            const tempLang = elements.fromLanguage.value;
            elements.fromLanguage.value = elements.toLanguage.value;
            elements.toLanguage.value = tempLang;
            const tempText = elements.inputText.value;
            elements.inputText.value = elements.outputText.value;
            elements.outputText.value = tempText;
        }
    });

    elements.clearInputButton.addEventListener('click', () => {
        elements.inputText.value = '';
        elements.outputText.value = '';
        state.lastTranslation = null;
    });

    elements.copyOutputButton.addEventListener('click', () => {
        elements.outputText.select();
        document.execCommand('copy');
        const originalTitle = elements.copyOutputButton.title;
        elements.copyOutputButton.title = 'Copied!';
        setTimeout(() => {
            elements.copyOutputButton.title = originalTitle;
        }, 1000);
    });

    elements.clearHistoryButton.addEventListener('click', () => {
        historyManager.clear();
    });

    // Initialize
    historyManager.updateDisplay();
}); 