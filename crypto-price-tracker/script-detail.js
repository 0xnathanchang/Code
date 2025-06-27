// Global variables
let cryptoData = [];
let filteredData = [];
let autoRefreshInterval;
let portfolio = {}; // Stores { id: { amount: X, currentPrice: Y, ... } }
let currentModalCrypto = null; // Stores the crypto object for the currently open modal
let currentDetailCoinId = null; // Stores the ID of the crypto currently displayed in the detail view
let priceChart = null; // Chart.js instance for the detail view
let currentView = 'dashboard'; // Track current view to update buttons correctly

// View management
const dashboardView = document.getElementById('dashboardView');
const coinDetailView = document.getElementById('coinDetailView');

// API Configuration
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const COIN_DETAIL_URL = 'https://api.coingecko.com/api/v3/coins';
// *** THIS WAS THE MISSING PIECE ***
const CHART_API_URL = 'https://api.coingecko.com/api/v3/coins'; // API for chart data
// **********************************

// Parameters for fetching top coins (per_page increased for more data)
const TOP_COINS_PARAMS = '?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d,14d,30d';

// Custom coins you want to always include (currently commented out as per previous discussion)
// const CUSTOM_COINS = ['ethereum', 'dogecoin', 'solana']; // Example custom coins

// DOM Elements - Dashboard View
const cryptoGrid = document.getElementById('cryptoGrid');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const lastUpdatedElement = document.getElementById('lastUpdated');
const footerTimeElement = document.getElementById('footerTime');

// DOM Elements - Portfolio Section
const portfolioSection = document.getElementById('portfolioSection');
const portfolioGrid = document.getElementById('portfolioGrid');
const totalValueElement = document.getElementById('totalValue');
const totalChangeElement = document.getElementById('totalChange');
const holdingsCountElement = document.getElementById('holdingsCount');
const clearPortfolioBtn = document.getElementById('clearPortfolio');

// DOM Elements - Coin Detail View
const backToMainBtn = document.getElementById('backToMain');
const detailCoinIcon = document.getElementById('detailCoinIcon');
const detailCoinName = document.getElementById('detailCoinName');
const detailCoinSymbol = document.getElementById('detailCoinSymbol');
const detailCurrentPrice = document.getElementById('detailCurrentPrice');
const detailPriceChange = document.getElementById('detailPriceChange');
const detailAddToPortfolioBtn = document.getElementById('detailAddToPortfolio');

// Chart elements
const priceChartCanvas = document.getElementById('priceChart');
const chartTimeframeBtns = document.querySelectorAll('.timeframe-btn');
const chartLoadingElement = document.getElementById('chartLoading');

// Detail Statistics
const detailMarketCap = document.getElementById('detailMarketCap');
const detailVolume = document.getElementById('detailVolume');
const detailRank = document.getElementById('detailRank');
const detailCirculating = document.getElementById('detailCirculating');
const detailTotalSupply = document.getElementById('detailTotalSupply');
const detailHigh24h = document.getElementById('detailHigh24h');
const detailLow24h = document.getElementById('detailLow24h');
const detailATH = document.getElementById('detailATH');
const detailATHDate = document.getElementById('detailATHDate');
const detailATL = document.getElementById('detailATL');
const detailChange1h = document.getElementById('detailChange1h');
const detailChange24h = document.getElementById('detailChange24h');
const detailChange7d = document.getElementById('detailChange7d');
const detailChange14d = document.getElementById('detailChange14d');
const detailChange30d = document.getElementById('detailChange30d');

// About section elements
const aboutCoinName = document.getElementById('aboutCoinName');
const coinDescription = document.getElementById('coinDescription');
const coinLinksContainer = document.getElementById('coinLinksContainer');

