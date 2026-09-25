function loadReportsPage() {
    displayReportsData();
    initializeCharts();
}

async function displayReportsData() {
    try {
        const report = await getSalesReport();

        document.getElementById('report-total-sales').textContent = `₹${report.totalSales?.toFixed(2) || '0.00'}`;
        document.getElementById('report-items-sold').textContent = report.itemsSold || 0;
        document.getElementById('report-avg-sale').textContent = `₹${report.avgSaleValue?.toFixed(2) || '0.00'}`;
        document.getElementById('report-transactions').textContent = report.transactions?.length || 0;

        displayTopItems();

    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

async function displayTopItems() {
    try {
        const topItems = await getTopSellingItems(5);
        const tbody = document.getElementById('top-items-tbody');

        if (!tbody) return;

        if (topItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No sales data</td></tr>';
            return;
        }

        tbody.innerHTML = '';

        topItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${item.productName}</strong></td>
                <td>${item.quantity}</td>
                <td>₹${item.amount.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

async function initializeCharts() {
    try {
        await drawTopItemsChart();
        await drawCategoryChart();
        await drawSalesTrendChart();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function drawTopItemsChart() {
    const canvas = document.getElementById('topItemsChart');
    if (!canvas) return;

    try {
        const topItems = await getTopSellingItems(5);

        if (topItems.length === 0) {
            canvas.innerHTML = '<p style="text-align:center; color:#999;">No data</p>';
            return;
        }

        const labels = topItems.map(item => item.productName);
        const data = topItems.map(item => item.quantity);

        const ctx = canvas.getContext('2d');

        if (canvas.chart) canvas.chart.destroy();

        canvas.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantity Sold',
                    data: data,
                    backgroundColor: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6'],
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

async function drawCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    try {
        const categoryData = await getSalesByCategory();

        if (categoryData.length === 0) {
            canvas.innerHTML = '<p style="text-align:center; color:#999;">No data</p>';
            return;
        }

        const labels = categoryData.map(item => item.category);
        const data = categoryData.map(item => item.amount);

        const colors = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];

        const ctx = canvas.getContext('2d');

        if (canvas.chart) canvas.chart.destroy();

        canvas.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'right' } }
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// ==================== SALES TREND (LAST 7 DAYS) ====================
async function drawSalesTrendChart() {
    const canvas = document.getElementById('salesTrendChart');
    if (!canvas) return;

    try {
        const trendData = getSalesTrendLast7Days();

        const ctx = canvas.getContext('2d');

        if (canvas.chart) canvas.chart.destroy();

        canvas.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'Sales (₹)',
                    data: trendData.values,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.15)',
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#3498db',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return '₹' + value; }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// Pichle 7 din ka date-wise sales total nikalta hai
function getSalesTrendLast7Days() {
    const labels = [];
    const values = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();

        const dayLabel = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        labels.push(dayLabel);

        const daySales = appState.transactions
            .filter(t => t.type === 'SALE' && new Date(t.date).toDateString() === dateStr)
            .reduce((sum, t) => sum + t.totalAmount, 0);

        values.push(daySales);
    }

    return { labels, values };
}
