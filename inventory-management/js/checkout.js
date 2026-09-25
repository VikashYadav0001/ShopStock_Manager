let checkoutState = {
    cart: [],
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    taxAmount: 0,
    finalAmount: 0
};

function loadCheckoutPage() {
    populateCheckoutDropdown();
    displayCart();
}

async function populateCheckoutDropdown() {
    const products = await getAllProducts();
    const select = document.getElementById('cart-product-select');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Select product...</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.productName} (₹${product.unitPrice.toFixed(2)})`;
        option.disabled = product.currentStock <= 0;
        select.appendChild(option);
    });
}

async function addToCart() {
    const productId = document.getElementById('cart-product-select').value;
    const quantity = parseInt(document.getElementById('cart-qty-input').value) || 1;
    
    if (!productId || quantity <= 0) {
        showMessage('Select product and quantity', 'error');
        return;
    }
    
    const products = await getAllProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showMessage('Product not found', 'error');
        return;
    }
    
    if (product.currentStock < quantity) {
        showMessage(`Only ${product.currentStock} available!`, 'error');
        return;
    }
    
    const existingItem = checkoutState.cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        checkoutState.cart.push({
            productId: productId,
            productName: product.productName,
            unitPrice: product.unitPrice,
            quantity: quantity
        });
    }
    
    document.getElementById('cart-qty-input').value = 1;
    document.getElementById('cart-product-select').value = '';
    
    displayCart();
    calculateBill();
}

function displayCart() {
    const tbody = document.getElementById('cart-tbody');
    if (!tbody) return;
    
    if (checkoutState.cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Cart is empty</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    checkoutState.cart.forEach((item, index) => {
        const itemTotal = item.unitPrice * item.quantity;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>₹${item.unitPrice.toFixed(2)}</td>
            <td>₹${itemTotal.toFixed(2)}</td>
            <td>
                <button type="button" class="btn-danger" onclick="removeFromCart(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function removeFromCart(index) {
    checkoutState.cart.splice(index, 1);
    displayCart();
    calculateBill();
}

function clearCart() {
    if (confirm('Clear cart?')) {
        checkoutState.cart = [];
        document.getElementById('discount-percent').value = 0;
        displayCart();
        calculateBill();
    }
}

function calculateBill() {
    let subtotal = 0;
    checkoutState.cart.forEach(item => {
        subtotal += (item.unitPrice * item.quantity);
    });
    checkoutState.subtotal = subtotal;
    
    const discountPercent = parseFloat(document.getElementById('discount-percent').value) || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    checkoutState.discountAmount = discountAmount;
    
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * 5) / 100;
    checkoutState.taxAmount = taxAmount;
    
    const finalAmount = afterDiscount + taxAmount;
    checkoutState.finalAmount = finalAmount;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('discount-amount').textContent = `₹${discountAmount.toFixed(2)}`;
    document.getElementById('after-discount').textContent = `₹${afterDiscount.toFixed(2)}`;
    document.getElementById('tax-amount').textContent = `₹${taxAmount.toFixed(2)}`;
    document.getElementById('final-amount').textContent = `₹${finalAmount.toFixed(2)}`;
}

async function generateReceipt() {
    if (checkoutState.cart.length === 0) {
        showMessage('Cart is empty', 'error');
        return;
    }
    
    try {
        const checkoutData = {
            items: checkoutState.cart,
            subtotal: checkoutState.subtotal,
            discountPercent: parseFloat(document.getElementById('discount-percent').value) || 0,
            discountAmount: checkoutState.discountAmount,
            taxAmount: checkoutState.taxAmount,
            finalAmount: checkoutState.finalAmount
        };
        
        await completeCheckout(checkoutData);
        displayReceipt();
        
        checkoutState.cart = [];
        document.getElementById('discount-percent').value = 0;
        displayCart();
        calculateBill();
        
        // ✅ UPDATE ALL PAGES
        updateDashboard();
        displayAllProducts();
        
        // ✅ REFRESH REPORTS IF OPEN
        if (appState.currentPage === 'reports') {
            displayReportsData();
            initializeCharts();
        }
        
        // ✅ REFRESH ALERTS IF OPEN
        if (appState.currentPage === 'alerts') {
            displayAlerts();
        }
        
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

function displayReceipt() {
    const modal = document.getElementById('receipt-modal');
    if (!modal) return;
    
    const itemsHtml = checkoutState.cart.map(item => {
        const total = item.unitPrice * item.quantity;
        return `
            <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="text-align:left;">${item.productName}</td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">₹${item.unitPrice.toFixed(2)}</td>
                <td style="text-align:right;">₹${total.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('receipt-items').innerHTML = itemsHtml;
    document.getElementById('receipt-subtotal').textContent = `₹${checkoutState.subtotal.toFixed(2)}`;
    document.getElementById('receipt-discount').textContent = `₹${checkoutState.discountAmount.toFixed(2)}`;
    document.getElementById('receipt-tax').textContent = `₹${checkoutState.taxAmount.toFixed(2)}`;
    document.getElementById('receipt-total').textContent = `₹${checkoutState.finalAmount.toFixed(2)}`;
    
    const now = new Date();
    document.getElementById('receipt-datetime').textContent = now.toLocaleString('en-IN');
    
    modal.style.display = 'flex';
    showMessage('Receipt generated!', 'success');
}

function closeReceipt() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.style.display = 'none';
}

function printReceipt() {
    const receiptPrint = document.getElementById('receipt-print');
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write('<pre style="font-family:Courier New; font-size:12px;">');
    printWindow.document.write(receiptPrint.innerText);
    printWindow.document.write('</pre>');
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
}

function downloadReceipt() {
    const element = document.getElementById('receipt-print');
    const opt = {
        margin: 10,
        filename: `receipt-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
}