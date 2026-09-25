// ==================== STOCK ENTRY PAGE INITIALIZATION ====================
function populateStockDropdowns() {
  populateProductDropdowns();
}

function initStockForms() {
  // Restock form
  const restockForm = document.getElementById("restock-form");
  if (restockForm) {
    restockForm.removeEventListener("submit", handleRestockSubmit);
    restockForm.addEventListener("submit", handleRestockSubmit);
  }

  // Sale form
  const saleForm = document.getElementById("sale-form");
  if (saleForm) {
    saleForm.removeEventListener("submit", handleSaleSubmit);
    saleForm.addEventListener("submit", handleSaleSubmit);
  }

  // Quantity input listeners for calculations
  const restockQty = document.getElementById("restock-qty");
  if (restockQty) {
    restockQty.removeEventListener("input", updateRestockTotal);
    restockQty.addEventListener("input", updateRestockTotal);
  }

  const saleQty = document.getElementById("sale-qty");
  if (saleQty) {
    saleQty.removeEventListener("input", updateSaleTotal);
    saleQty.addEventListener("input", updateSaleTotal);
  }
}

// ==================== RESTOCK CALCULATIONS ====================
function updateRestockTotal() {
  const qty = parseInt(document.getElementById("restock-qty").value) || 0;
  const cost = parseFloat(document.getElementById("restock-cost").value) || 0;
  const total = qty * cost;

  document.getElementById("restock-total-cost").value = total.toFixed(2);
}

// ==================== SALE CALCULATIONS ====================
function updateSaleTotal() {
  const qty = parseInt(document.getElementById("sale-qty").value) || 0;
  const price = parseFloat(document.getElementById("sale-price").value) || 0;
  const total = qty * price;

  document.getElementById("sale-total-amount").value = total.toFixed(2);
}

// ==================== HANDLE RESTOCK SUBMIT ====================
async function handleRestockSubmit(e) {
  e.preventDefault();

  const productId = document.getElementById("restock-product").value;
  const quantity = parseInt(document.getElementById("restock-qty").value);

  if (!productId || quantity <= 0) {
    showMessage("Please select product and quantity", "error");
    return;
  }

  try {
    const products = await getAllProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) {
      showMessage("Product not found", "error");
      return;
    }

    const stockData = {
      productId: productId,
      quantity: quantity,
      unitPrice: product.unitPrice,
      totalAmount: quantity * product.unitPrice,
      type: "BUY",
    };

    await recordPurchase(stockData);
    showMessage(
      `Added ${quantity} units of "${product.productName}"!`,
      "success",
    );

    document.getElementById("restock-form").reset();
    document.getElementById("restock-total-cost").value = "0";

    // ✅ UPDATE ALL PAGES
    updateDashboard();
    displayAllProducts();

    // ✅ REFRESH REPORTS IF OPEN
    if (appState.currentPage === "reports") {
      displayReportsData();
      initializeCharts();
    }

    // ✅ REFRESH ALERTS IF OPEN
    if (appState.currentPage === "alerts") {
      displayAlerts();
    }
  } catch (error) {
    showMessage("Error: " + error.message, "error");
  }
}

// ==================== HANDLE SALE SUBMIT ====================
async function handleSaleSubmit(e) {
  e.preventDefault();

  const productId = document.getElementById("sale-product").value;
  const quantity = parseInt(document.getElementById("sale-qty").value);

  if (!productId || quantity <= 0) {
    showMessage("Please select product and quantity", "error");
    return;
  }

  try {
    const products = await getAllProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) {
      showMessage("Product not found", "error");
      return;
    }

    if (product.currentStock < quantity) {
      showMessage(
        `Insufficient stock! Available: ${product.currentStock}`,
        "error",
      );
      return;
    }

    const stockData = {
      productId: productId,
      quantity: quantity,
      unitPrice: product.unitPrice,
      totalAmount: quantity * product.unitPrice,
      type: "SALE",
    };

    await recordSale(stockData);
    showMessage(
      `Sold ${quantity} units of "${product.productName}"!`,
      "success",
    );

    document.getElementById("sale-form").reset();
    document.getElementById("sale-total-amount").value = "0";

    // ✅ UPDATE ALL PAGES
    updateDashboard();
    displayAllProducts();

    // ✅ REFRESH REPORTS IF OPEN
    if (appState.currentPage === "reports") {
      displayReportsData();
      initializeCharts();
    }

    // ✅ REFRESH ALERTS IF OPEN
    if (appState.currentPage === "alerts") {
      displayAlerts();
    }
  } catch (error) {
    showMessage("Error: " + error.message, "error");
  }
}

// ==================== RESTOCK PRODUCT SELECT HANDLER ====================
async function handleRestockProductSelect(e) {
  const productId = e.target.value;
  if (!productId) return;

  const products = await getAllProducts();
  const product = products.find((p) => p.id === productId);

  if (product) {
    document.getElementById("restock-cost").value = product.unitPrice;
    document.getElementById("restock-total-cost").value = "0";
  }
}

// ==================== SALE PRODUCT SELECT HANDLER ====================
async function handleSaleProductSelect(e) {
  const productId = e.target.value;
  if (!productId) return;

  const products = await getAllProducts();
  const product = products.find((p) => p.id === productId);

  if (product) {
    document.getElementById("sale-available-stock").value =
      product.currentStock;
    document.getElementById("sale-price").value = product.unitPrice;
    document.getElementById("sale-total-amount").value = "0";
  }
}

// ==================== PAGE LOAD ====================
window.addEventListener("load", function () {
  if (appState.currentPage === "stock-entry") {
    populateStockDropdowns();
    initStockForms();
  }
});

// ==================== EXPORTS ====================
window.populateStockDropdowns = populateStockDropdowns;
window.initStockForms = initStockForms;
window.updateRestockTotal = updateRestockTotal;
window.updateSaleTotal = updateSaleTotal;
window.handleRestockSubmit = handleRestockSubmit;
window.handleSaleSubmit = handleSaleSubmit;
window.handleRestockProductSelect = handleRestockProductSelect;
window.handleSaleProductSelect = handleSaleProductSelect;
