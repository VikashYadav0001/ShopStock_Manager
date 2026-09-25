// ==================== STOCK ENTRY PAGE (RESTOCK ONLY) ====================
// Sale ab yahan se nahi hoti — Checkout page hi single source hai sales ke
// liye (single ya multiple items, bill generate, aur transaction record
// sab ek saath).

function populateStockDropdowns() {
    populateProductDropdowns();
}

function initStockForms() {
    const restockForm = document.getElementById('restock-form');
    if (restockForm && !restockForm.dataset.listenerAttached) {
        restockForm.addEventListener('submit', handleRestockSubmit);
        restockForm.dataset.listenerAttached = 'true';
    }

    const restockQty = document.getElementById('restock-qty');
    if (restockQty && !restockQty.dataset.listenerAttached) {
        restockQty.addEventListener('input', updateRestockTotal);
        restockQty.dataset.listenerAttached = 'true';
    }
}

function updateRestockTotal() {
    const qty = parseInt(document.getElementById('restock-qty').value) || 0;
    const cost = parseFloat(document.getElementById('restock-cost').value) || 0;
    const total = qty * cost;

    document.getElementById('restock-total-cost').value = total.toFixed(2);
}

async function handleRestockSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('restock-product').value;
    const quantity = parseInt(document.getElementById('restock-qty').value);

    if (!productId || quantity <= 0) {
        showMessage('Please select product and quantity', 'error');
        return;
    }

    try {
        const products = await getAllProducts();
        const product = products.find(p => p.id === productId);

        if (!product) {
            showMessage('Product not found', 'error');
            return;
        }

        const stockData = {
            productId: productId,
            quantity: quantity,
            unitPrice: product.unitPrice,
            totalAmount: quantity * product.unitPrice,
            type: 'BUY'
        };

        await recordPurchase(stockData);
        showMessage(`Added ${quantity} units of "${product.productName}"!`, 'success');

        document.getElementById('restock-form').reset();
        document.getElementById('restock-total-cost').value = '0';

        updateDashboard();
        displayAllProducts();

        if (appState.currentPage === 'reports') {
            displayReportsData();
            initializeCharts();
        }
        if (appState.currentPage === 'alerts') {
            displayAlerts();
        }

    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}
