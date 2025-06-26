// Global variables
let cryptoData = [];
let filteredData = [];
let autoRefreshInterval;

// API Configuration
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const API_PARAMS = '?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h';

// DOM Elements
const cryptoGrid = document.getElementById('cryptoGrid');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const lastUpdatedElement = document.getElementById('lastUpdated');
const footerTimeElement = document.getElementById('footerTime');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadCryptoData();
    setupEventListeners();
    startAutoRefresh();
});

// Set up event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    refreshBtn.addEventListener('click', loadCryptoData);
}

// Load cryptocurrency data from API
async function loadCryptoData() {
    showLoading();
    hideError();
    
    try {
        const response = await fetch(API_URL + API_PARAMS);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        cryptoData = data;
        filteredData = data;
        
        updateTimestamp();
        renderCryptoCards();
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        hideLoading();
        showError();
    }
}

// Render cryptocurrency cards
function renderCryptoCards() {
    if (filteredData.length === 0) {
        cryptoGrid.innerHTML = '<div class="no-results">No cryptocurrencies found.</div>';
        return;
    }
    
    cryptoGrid.innerHTML = filteredData.map(crypto => createCryptoCard(crypto)).join('');
}

// Create individual crypto card HTML
function createCryptoCard(crypto) {
    const priceChange = crypto.price_change_percentage_24h || 0;
    const changeClass = priceChange >= 0 ? 'positive' : 'negative';
    const changeSymbol = priceChange >= 0 ? '+' : '';
    
    return `
        <div class="crypto-card">
            <div class="crypto-header">
                <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon" loading="lazy">
                <div class="crypto-info">
                    <h3>${crypto.name}</h3>
                    <div class="crypto-symbol">${crypto.symbol}</div>
                </div>
            </div>
            
            <div class="crypto-price">
                $${formatPrice(crypto.current_price)}
            </div>
            
            <div class="crypto-change">
                <span class="change-percent ${changeClass}">
                    ${changeSymbol}${priceChange.toFixed(2)}%
                </span>
                <span class="change-24h">24h</span>
            </div>
            
            <div class="crypto-stats">
                <div class="stat-row">
                    <span class="stat-label">Market Cap:</span>
                    <span class="stat-value">$${formatLargeNumber(crypto.market_cap)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Volume (24h):</span>
                    <span class="stat-value">$${formatLargeNumber(crypto.total_volume)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Market Cap Rank:</span>
                    <span class="stat-value">#${crypto.market_cap_rank}</span>
                </div>
                ${crypto.high_24h ? `
                <div class="stat-row">
                    <span class="stat-label">24h High:</span>
                    <span class="stat-value">$${formatPrice(crypto.high_24h)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">24h Low:</span>
                    <span class="stat-value">$${formatPrice(crypto.low_24h)}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Handle search functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredData = cryptoData;
    } else {
        filteredData = cryptoData.filter(crypto => 
            crypto.name.toLowerCase().includes(searchTerm) ||
            crypto.symbol.toLowerCase().includes(searchTerm)
        );
    }
    
    renderCryptoCards();
}

// Format price with appropriate decimal places
function formatPrice(price) {
    if (price >= 1) {
        return price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else if (price >= 0.01) {
        return price.toLocaleString('en-US', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        });
    } else {
        return price.toLocaleString('en-US', {
            minimumFractionDigits: 6,
            maximumFractionDigits: 8
        });
    }
}

// Format large numbers (market cap, volume)
function formatLargeNumber(num) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    } else {
        return num.toLocaleString();
    }
}

// Update timestamp
function updateTimestamp() {
    const now = new Date().toLocaleTimeString();
    lastUpdatedElement.textContent = now;
    footerTimeElement.textContent = now;
}

// Show/hide loading state
function showLoading() {
    loadingElement.classList.remove('hidden');
    cryptoGrid.style.display = 'none';
}

function hideLoading() {
    loadingElement.classList.add('hidden');
    cryptoGrid.style.display = 'grid';
}

// Show/hide error state
function showError() {
    errorElement.classList.remove('hidden');
    cryptoGrid.style.display = 'none';
}

function hideError() {
    errorElement.classList.add('hidden');
}

// Auto-refresh functionality
function startAutoRefresh() {
    // Refresh every 30 seconds
    autoRefreshInterval = setInterval(() => {
        loadCryptoData();
    }, 30000);
}

// Stop auto-refresh (useful for cleanup)
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// Cleanup when page is unloaded
window.addEventListener('beforeunload', stopAutoRefresh);