// Global variables
let cryptoData = [];
let filteredData = [];
let autoRefreshInterval;
let portfolio = {};
let currentModalCrypto = null;

// API Configuration
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const TOP_COINS_PARAMS = '?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h';

// Custom coins you want to always include (even if not in top 50)
const CUSTOM_COINS = ['edu-coin', 'shiba-inu', 'pepe', 'dogecoin', 'chainlink', 'uniswap']; // Add any coin IDs you want here

// DOM Elements
const cryptoGrid = document.getElementById('cryptoGrid');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const lastUpdatedElement = document.getElementById('lastUpdated');
const footerTimeElement = document.getElementById('footerTime');

// Portfolio DOM Elements
const portfolioSection = document.getElementById('portfolioSection');
const portfolioGrid = document.getElementById('portfolioGrid');
const totalValueElement = document.getElementById('totalValue');
const totalChangeElement = document.getElementById('totalChange');
const holdingsCountElement = document.getElementById('holdingsCount');
const clearPortfolioBtn = document.getElementById('clearPortfolio');

// Modal DOM Elements
const portfolioModal = document.getElementById('portfolioModal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalCryptoIcon = document.getElementById('modalCryptoIcon');
const modalCryptoName = document.getElementById('modalCryptoName');
const modalCryptoPrice = document.getElementById('modalCryptoPrice');
const amountInput = document.getElementById('amountInput');
const amountSymbol = document.getElementById('amountSymbol');
const calculatedValue = document.getElementById('calculatedValue');
const cancelModal = document.getElementById('cancelModal');
const addToPortfolio = document.getElementById('addToPortfolio');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadPortfolioFromStorage();
    loadCryptoData();
    setupEventListeners();
    startAutoRefresh();
});

