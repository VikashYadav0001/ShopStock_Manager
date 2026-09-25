function initProductForm() {
    const form = document.getElementById('add-product-form');
    if (form && !form.dataset.listenerAttached) {
        form.addEventListener('submit', handleAddProduct);
        form.dataset.listenerAttached = 'true';
    }

    const editForm = document.getElementById('edit-product-form');
    if (editForm && !editForm.dataset.listenerAttached) {
        editForm.addEventListener('submit', handleEditProductSubmit);
        editForm.dataset.listenerAttached = 'true';
    }

    const searchInput = document.getElementById('product-search');
    if (searchInput && !searchInput.dataset.listenerAttached) {
        searchInput.addEventListener('input', handleProductSearch);
        searchInput.dataset.listenerAttached = 'true';
    }
}

// ==================== ADD PRODUCT ====================
async function handleAddProduct(e) {
    e.preventDefault();

    const productData = {
        productName: document.getElementById('product-name').value.trim(),
        category: document.getElementById('product-category').value,
        unitPrice: parseFloat(document.getElementById('product-price').value),
        currentStock: parseInt(document.getElementById('product-stock').value),
        minReorderLevel: parseInt(document.getElementById('product-min-level').value),
        dateAdded: new Date().toISOString()
    };

    if (!productData.productName || !productData.category) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    if (isNaN(productData.unitPrice) || productData.unitPrice < 0) {
        showMessage('Price valid honi chahiye (0 ya usse zyada)', 'error');
        return;
    }

    if (isNaN(productData.currentStock) || productData.currentStock < 0) {
        showMessage('Stock valid honi chahiye (0 ya usse zyada)', 'error');
        return;
    }

    if (isNaN(productData.minReorderLevel) || productData.minReorderLevel < 0) {
        showMessage('Min reorder level valid honi chahiye', 'error');
        return;
    }

    const existingProducts = await getAllProducts();
    const duplicate = existingProducts.find(
        p => p.productName.toLowerCase() === productData.productName.toLowerCase()
    );
    if (duplicate) {
        showMessage(`"${productData.productName}" already exists! Naya naam use karo ya usko edit karo.`, 'error');
        return;
    }

    try {
        await addProduct(productData);
        showMessage(`Product "${productData.productName}" added!`, 'success');
        document.getElementById('add-product-form').reset();
        displayAllProducts();
        updateDashboard();
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// ==================== DISPLAY / SEARCH ====================
let productSearchTerm = '';

async function handleProductSearch(e) {
    productSearchTerm = e.target.value.trim().toLowerCase();
    displayAllProducts();
}

async function displayAllProducts() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    let products = await getAllProducts();

    if (productSearchTerm) {
        products = products.filter(p =>
            p.productName.toLowerCase().includes(productSearchTerm) ||
            p.category.toLowerCase().includes(productSearchTerm)
        );
    }

    if (products.length === 0) {
        const msg = productSearchTerm ? 'No matching products found' : 'No products added yet';
        tbody.innerHTML = `<tr><td colspan="8" class="empty-message">${msg}</td></tr>`;
        return;
    }

    tbody.innerHTML = '';

    products.forEach((product) => {
        const isLowStock = product.currentStock < product.minReorderLevel;
        const statusClass = isLowStock ? 'status-low' : 'status-ok';
        const statusText = isLowStock ? '⚠️ Low Stock' : '✓ OK';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id.substring(0, 8)}</td>
            <td><strong>${product.productName}</strong></td>
            <td>${product.category}</td>
            <td>₹${parseFloat(product.unitPrice).toFixed(2)}</td>
            <td>${product.currentStock}</td>
            <td>${product.minReorderLevel}</td>
            <td class="${statusClass}">${statusText}</td>
            <td>
                <button class="btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn-danger" onclick="deleteProductConfirm('${product.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ==================== EDIT PRODUCT (MODAL) — STOCK NOT EDITABLE HERE ====================
async function editProduct(productId) {
    const products = await getAllProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
        showMessage('Product not found', 'error');
        return;
    }

    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.productName;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-price').value = product.unitPrice;
    document.getElementById('edit-product-min-level').value = product.minReorderLevel;
    // Stock field intentionally not populated/edited here.

    document.getElementById('edit-product-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-product-modal').style.display = 'none';
}

async function handleEditProductSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('edit-product-id').value;
    const updatedName = document.getElementById('edit-product-name').value.trim();
    const updatedCategory = document.getElementById('edit-product-category').value;
    const updatedPrice = parseFloat(document.getElementById('edit-product-price').value);
    const updatedMinLevel = parseInt(document.getElementById('edit-product-min-level').value);

    if (!updatedName || !updatedCategory) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    if (isNaN(updatedPrice) || updatedPrice < 0 || isNaN(updatedMinLevel) || updatedMinLevel < 0) {
        showMessage('Price/Min Level valid numbers hone chahiye', 'error');
        return;
    }

    const existingProducts = await getAllProducts();
    const duplicate = existingProducts.find(
        p => p.id !== productId && p.productName.toLowerCase() === updatedName.toLowerCase()
    );
    if (duplicate) {
        showMessage(`"${updatedName}" naam ka product already exist karta hai!`, 'error');
        return;
    }

    try {
        await updateProduct(productId, {
            productName: updatedName,
            category: updatedCategory,
            unitPrice: updatedPrice,
            minReorderLevel: updatedMinLevel
        });

        showMessage('Product updated successfully!', 'success');
        closeEditModal();
        displayAllProducts();
        updateDashboard();

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

// ==================== DELETE PRODUCT ====================
async function deleteProductConfirm(productId) {
    const products = await getAllProducts();
    const product = products.find(p => p.id === productId);

    if (!product) return;

    const hasTransactions = appState.transactions.some(t => t.productId === productId);
    const warningMsg = hasTransactions
        ? `"${product.productName}" ke transactions bhi hain. Delete karne par product list se hat jayega, lekin purane transactions/reports me record rahega. Continue?`
        : `Delete "${product.productName}"?`;

    if (confirm(warningMsg)) {
        try {
            await deleteProduct(productId);
            showMessage('Product deleted!', 'success');
            displayAllProducts();
            updateDashboard();

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
}

// ==================== DROPDOWNS (sale-product dropdown removed — sale ab sirf Checkout se) ====================
async function populateProductDropdowns() {
    const products = await getAllProducts();

    const restockSelect = document.getElementById('restock-product');
    if (restockSelect) {
        restockSelect.innerHTML = '<option value="">Choose product...</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.productName} (₹${product.unitPrice})`;
            restockSelect.appendChild(option);
        });
        if (!restockSelect.dataset.listenerAttached) {
            restockSelect.addEventListener('change', handleRestockProductSelect);
            restockSelect.dataset.listenerAttached = 'true';
        }
    }

    const checkoutSelect = document.getElementById('cart-product-select');
    if (checkoutSelect) {
        checkoutSelect.innerHTML = '<option value="">Select product...</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.productName} (₹${product.unitPrice})`;
            option.disabled = product.currentStock <= 0;
            checkoutSelect.appendChild(option);
        });
    }
}

async function handleRestockProductSelect(e) {
    const productId = e.target.value;
    if (!productId) return;

    const products = await getAllProducts();
    const product = products.find(p => p.id === productId);

    if (product) {
        document.getElementById('restock-cost').value = product.unitPrice;
        updateRestockTotal();
    }
}
