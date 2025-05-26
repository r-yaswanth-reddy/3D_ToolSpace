document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts
    initializeCharts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadAnalyticsData();
});

function initializeCharts() {
    // Tool Usage Chart
    const toolUsageCtx = document.getElementById('toolUsageChart').getContext('2d');
    window.toolUsageChart = new Chart(toolUsageCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Usage Count',
                data: [],
                backgroundColor: '#007BFF',
                borderColor: '#0056b3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Daily Activity Chart
    const dailyActivityCtx = document.getElementById('dailyActivityChart').getContext('2d');
    window.dailyActivityChart = new Chart(dailyActivityCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Sessions',
                data: [],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Session Duration Chart
    const sessionDurationCtx = document.getElementById('sessionDurationChart').getContext('2d');
    window.sessionDurationChart = new Chart(sessionDurationCtx, {
        type: 'doughnut',
        data: {
            labels: ['0-15 min', '15-30 min', '30-60 min', '60+ min'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#007BFF',
                    '#28a745',
                    '#ffc107',
                    '#dc3545'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Features Chart
    const featuresCtx = document.getElementById('featuresChart').getContext('2d');
    window.featuresChart = new Chart(featuresCtx, {
        type: 'radar',
        data: {
            labels: ['3D Modeling', 'Rendering', 'Animation', 'Texturing', 'Export'],
            datasets: [{
                label: 'Usage',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: '#007BFF',
                pointBackgroundColor: '#007BFF',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#007BFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function setupEventListeners() {
    // Time range selector
    const timeRangeSelect = document.getElementById('timeRange');
    timeRangeSelect.addEventListener('change', () => {
        loadAnalyticsData();
    });

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', exportData);
}

async function loadAnalyticsData() {
    const timeRange = document.getElementById('timeRange').value;
    
    try {
        // Show loading state
        showLoading(true);
        
        // TODO: Replace with actual API call
        const data = await mockFetchAnalyticsData(timeRange);
        
        // Update charts
        updateCharts(data);
        
        // Update summary cards
        updateSummaryCards(data.summary);
    } catch (error) {
        console.error('Failed to load analytics data:', error);
        showError('Failed to load analytics data. Please try again.');
    } finally {
        showLoading(false);
    }
}

function updateCharts(data) {
    // Update Tool Usage Chart
    toolUsageChart.data.labels = data.toolUsage.labels;
    toolUsageChart.data.datasets[0].data = data.toolUsage.data;
    toolUsageChart.update();

    // Update Daily Activity Chart
    dailyActivityChart.data.labels = data.dailyActivity.labels;
    dailyActivityChart.data.datasets[0].data = data.dailyActivity.data;
    dailyActivityChart.update();

    // Update Session Duration Chart
    sessionDurationChart.data.datasets[0].data = data.sessionDuration;
    sessionDurationChart.update();

    // Update Features Chart
    featuresChart.data.datasets[0].data = data.features;
    featuresChart.update();
}

function updateSummaryCards(summary) {
    document.getElementById('totalSessions').textContent = summary.totalSessions;
    document.getElementById('avgSessionDuration').textContent = `${summary.avgSessionDuration} min`;
    document.getElementById('mostUsedTool').textContent = summary.mostUsedTool;
    document.getElementById('totalToolsUsed').textContent = summary.totalToolsUsed;
}

function exportData() {
    const timeRange = document.getElementById('timeRange').value;
    const data = {
        timeRange,
        exportDate: new Date().toISOString(),
        charts: {
            toolUsage: toolUsageChart.data,
            dailyActivity: dailyActivityChart.data,
            sessionDuration: sessionDurationChart.data,
            features: featuresChart.data
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${timeRange}days.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showLoading(isLoading) {
    const charts = document.querySelectorAll('.analytics-card canvas');
    charts.forEach(canvas => {
        canvas.style.opacity = isLoading ? '0.5' : '1';
    });
    
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.disabled = isLoading;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    document.querySelector('.analytics-container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Mock API call (replace with actual API call)
async function mockFetchAnalyticsData(timeRange) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                toolUsage: {
                    labels: ['3D Modeling', 'Rendering', 'Animation', 'Texturing', 'Export'],
                    data: [45, 30, 25, 20, 15]
                },
                dailyActivity: {
                    labels: Array.from({ length: 7 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        return date.toLocaleDateString('en-US', { weekday: 'short' });
                    }),
                    data: [5, 8, 6, 9, 7, 4, 6]
                },
                sessionDuration: [20, 35, 25, 20],
                features: [85, 65, 45, 75, 55],
                summary: {
                    totalSessions: 45,
                    avgSessionDuration: 35,
                    mostUsedTool: '3D Modeling',
                    totalToolsUsed: 5
                }
            });
        }, 1000);
    });
} 