// Set up event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    refreshBtn.addEventListener('click', loadCryptoData);
    
    // Portfolio modal events
    modalClose.addEventListener('click', closeModal);
    cancelModal.addEventListener('click', closeModal);
    addToPortfolio.addEventListener('click', handleAddToPortfolio);
    amountInput.addEventListener('input', updateCalculatedValue);
    clearPortfolioBtn.addEventListener('click', clearPortfolio);
    
    // Close modal when clicking outside
    portfolioModal.addEventListener('click', function(e) {
        if (e.target === portfolioModal) {
            closeModal();
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !portfolioModal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// Load cryptocurrency data from API (now includes custom coins)
async function loadCryptoData() {
    showLoading();
    hideError();
    
    try {
        // Fetch top 50 coins
        const topCoinsResponse = await fetch(API_URL + TOP_COINS_PARAMS);
        if (!topCoinsResponse.ok) {
            throw new Error(`HTTP error! status: ${topCoinsResponse.status}`);
        }
        const topCoinsData = await topCoinsResponse.json();
        
        // Fetch custom coins (like EDU)
        const customCoinsIds = CUSTOM_COINS.join(',');
        const customCoinsParams = `?ids=${customCoinsIds}&vs_currency=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
        
        const customCoinsResponse = await fetch(API_URL + customCoinsParams);
        if (!customCoinsResponse.ok) {
            console.warn('Failed to fetch some custom coins, but continuing with top coins');
        }
        const customCoinsData = await customCoinsResponse.json();
        
        // Combine data, avoiding duplicates
        const topCoinsIds = topCoinsData.map(coin => coin.id);
        const uniqueCustomCoins = customCoinsData.filter(coin => !topCoinsIds.includes(coin.id));
        
        cryptoData = [...topCoinsData, ...uniqueCustomCoins];
        filteredData = cryptoData;
        
        updateTimestamp();
        renderCryptoCards();
        updatePortfolioDisplay();
        hideLoading();
        
        console.log(`✅ Loaded ${cryptoData.length} coins (${topCoinsData.length} top coins + ${uniqueCustomCoins.length} custom coins)`);
        
        // Log which custom coins were loaded
        const loadedCustomCoins = uniqueCustomCoins.map(coin => `${coin.name} (${coin.symbol.toUpperCase()})`);
        if (loadedCustomCoins.length > 0) {
            console.log(`📌 Custom coins loaded: ${loadedCustomCoins.join(', ')}`);
        }
        
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
    
    // Add event listeners to portfolio buttons
    document.querySelectorAll('.add-to-portfolio-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cryptoId = this.dataset.cryptoId;
            const crypto = cryptoData.find(c => c.id === cryptoId);
            openPortfolioModal(crypto);
        });
    });
}

// Create individual crypto card HTML
function createCryptoCard(crypto) {
    const priceChange = crypto.price_change_percentage_24h || 0;
    const changeClass = priceChange >= 0 ? 'positive' : 'negative';
    const changeSymbol = priceChange >= 0 ? '+' : '';
    const isInPortfolio = portfolio.hasOwnProperty(crypto.id);
    const isCustomCoin = CUSTOM_COINS.includes(crypto.id);
    
    return `
        <div class="crypto-card ${isCustomCoin ? 'custom-coin' : ''}">
            ${isCustomCoin ? '<div class="custom-badge">⭐ Featured</div>' : ''}
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
                    <span class="stat-value">#${crypto.market_cap_rank || 'N/A'}</span>
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
            
            <button class="add-to-portfolio-btn ${isInPortfolio ? 'in-portfolio' : ''}" 
                    data-crypto-id="${crypto.id}">
                ${isInPortfolio ? '✓ In Portfolio' : '+ Add to Portfolio'}
            </button>
        </div>
    `;
}

// Portfolio Modal Functions
function openPortfolioModal(crypto) {
    currentModalCrypto = crypto;
    modalTitle.textContent = portfolio[crypto.id] ? 'Edit Portfolio' : 'Add to Portfolio';
    modalCryptoIcon.src = crypto.image;
    modalCryptoIcon.alt = crypto.name;
    modalCryptoName.textContent = crypto.name;
    modalCryptoPrice.textContent = `$${formatPrice(crypto.current_price)}`;
    amountSymbol.textContent = crypto.symbol.toUpperCase();
    
    // Pre-fill amount if already in portfolio
    if (portfolio[crypto.id]) {
        amountInput.value = portfolio[crypto.id].amount;
        updateCalculatedValue();
    } else {
        amountInput.value = '';
        calculatedValue.textContent = '$0.00';
    }
    
    portfolioModal.classList.remove('hidden');
    amountInput.focus();
}

function closeModal() {
    portfolioModal.classList.add('hidden');
    currentModalCrypto = null;
    amountInput.value = '';
}

function updateCalculatedValue() {
    if (!currentModalCrypto || !amountInput.value) {
        calculatedValue.textContent = '$0.00';
        return;
    }
    
    const amount = parseFloat(amountInput.value);
    const value = amount * currentModalCrypto.current_price;
    calculatedValue.textContent = `$${formatPrice(value)}`;
}

function handleAddToPortfolio() {
    const amount = parseFloat(amountInput.value);
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    // Add or update portfolio
    portfolio[currentModalCrypto.id] = {
        amount: amount,
        symbol: currentModalCrypto.symbol,
        name: currentModalCrypto.name,
        image: currentModalCrypto.image
    };
    
    savePortfolioToStorage();
    updatePortfolioDisplay();
    renderCryptoCards(); // Re-render to update button states
    closeModal();
}

// Portfolio Management Functions
function updatePortfolioDisplay() {
    const portfolioKeys = Object.keys(portfolio);
    
    if (portfolioKeys.length === 0) {
        portfolioSection.classList.add('hidden');
        return;
    }
    
    portfolioSection.classList.remove('hidden');
    
    let totalValue = 0;
    let totalChange = 0;
    let portfolioHTML = '';
    
    portfolioKeys.forEach(cryptoId => {
        const holding = portfolio[cryptoId];
        const crypto = cryptoData.find(c => c.id === cryptoId);
        
        if (crypto) {
            const holdingValue = holding.amount * crypto.current_price;
            const change24h = (crypto.price_change_percentage_24h || 0) / 100;
            const changeValue = holdingValue * change24h;
            
            totalValue += holdingValue;
            totalChange += changeValue;
            
            portfolioHTML += createPortfolioItem(holding, crypto, holdingValue, changeValue);
        }
    });
    
    // Update summary
    totalValueElement.textContent = `$${formatPrice(totalValue)}`;
    
    const changePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;
    const changeClass = totalChange >= 0 ? 'positive' : 'negative';
    const changeSymbol = totalChange >= 0 ? '+' : '';
    
    totalChangeElement.innerHTML = `
        <span class="${changeClass}">
            ${changeSymbol}$${formatPrice(Math.abs(totalChange))} 
            (${changeSymbol}${changePercent.toFixed(2)}%)
        </span>
    `;
    
    holdingsCountElement.textContent = `${portfolioKeys.length} coin${portfolioKeys.length !== 1 ? 's' : ''}`;
    
    portfolioGrid.innerHTML = portfolioHTML;
}

function createPortfolioItem(holding, crypto, value, change) {
    const changeClass = change >= 0 ? 'positive' : 'negative';
    const changeSymbol = change >= 0 ? '+' : '';
    
    return `
        <div class="portfolio-item">
            <div class="portfolio-item-header">
                <img src="${holding.image}" alt="${holding.name}" class="portfolio-item-icon">
                <div class="portfolio-item-info">
                    <h4>${holding.name}</h4>
                    <div class="portfolio-item-symbol">${holding.symbol}</div>
                </div>
            </div>
            <div class="portfolio-item-stats">
                <div class="portfolio-stat-item">
                    <span>Amount:</span>
                    <span>${holding.amount} ${holding.symbol.toUpperCase()}</span>
                </div>
                <div class="portfolio-stat-item">
                    <span>Value:</span>
                    <span>$${formatPrice(value)}</span>
                </div>
                <div class="portfolio-stat-item">
                    <span>Price:</span>
                    <span>$${formatPrice(crypto.current_price)}</span>
                </div>
                <div class="portfolio-stat-item">
                    <span>24h:</span>
                    <span class="${changeClass}">${changeSymbol}$${formatPrice(Math.abs(change))}</span>
                </div>
            </div>
        </div>
    `;
}

function clearPortfolio() {
    if (confirm('Are you sure you want to clear your entire portfolio?')) {
        portfolio = {};
        savePortfolioToStorage();
        updatePortfolioDisplay();
        renderCryptoCards();
    }
}

// Storage Functions
function savePortfolioToStorage() {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
}

function loadPortfolioFromStorage() {
    const saved = localStorage.getItem('cryptoPortfolio');
    if (saved) {
        portfolio = JSON.parse(saved);
    }
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