// DOM Elements - Add to Portfolio Modal
const portfolioModal = document.getElementById('portfolioModal');
const modalCloseBtn = document.getElementById('modalClose');
const cancelModalBtn = document.getElementById('cancelModal');
const addToPortfolioBtn = document.getElementById('addToPortfolio');
const modalTitle = document.getElementById('modalTitle');
const modalCryptoIcon = document.getElementById('modalCryptoIcon');
const modalCryptoName = document.getElementById('modalCryptoName');
const modalCryptoPrice = document.getElementById('modalCryptoPrice');
const amountInput = document.getElementById('amountInput');
const amountSymbol = document.getElementById('amountSymbol');
const calculatedValue = document.getElementById('calculatedValue');


// --- Utility Functions ---

/**
 * Formats a number as USD currency.
 * @param {number} num - The number to format.
 * @returns {string} Formatted currency string.
 */
function formatCurrency(num) {
    // Robust check for null, undefined, NaN, or non-finite numbers (like Infinity)
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
        return '$--'; // Return a placeholder for invalid numbers
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        // Adjust decimals for large vs small numbers. max of 8 is usually enough for cryptos, 0 for thousands/millions
        maximumFractionDigits: num >= 1000 ? 0 : 8
    }).format(num);
}

/**
 * Formats a number with commas and limits decimals.
 * @param {number} num - The number to format.
 * @param {number} decimals - Number of decimal places.
 * @returns {string} Formatted number string.
 */
function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
        return '--'; // Return a placeholder for invalid numbers
    }
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: decimals
    }).format(num);
}

/**
 * Formats a percentage.
 * @param {number} num - The number to format.
 * @returns {string} Formatted percentage string.
 */
function formatPercentage(num) {
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
        return '--%'; // Return a placeholder for invalid numbers
    }
    // toFixed() also throws for NaN/Infinity, so it's protected by the above check.
    return `${num.toFixed(2)}%`;
}

/**
 * Adds a class based on whether a number is positive or negative.
 * @param {HTMLElement} element - The DOM element to modify.
 * @param {number} value - The numerical value to check.
 */
function applyChangeClass(element, value) {
    element.classList.remove('positive', 'negative');
    if (value > 0) {
        element.classList.add('positive');
    } else if (value < 0) {
        element.classList.add('negative');
    }
}

/**
 * Switches the active view.
 * @param {string} viewName - 'dashboard' or 'detail'.
 */
function switchView(viewName) {
    if (viewName === 'dashboard') {
        dashboardView.classList.remove('hidden');
        coinDetailView.classList.add('hidden');
        currentView = 'dashboard';
        searchInput.value = ''; // Clear search on back
        renderCryptoGrid(cryptoData); // Re-render full list (or filteredData if you prefer)
    } else if (viewName === 'detail') {
        dashboardView.classList.add('hidden');
        coinDetailView.classList.remove('hidden');
        currentView = 'detail';
    }
}

// --- Data Fetching and Rendering (Dashboard) ---

/**
 * Fetches cryptocurrency data from CoinGecko API.
 */
