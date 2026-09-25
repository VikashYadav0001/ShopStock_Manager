function loadAlertsPage() {
    displayAlerts();
}

async function displayAlerts() {
    try {
        displayLowStockAlerts();
        displayBestSellers();
        displayRecentTransactions();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function displayLowStockAlerts() {
    try {
        const lowStockItems = await getLowStockItems();
        const container = document.getElementById('low-stock-alerts');
        
        if (!container) return;
        
        if (lowStockItems.length === 0) {
            container.innerHTML = '<p class="empty-message">No low stock items</p>';
            return;
        }
        
        container.innerHTML = '';
        
        lowStockItems.forEach(product => {
            const shortage = product.minReorderLevel - product.currentStock;
            
            const div = document.createElement('div');
            div.className = 'alert-item';
            div.innerHTML = `
                <div class="alert-item-content">
                    <p><strong>${product.productName}</strong></p>
                    <p>Current: ${product.currentStock} | Min: ${product.minReorderLevel}</p>
                    <p style="color: #e74c3c; font-weight: bold;">Need: ${shortage} units</p>
                </div>
                <div class="alert-item-action">
                    <button class="btn-primary" onclick="switchPage('stock-entry')">Restock</button>
                </div>
            `;
            container.appendChild(div);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function displayBestSellers() {
    try {
        const topItems = await getTopSellingItems(5);
        const container = document.getElementById('best-sellers-alerts');
        
        if (!container) return;
        
        if (topItems.length === 0) {
            container.innerHTML = '<p class="empty-message">No sales data</p>';
            return;
        }
        
        container.innerHTML = '';
        
        topItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'alert-item success';
            div.innerHTML = `
                <div class="alert-item-content">
                    <p><strong>#${index + 1} - ${item.productName}</strong></p>
                    <p>Sold: ${item.quantity} | Revenue: ₹${item.amount.toFixed(2)}</p>
                </div>
            `;
            container.appendChild(div);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function displayRecentTransactions() {
    try {
        const transactions = await getRecentTransactions(10);
        const tbody = document.getElementById('transactions-tbody');
        
        if (!tbody) return;
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No transactions</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        transactions.forEach(trans => {
            const product = appState.products.find(p => p.id === trans.productId);
            const productName = product ? product.productName : 'Unknown';
            const type = trans.type === 'SALE' ? '📤 Sale' : '📥 Buy';
            const typeColor = trans.type === 'SALE' ? '#e74c3c' : '#2ecc71';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${trans.id.substring(0, 8)}</td>
                <td><span style="color: ${typeColor}; font-weight: bold;">${type}</span></td>
                <td>${productName}</td>
                <td>${trans.quantity}</td>
                <td>₹${trans.totalAmount.toFixed(2)}</td>
                <td>${new Date(trans.date).toLocaleString('en-IN')}</td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function checkAlerts() {
    try {
        const lowStockItems = await getLowStockItems();
        
        const badge = document.getElementById('low-stock-badge');
        const dot = document.getElementById('alert-dot');
        
        if (lowStockItems.length > 0) {
            if (badge) {
                badge.textContent = lowStockItems.length;
                badge.style.display = 'flex';
            }
            if (dot) dot.style.display = 'block';
        } else {
            if (badge) badge.style.display = 'none';
            if (dot) dot.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

window.addEventListener('load', function() {
    checkAlerts();
    setInterval(checkAlerts, 30000);
});