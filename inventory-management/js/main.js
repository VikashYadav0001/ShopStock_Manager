// ==================== GLOBAL STATE ====================
let appState = {
    products: [],
    transactions: [],
    receipts: [],
    currentCart: [],
    currentPage: 'dashboard'
};

// ==================== PAGE INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');

    updateDateTime();
    setInterval(updateDateTime, 1000);

    setupNavigation();
    loadAllData();
    updateDashboard();
});

// ==================== NAVIGATION ====================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                switchPage(page);
            }
        });
    });
}

function switchPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });

    const pageId = `page-${pageName}`;
    const page = document.getElementById(pageId);
    if (page) {
        page.style.display = 'block';
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    const titles = {
        'dashboard': 'Dashboard',
        'products': 'Product Management',
        'stock-entry': 'Stock Entry',
        'checkout': 'Checkout & Billing',
        'reports': 'Sales Reports',
        'alerts': 'Inventory Alerts'
    };

    document.getElementById('page-title').textContent = titles[pageName] || 'Dashboard';
    appState.currentPage = pageName;

    if (pageName === 'products') {
        loadProductsPage();
    } else if (pageName === 'stock-entry') {
        loadStockEntryPage();
    } else if (pageName === 'checkout') {
        loadCheckoutPage();
    } else if (pageName === 'reports') {
        loadReportsPage();
    } else if (pageName === 'alerts') {
        loadAlertsPage();
    }
}

// ==================== DATE & TIME ====================
function updateDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const time = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const dateEl = document.getElementById('current-date');
    const timeEl = document.getElementById('current-time');

    if (dateEl) dateEl.textContent = date;
    if (timeEl) timeEl.textContent = time;
}

// ==================== DATA MANAGEMENT ====================
function loadAllData() {
    const savedProducts = localStorage.getItem('products');
    const savedTransactions = localStorage.getItem('transactions');
    const savedReceipts = localStorage.getItem('receipts');

    if (savedProducts) {
        appState.products = JSON.parse(savedProducts);
    }
    if (savedTransactions) {
        appState.transactions = JSON.parse(savedTransactions);
    }
    if (savedReceipts) {
        appState.receipts = JSON.parse(savedReceipts);
    }

    console.log('Data loaded:', appState);
}

function saveProducts() {
    try {
        localStorage.setItem('products', JSON.stringify(appState.products));
    } catch (e) {
        console.error('Save failed:', e);
        showMessage('Storage error: data save nahi ho paya', 'error');
    }
}

function saveTransactions() {
    try {
        localStorage.setItem('transactions', JSON.stringify(appState.transactions));
    } catch (e) {
        console.error('Save failed:', e);
        showMessage('Storage error: data save nahi ho paya', 'error');
    }
}

// ==================== DASHBOARD ====================
function updateDashboard() {
    const totalProducts = appState.products.length;
    document.getElementById('total-products').textContent = totalProducts;

    const lowStockItems = appState.products.filter(p => p.currentStock < p.minReorderLevel);
    const lowStockCount = lowStockItems.length;
    document.getElementById('low-stock-count').textContent = lowStockCount;

    const badge = document.getElementById('low-stock-badge');
    if (lowStockCount > 0) {
        badge.textContent = lowStockCount;
        badge.style.display = 'flex';
        document.getElementById('alert-dot').style.display = 'block';
    } else {
        badge.style.display = 'none';
        document.getElementById('alert-dot').style.display = 'none';
    }

    let inventoryValue = 0;
    appState.products.forEach(product => {
        inventoryValue += (product.unitPrice * product.currentStock);
    });
    document.getElementById('inventory-value').textContent = `₹${inventoryValue.toFixed(2)}`;

    const today = new Date().toDateString();
    let todaysSales = 0;

    appState.transactions.forEach(trans => {
        if (trans.type === 'SALE' && new Date(trans.date).toDateString() === today) {
            todaysSales += trans.totalAmount;
        }
    });
    document.getElementById('today-sales').textContent = `₹${todaysSales.toFixed(2)}`;

    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    if (hour >= 17) greeting = 'Good Evening';
    document.getElementById('welcome-msg').textContent = `${greeting}! Manage your inventory efficiently.`;

    displayRecentTransactions();
}

function displayRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    if (!container) return;

    const recent = appState.transactions.slice(-5).reverse();

    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-message">No transactions yet</p>';
        return;
    }

    container.innerHTML = '';
    recent.forEach(trans => {
        const product = appState.products.find(p => p.id === trans.productId);
        const productName = product ? product.productName : 'Unknown';
        const type = trans.type === 'SALE' ? '📤 Sale' : '📥 Restock';
        const date = new Date(trans.date).toLocaleTimeString();

        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.innerHTML = `
            <p><strong>${type}</strong> - ${productName}</p>
            <p>Qty: ${trans.quantity} | Amount: ₹${trans.totalAmount.toFixed(2)}</p>
            <p style="font-size: 12px; color: #999;">${date}</p>
        `;
        container.appendChild(div);
    });
}

// ==================== TOAST NOTIFICATIONS ====================
function showMessage(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) {
        alert(`[${type.toUpperCase()}] ${message}`);
        return;
    }

    const icon = type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ==================== HELPER FUNCTIONS ====================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(amount) {
    return `₹${parseFloat(amount).toFixed(2)}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN');
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-IN');
}

// ==================== PAGE LOADERS ====================
function loadProductsPage() {
    setTimeout(() => {
        initProductForm();
        displayAllProducts();
    }, 100);
}

function loadStockEntryPage() {
    setTimeout(() => {
        populateStockDropdowns();
        initStockForms();
    }, 100);
}

function loadCheckoutPage() {
    setTimeout(() => {
        populateCheckoutDropdown();
        displayCart();
    }, 100);
}

function loadReportsPage() {
    setTimeout(() => {
        displayReportsData();
        initializeCharts();
    }, 100);
}

function loadAlertsPage() {
    setTimeout(() => {
        displayAlerts();
    }, 100);
}