async function loadCryptoData() {
    loadingElement.classList.remove('hidden');
    errorElement.classList.add('hidden');
    cryptoGrid.innerHTML = ''; // Clear previous data

    try {
        const response = await fetch(`${API_URL}${TOP_COINS_PARAMS}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Update current prices for portfolio holdings
        Object.keys(portfolio).forEach(id => {
            const coin = data.find(c => c.id === id);
            if (coin) {
                portfolio[id].currentPrice = coin.current_price;
            }
        });

        cryptoData = data; // Store raw data
        filteredData = data; // Initialize filtered data
        renderCryptoGrid(filteredData);
        updateLastUpdatedTime();
        renderPortfolioSummary();
        renderPortfolioItems();

    } catch (e) {
        console.error('Error fetching crypto data:', e);
        errorElement.classList.remove('hidden');
        cryptoGrid.innerHTML = '<p class="text-center text-gray-500">Could not load cryptocurrencies. Please try again.</p>';
    } finally {
        loadingElement.classList.add('hidden');
    }
}

/**
 * Renders the cryptocurrency cards in the grid.
 * @param {Array} cryptos - Array of cryptocurrency objects.
 */
function renderCryptoGrid(cryptos) {
    cryptoGrid.innerHTML = ''; // Clear existing cards
    if (cryptos.length === 0 && searchInput.value !== '') {
        cryptoGrid.innerHTML = '<p class="text-center text-gray-500">No results found for your search.</p>';
        return;
    } else if (cryptos.length === 0) {
         cryptoGrid.innerHTML = '<p class="text-center text-gray-500">No cryptocurrency data available.</p>';
        return;
    }

    cryptos.forEach(crypto => {
        const inPortfolio = portfolio[crypto.id] ? 'in-portfolio' : '';
        const card = document.createElement('div');
        card.classList.add('crypto-card');
        if (portfolio[crypto.id]) {
            card.classList.add('custom-coin');
        }

        // Ensure priceChange24h is a number before passing to formatPercentage and applyChangeClass
        const priceChange24h = typeof crypto.price_change_percentage_24h === 'number' ? crypto.price_change_percentage_24h : null;
        const changeClass = priceChange24h > 0 ? 'positive' : (priceChange24h < 0 ? 'negative' : '');
        const formattedChange = formatPercentage(priceChange24h);

        card.innerHTML = `
            ${portfolio[crypto.id] ? '<span class="custom-badge">In Portfolio</span>' : ''}
            <div class="crypto-header">
                <img src="${crypto.image}" alt="${crypto.name} icon" class="crypto-icon">
                <div class="crypto-info">
                    <h3>${crypto.name}</h3>
                    <span class="crypto-symbol">${crypto.symbol}</span>
                </div>
            </div>
            <div class="crypto-price">${formatCurrency(crypto.current_price)}</div>
            <div class="crypto-change">
                <span class="change-percent ${changeClass}">${formattedChange}</span>
                <span class="change-value ${changeClass}">${formatCurrency(crypto.price_change_24h)}</span>
            </div>
            <div class="crypto-stats">
                <div class="stat-row">
                    <span class="stat-label">Market Cap:</span>
                    <span class="stat-value">${formatCurrency(crypto.market_cap)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Volume (24h):</span>
                    <span class="stat-value">${formatCurrency(crypto.total_volume)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Rank:</span>
                    <span class="stat-value">#${crypto.market_cap_rank || '--'}</span>
                </div>
            </div>
            <button class="add-to-portfolio-btn ${inPortfolio}" data-id="${crypto.id}" data-name="${crypto.name}" data-symbol="${crypto.symbol}" data-price="${crypto.current_price}" data-image="${crypto.image}">
                ${inPortfolio ? '✓ In Portfolio' : '+ Add to Portfolio'}
            </button>
        `;
        cryptoGrid.appendChild(card);

        // Add event listener to the "Add to Portfolio" button
        const addBtn = card.querySelector('.add-to-portfolio-btn');
        addBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent card click event from firing
            openPortfolioModal({
                id: addBtn.dataset.id,
                name: addBtn.dataset.name,
                symbol: addBtn.dataset.symbol,
                price: parseFloat(addBtn.dataset.price),
                image: addBtn.dataset.image
            });
        });

        // Add event listener to the entire card to open detail view
        card.addEventListener('click', () => showCoinDetail(crypto.id));
    });
}

/**
 * Updates the "Last updated" time in the header and footer.
 */
function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    lastUpdatedElement.textContent = timeString;
    footerTimeElement.textContent = timeString;
}


// --- Search Functionality ---

/**
 * Filters the crypto data based on search input.
 */
searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    filteredData = cryptoData.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm) ||
        crypto.symbol.toLowerCase().includes(searchTerm)
    );
    renderCryptoGrid(filteredData);
});


// --- Portfolio Management ---

/**
 * Loads portfolio from localStorage.
 */
function loadPortfolio() {
    const storedPortfolio = localStorage.getItem('cryptoPortfolio');
    if (storedPortfolio) {
        portfolio = JSON.parse(storedPortfolio);
    } else {
        portfolio = {};
    }
}

/**
 * Saves portfolio to localStorage.
 */
function savePortfolio() {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
    renderPortfolioSummary();
    renderPortfolioItems();
    // Re-render dashboard to update "Add to Portfolio" buttons if on dashboard view
    if (currentView === 'dashboard') {
        renderCryptoGrid(filteredData);
    } else if (currentView === 'detail' && currentDetailCoinId) {
        // If in detail view, update the button for the current coin
        const detailCoin = cryptoData.find(c => c.id === currentDetailCoinId);
        if (detailCoin) {
             updateDetailAddToPortfolioButton(detailCoin);
        }
    }
}

/**
 * Opens the "Add to Portfolio" modal.
 * @param {object} crypto - The cryptocurrency object to add/edit.
 */
function openPortfolioModal(crypto) {
    currentModalCrypto = crypto;
    modalTitle.textContent = portfolio[crypto.id] ? 'Edit Holdings' : 'Add to Portfolio';
    modalCryptoIcon.src = crypto.image;
    modalCryptoName.textContent = crypto.name;
    modalCryptoPrice.textContent = formatCurrency(crypto.price); // Use passed crypto.price
    amountSymbol.textContent = crypto.symbol.toUpperCase();

    // Pre-fill amount if already in portfolio
    if (portfolio[crypto.id]) {
        amountInput.value = portfolio[crypto.id].amount;
    } else {
        amountInput.value = '';
    }
    updateCalculatedValue(); // Update initial calculation

    portfolioModal.classList.remove('hidden');
    portfolioModal.style.display = 'flex'; // Ensure it's displayed as flex for centering
}

/**
 * Closes the "Add to Portfolio" modal.
 */
function closePortfolioModal() {
    portfolioModal.classList.add('hidden');
    portfolioModal.style.display = 'none'; // Hide completely
    currentModalCrypto = null;
    amountInput.value = '';
}

/**
 * Updates the calculated total value in the modal based on amount input.
 */
function updateCalculatedValue() {
    const amount = parseFloat(amountInput.value);
    if (!isNaN(amount) && currentModalCrypto) {
        calculatedValue.textContent = formatCurrency(amount * currentModalCrypto.price);
    } else {
        calculatedValue.textContent = '$0.00';
    }
}

amountInput.addEventListener('input', updateCalculatedValue);
modalCloseBtn.addEventListener('click', closePortfolioModal);
cancelModalBtn.addEventListener('click', closePortfolioModal);

/**
 * Handles adding/updating a coin in the portfolio.
 */
addToPortfolioBtn.addEventListener('click', () => {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0 || !currentModalCrypto) {
        alert('Please enter a valid amount.');
        return;
    }

    portfolio[currentModalCrypto.id] = {
        id: currentModalCrypto.id, // Store ID for consistency
        name: currentModalCrypto.name,
        symbol: currentModalCrypto.symbol,
        image: currentModalCrypto.image,
        amount: amount,
        purchasePrice: currentModalCrypto.price, // Store purchase price at time of adding
        currentPrice: currentModalCrypto.price, // This will be updated on refresh
    };

    savePortfolio();
    closePortfolioModal();
});

/**
 * Updates portfolio summary (Total Value, 24h Change, Holdings Count).
 */
function renderPortfolioSummary() {
    let totalPortfolioValue = 0;
    let totalPortfolioChange24h = 0;
    let holdingsCount = 0;

    Object.values(portfolio).forEach(item => {
        const currentCrypto = cryptoData.find(c => c.id === item.id);
        if (currentCrypto) {
            const value = item.amount * currentCrypto.current_price;
            totalPortfolioValue += value;
            holdingsCount++;

            // Calculate 24h change for portfolio based on available data
            const priceChange24hPercent = typeof currentCrypto.price_change_percentage_24h === 'number' ? currentCrypto.price_change_percentage_24h : 0; // Default to 0 if not number
            const previousPrice = currentCrypto.current_price / (1 + (priceChange24hPercent / 100));
            const changeInValue = (currentCrypto.current_price - previousPrice) * item.amount;
            totalPortfolioChange24h += changeInValue;

            // Update the current price in the portfolio object (important for persistence)
            item.currentPrice = currentCrypto.current_price;
        } else {
            // If crypto is no longer in the fetched list (e.g., dropped out of top 100),
            // use its last known currentPrice to calculate value, but note its change will be stale.
            // Still count it as a holding.
            totalPortfolioValue += item.amount * item.currentPrice;
            holdingsCount++;
            // Cannot accurately calculate 24h change if coin data is not fresh
        }
    });

    totalValueElement.textContent = formatCurrency(totalPortfolioValue);
    totalChangeElement.textContent = `${formatCurrency(totalPortfolioChange24h)} (${formatPercentage(totalPortfolioValue === 0 ? 0 : (totalPortfolioChange24h / totalPortfolioValue) * 100)})`;
    applyChangeClass(totalChangeElement, totalPortfolioChange24h);
    holdingsCountElement.textContent = `${holdingsCount} coins`;

    // Show/hide portfolio section based on holdings
    if (holdingsCount > 0) {
        portfolioSection.classList.remove('hidden');
    } else {
        portfolioSection.classList.add('hidden');
    }
}


/**
 * Renders individual portfolio items in the portfolio grid.
 */
function renderPortfolioItems() {
    portfolioGrid.innerHTML = '';
    const portfolioIds = Object.keys(portfolio);

    if (portfolioIds.length === 0) {
        portfolioGrid.innerHTML = '<p class="text-center text-gray-600">Your portfolio is empty. Add some coins!</p>';
        return;
    }

    portfolioIds.forEach(id => {
        const item = portfolio[id];
        const currentCrypto = cryptoData.find(c => c.id === id); // Get fresh data for display

        if (!currentCrypto) {
            console.warn(`Portfolio item ${item.name} (${id}) not found in current crypto data. Displaying with stale data.`);
            // If coin is not in current cryptoData, use its stored currentPrice for display,
            // but indicate it might be stale.
        }

        const currentPrice = currentCrypto ? currentCrypto.current_price : item.currentPrice;
        const totalValue = item.amount * currentPrice;
        const purchaseValue = item.amount * item.purchasePrice;
        const profitLoss = totalValue - purchaseValue;
        const profitLossPercent = purchaseValue === 0 ? 0 : (profitLoss / purchaseValue) * 100;

        const profitLossClass = profitLoss > 0 ? 'positive' : (profitLoss < 0 ? 'negative' : '');
        // Ensure priceChange24h is handled for stale data
        const currentPriceChange24h = currentCrypto && typeof currentCrypto.price_change_percentage_24h === 'number' ? currentCrypto.price_change_percentage_24h : null;
        const change24hClass = currentPriceChange24h > 0 ? 'positive' : (currentPriceChange24h < 0 ? 'negative' : '');

        const portfolioItemDiv = document.createElement('div');
        portfolioItemDiv.classList.add('portfolio-item');
        portfolioItemDiv.innerHTML = `
            <div class="portfolio-item-header">
                <img src="${item.image}" alt="${item.name} icon" class="portfolio-item-icon">
                <div class="portfolio-item-info">
                    <h4>${item.name}</h4>
                    <span class="portfolio-item-symbol">${item.symbol}</span>
                </div>
            </div>
            <div class="portfolio-item-stats">
                <div class="portfolio-stat-item">
                    <span>Holdings:</span>
                    <span class="stat-value">${formatNumber(item.amount, 4)} ${item.symbol.toUpperCase()}</span>
                </div>
                <div class="portfolio-stat-item">
                    <span>Current Price:</span>
                    <span class="stat-value">${formatCurrency(currentPrice)}</span>
                </div>
                <div class="portfolio-stat-item">
                    <span>Total Value:</span>
                    <span class="stat-value">${formatCurrency(totalValue)}</span>
                </div>
                <div class="portfolio-stat-item">
                    <span>24h Change:</span>
                    <span class="stat-value ${change24hClass}">${currentPriceChange24h !== null ? formatPercentage(currentPriceChange24h) : '--%'}</span>
                </div>
                <div class="portfolio-stat-item">
                    <span>P&L:</span>
                    <span class="stat-value ${profitLossClass}">${formatCurrency(profitLoss)} (${formatPercentage(profitLossPercent)})</span>
                </div>
                <div class="portfolio-stat-item">
                    <span>Avg. Buy Price:</span>
                    <span class="stat-value">${formatCurrency(item.purchasePrice)}</span>
                </div>
            </div>
            <div class="flex justify-end mt-3">
                <button class="text-red-500 hover:text-red-700 text-sm delete-holding-btn" data-id="${id}">Remove</button>
            </div>
        `;
        portfolioGrid.appendChild(portfolioItemDiv);

        // Add event listener for remove button
        portfolioItemDiv.querySelector('.delete-holding-btn').addEventListener('click', (event) => {
            event.stopPropagation();
            if (confirm(`Are you sure you want to remove all holdings of ${item.name} from your portfolio?`)) {
                delete portfolio[id];
                savePortfolio();
            }
        });
    });
}

/**
 * Clears all items from the portfolio.
 */
clearPortfolioBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your entire portfolio? This action cannot be undone.')) {
        portfolio = {};
        savePortfolio();
    }
});


// --- Coin Detail View ---

/**
 * Displays the detailed view for a selected cryptocurrency.
 * @param {string} coinId - The ID of the cryptocurrency.
 */
async function showCoinDetail(coinId) {
    switchView('detail');
    currentDetailCoinId = coinId; // Store the ID for chart and button updates

    // Reset and show loading states for detail view
    detailCoinName.textContent = 'Loading...';
    detailCoinSymbol.textContent = '...';
    detailCoinIcon.src = '';
    detailCurrentPrice.textContent = '$0.00';
    detailPriceChange.textContent = '+0.00%';
    detailPriceChange.classList.remove('positive', 'negative');
    coinDescription.innerHTML = '<div class="description-loading"><div class="description-spinner"></div><p>Loading description...</p></div>';
    coinLinksContainer.innerHTML = '<div class="links-loading">Loading links...</div>';
    chartLoadingElement.classList.remove('hidden');

    // Clear previous chart if any
    if (priceChart) {
        priceChart.destroy(); // Destroy previous chart instance
        priceChart = null;
    }

    try {
        // Fetch detailed coin data
        const coinDetailResponse = await fetch(`${COIN_DETAIL_URL}/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
        if (!coinDetailResponse.ok) {
            throw new Error(`HTTP error! status: ${coinDetailResponse.status}`);
        }
        const coinDetail = await coinDetailResponse.json();

        // Update basic info
        detailCoinIcon.src = coinDetail.image.small;
        detailCoinIcon.alt = `${coinDetail.name} icon`;
        detailCoinName.textContent = coinDetail.name;
        detailCoinSymbol.textContent = coinDetail.symbol.toUpperCase();
        aboutCoinName.textContent = coinDetail.name;

        // Update price header
        const currentPrice = coinDetail.market_data.current_price.usd;
        const priceChange24h = coinDetail.market_data.price_change_percentage_24h;
        detailCurrentPrice.textContent = formatCurrency(currentPrice);
        detailPriceChange.textContent = formatPercentage(priceChange24h);
        applyChangeClass(detailPriceChange, priceChange24h);

        // Update 'Add to Portfolio' button
        updateDetailAddToPortfolioButton(coinDetail);

        // Update market and price statistics
        detailMarketCap.textContent = formatCurrency(coinDetail.market_data.market_cap.usd);
        detailVolume.textContent = formatCurrency(coinDetail.market_data.total_volume.usd);
        detailRank.textContent = `#${coinDetail.market_data.market_cap_rank || '--'}`; // Handle null rank
        detailCirculating.textContent = formatNumber(coinDetail.market_data.circulating_supply, 0);
        detailTotalSupply.textContent = formatNumber(coinDetail.market_data.total_supply, 0) || 'N/A'; // Handle null total_supply

        detailHigh24h.textContent = formatCurrency(coinDetail.market_data.high_24h.usd);
        detailLow24h.textContent = formatCurrency(coinDetail.market_data.low_24h.usd);
        detailATH.textContent = formatCurrency(coinDetail.market_data.ath.usd);
        // Ensure ath_date is valid before creating Date object
        detailATHDate.textContent = coinDetail.market_data.ath_date.usd ? new Date(coinDetail.market_data.ath_date.usd).toLocaleDateString() : 'N/A';
        detailATL.textContent = formatCurrency(coinDetail.market_data.atl.usd);

        // Price changes over different periods (add checks for null before passing to formatPercentage)
        detailChange1h.textContent = formatPercentage(coinDetail.market_data.price_change_percentage_1h_in_currency?.usd);
        applyChangeClass(detailChange1h, coinDetail.market_data.price_change_percentage_1h_in_currency?.usd);
        detailChange24h.textContent = formatPercentage(coinDetail.market_data.price_change_percentage_24h_in_currency?.usd);
        applyChangeClass(detailChange24h, coinDetail.market_data.price_change_percentage_24h_in_currency?.usd);
        detailChange7d.textContent = formatPercentage(coinDetail.market_data.price_change_percentage_7d_in_currency?.usd);
        applyChangeClass(detailChange7d, coinDetail.market_data.price_change_percentage_7d_in_currency?.usd);
        detailChange14d.textContent = formatPercentage(coinDetail.market_data.price_change_percentage_14d_in_currency?.usd);
        applyChangeClass(detailChange14d, coinDetail.market_data.price_change_percentage_14d_in_currency?.usd);
        detailChange30d.textContent = formatPercentage(coinDetail.market_data.price_change_percentage_30d_in_currency?.usd);
        applyChangeClass(detailChange30d, coinDetail.market_data.price_change_percentage_30d_in_currency?.usd);

        // Description (English)
        // Use optional chaining for description as it might be missing or empty
        const descriptionHtml = coinDetail.description?.en || 'No description available.';
        coinDescription.innerHTML = descriptionHtml; // Use innerHTML as it might contain HTML tags

        // Official Links
        coinLinksContainer.innerHTML = ''; // Clear existing links
        const homepage = coinDetail.links?.homepage?.[0]; // Use optional chaining
        if (homepage && homepage.length > 0) {
            const link = document.createElement('a');
            link.href = homepage;
            link.target = '_blank';
            link.classList.add('coin-link');
            link.textContent = 'Website';
            coinLinksContainer.appendChild(link);
        }
        // Example for GitHub link:
        const githubLinkUrl = coinDetail.links?.repos_url?.github?.[0]; // Use optional chaining
        if (githubLinkUrl && githubLinkUrl.length > 0) {
            const githubLink = document.createElement('a');
            githubLink.href = githubLinkUrl;
            githubLink.target = '_blank';
            githubLink.classList.add('coin-link');
            githubLink.textContent = 'GitHub';
            coinLinksContainer.appendChild(githubLink);
        }
        // Add other links as needed (e.g., blockchain_site, subreddit_url, twitter_screen_name)
        if (coinLinksContainer.children.length === 0) {
            coinLinksContainer.innerHTML = '<p class="text-gray-600">No official links available.</p>';
        }

        // Load default chart (7 days)
        // Ensure a timeframe button is active by default
        document.querySelector('.timeframe-btn[data-timeframe="7"]').classList.add('active');
        loadPriceChart(coinId, 7);

    } catch (e) {
        console.error(`Error fetching detail for ${coinId}:`, e);
        // Display error message in detail view
        detailCoinName.textContent = 'Error Loading Coin';
        detailCoinSymbol.textContent = '';
        detailCurrentPrice.textContent = 'N/A';
        detailPriceChange.textContent = 'N/A';
        coinDescription.innerHTML = '<p class="text-red-500">Failed to load coin details. Please try again later.</p>';
        coinLinksContainer.innerHTML = '';
        chartLoadingElement.classList.add('hidden'); // Hide chart loading
        if (priceChart) priceChart.destroy(); // Ensure chart is destroyed on error
    }
}

/**
 * Updates the "Add to Portfolio" button in the detail view.
 * @param {object} coinDetail - The detailed coin object.
 */
function updateDetailAddToPortfolioButton(coinDetail) {
    const isInPortfolio = portfolio[coinDetail.id];
    detailAddToPortfolioBtn.textContent = isInPortfolio ? 'Edit Portfolio Holdings' : '+ Add to Portfolio';
    detailAddToPortfolioBtn.classList.toggle('in-portfolio', isInPortfolio); // Add or remove class
    detailAddToPortfolioBtn.onclick = () => {
        openPortfolioModal({
            id: coinDetail.id,
            name: coinDetail.name,
            symbol: coinDetail.symbol,
            price: coinDetail.market_data.current_price.usd,
            image: coinDetail.image.small
        });
    };
}


/**
 * Fetches and renders the price chart for a given coin.
 * @param {string} coinId - The ID of the cryptocurrency.
 * @param {number} days - Number of days for the chart data (e.g., 7, 30, 365).
 */
async function loadPriceChart(coinId, days) {
    chartLoadingElement.classList.remove('hidden');
    if (priceChart) {
        priceChart.destroy(); // Destroy previous chart instance
        priceChart = null;
    }

    try {
        const chartResponse = await fetch(`${CHART_API_URL}/${coinId}/market_chart?vs_currency=usd&days=${days}`);
        if (!chartResponse.ok) {
            throw new Error(`HTTP error! status: ${chartResponse.status}`);
        }
        const chartData = await chartResponse.json();

        if (!chartData || !chartData.prices || chartData.prices.length === 0) {
            priceChartCanvas.style.display = 'none';
            chartLoadingElement.innerHTML = '<p class="text-gray-500">No chart data available for this timeframe.</p>';
            return;
        } else {
            priceChartCanvas.style.display = 'block';
        }

        const prices = chartData.prices;
        const labels = prices.map(p => new Date(p[0]).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
        const data = prices.map(p => p[1]);

        const ctx = priceChartCanvas.getContext('2d');
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${detailCoinName.textContent} Price (USD)`,
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0, // Hide points
                    fill: true,
                    tension: 0.3 // Smooth the line
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                // Ensure context.raw is handled by formatCurrency
                                return `Price: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            autoSkip: true,
                            maxRotation: 0,
                            minRotation: 0,
                            // Only show every Nth label for better readability on smaller screens
                            callback: function(val, index) {
                                if (days === 7) return this.getLabelForValue(val);
                                if (days === 30 && index % 5 === 0) return this.getLabelForValue(val);
                                if (days === 90 && index % 10 === 0) return this.getLabelForValue(val);
                                if (days === 365 && index % 30 === 0) return this.getLabelForValue(val);
                                return null;
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#e2e8f0'
                        },
                        ticks: {
                            callback: function(value) {
                                // Ensure value is handled by formatCurrency
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });

    } catch (e) {
        console.error(`Error fetching chart data for ${coinId} (${days} days):`, e);
        priceChartCanvas.style.display = 'none';
        chartLoadingElement.innerHTML = '<p class="text-red-500">Failed to load chart data.</p>';
    } finally {
        chartLoadingElement.classList.add('hidden');
    }
}

// Event Listeners for Chart Timeframes
chartTimeframeBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
        // Remove active class from all buttons
        chartTimeframeBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        event.target.classList.add('active');

        const timeframe = event.target.dataset.timeframe;
        if (currentDetailCoinId) {
            loadPriceChart(currentDetailCoinId, parseInt(timeframe));
        }
    });
});

// Back button for detail view
backToMainBtn.addEventListener('click', () => switchView('dashboard'));


// --- Initialization ---

/**
 * Initializes the application.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Hide the portfolio modal by default to prevent a brief flash on load
    portfolioModal.style.display = 'none';

    loadPortfolio(); // Load portfolio first
    loadCryptoData(); // Then load crypto data to update portfolio prices

    // Set up auto-refresh
    autoRefreshInterval = setInterval(loadCryptoData, 90 * 1000); // Refresh every 90 seconds

    // Manual refresh button
    refreshBtn.addEventListener('click', () => {
        loadCryptoData();
        clearInterval(autoRefreshInterval); // Reset interval on manual refresh
        autoRefreshInterval = setInterval(loadCryptoData, 90 * 1000);
    });
});