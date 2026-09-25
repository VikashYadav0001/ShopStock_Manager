const API_BASE_URL = 'http://localhost:8080/api';
const USE_SIMULATED_API = true;

async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        if (!USE_SIMULATED_API) {
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (data) options.body = JSON.stringify(data);
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            return await response.json();
        } else {
            return simulateApiCall(endpoint, method, data);
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function simulateApiCall(endpoint, method, data) {
    console.log(`[SIMULATED] ${method} ${endpoint}`);
    
    if (endpoint === '/products' && method === 'GET') {
        return Promise.resolve(appState.products);
    }
    
    if (endpoint === '/products' && method === 'POST') {
        const product = { id: generateId(), ...data, dateAdded: new Date().toISOString() };
        appState.products.push(product);
        saveProducts();
        return Promise.resolve(product);
    }
    
    if (endpoint === '/stock/buy' && method === 'POST') {
        const product = appState.products.find(p => p.id === data.productId);
        if (product) {
            product.currentStock += data.quantity;
            saveProducts();
        }
        
        const transaction = { id: generateId(), type: 'BUY', ...data, date: new Date().toISOString() };
        appState.transactions.push(transaction);
        saveTransactions();
        return Promise.resolve(transaction);
    }
    
    if (endpoint === '/stock/sell' && method === 'POST') {
        const product = appState.products.find(p => p.id === data.productId);
        if (!product || product.currentStock < data.quantity) {
            return Promise.reject(new Error('Insufficient stock'));
        }
        
        product.currentStock -= data.quantity;
        saveProducts();
        
        const transaction = { id: generateId(), type: 'SALE', ...data, date: new Date().toISOString() };
        appState.transactions.push(transaction);
        saveTransactions();
        return Promise.resolve(transaction);
    }
    
    if (endpoint === '/checkout/complete' && method === 'POST') {
        data.items.forEach(item => {
            const product = appState.products.find(p => p.id === item.productId);
            if (product) product.currentStock -= item.quantity;
        });
        saveProducts();
        
        const receipt = { id: generateId(), ...data, date: new Date().toISOString() };
        appState.receipts.push(receipt);
        localStorage.setItem('receipts', JSON.stringify(appState.receipts));
        return Promise.resolve(receipt);
    }
    
    if (endpoint === '/alerts/low-stock') {
        const lowStock = appState.products.filter(p => p.currentStock < p.minReorderLevel);
        return Promise.resolve(lowStock);
    }
    
    return Promise.resolve({ success: true });
}

// ==================== API FUNCTIONS ====================
async function getAllProducts() {
    return await apiCall('/products', 'GET');
}

async function addProduct(productData) {
    return await apiCall('/products', 'POST', productData);
}

async function updateProduct(productId, productData) {
    const index = appState.products.findIndex(p => p.id === productId);
    if (index !== -1) {
        appState.products[index] = { ...appState.products[index], ...productData };
        saveProducts();
        return Promise.resolve(appState.products[index]);
    }
    return Promise.reject(new Error('Product not found'));
}

async function deleteProduct(productId) {
    appState.products = appState.products.filter(p => p.id !== productId);
    saveProducts();
    return Promise.resolve({ success: true });
}

async function recordPurchase(stockData) {
    return await apiCall('/stock/buy', 'POST', stockData);
}

async function recordSale(stockData) {
    return await apiCall('/stock/sell', 'POST', stockData);
}

async function completeCheckout(checkoutData) {
    return await apiCall('/checkout/complete', 'POST', checkoutData);
}

async function getLowStockItems() {
    return await apiCall('/alerts/low-stock', 'GET');
}

async function getRecentTransactions(limit = 10) {
    return Promise.resolve(appState.transactions.slice(-limit).reverse());
}

async function getTopSellingItems(limit = 5) {
    const sales = appState.transactions.filter(t => t.type === 'SALE');
    const productSales = {};
    
    sales.forEach(sale => {
        if (!productSales[sale.productId]) {
            productSales[sale.productId] = { productId: sale.productId, quantity: 0, amount: 0 };
        }
        productSales[sale.productId].quantity += sale.quantity;
        productSales[sale.productId].amount += sale.totalAmount;
    });
    
    return Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit)
        .map(item => ({
            ...item,
            productName: appState.products.find(p => p.id === item.productId)?.productName || 'Unknown'
        }));
}

async function getSalesReport() {
    const today = new Date().toDateString();
    const todaySales = appState.transactions.filter(t => t.type === 'SALE' && new Date(t.date).toDateString() === today);
    
    let totalSales = 0, totalItems = 0;
    todaySales.forEach(sale => {
        totalSales += sale.totalAmount;
        totalItems += sale.quantity;
    });
    
    return Promise.resolve({
        totalSales: totalSales,
        itemsSold: totalItems,
        transactions: appState.transactions.filter(t => t.type === 'SALE'),
        avgSaleValue: totalItems > 0 ? totalSales / totalItems : 0
    });
}

async function getSalesByCategory() {
    const sales = appState.transactions.filter(t => t.type === 'SALE');
    const categorySales = {};
    
    sales.forEach(sale => {
        const product = appState.products.find(p => p.id === sale.productId);
        if (product) {
            if (!categorySales[product.category]) {
                categorySales[product.category] = { category: product.category, amount: 0, quantity: 0 };
            }
            categorySales[product.category].amount += sale.totalAmount;
            categorySales[product.category].quantity += sale.quantity;
        }
    });
    
    return Promise.resolve(Object.values(categorySales));
}