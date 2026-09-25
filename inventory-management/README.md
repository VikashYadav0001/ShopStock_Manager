# 📦 Inventory Management System

A complete web-based inventory management application for campus canteens, stores, and small businesses.

## 🎯 Features

### ✅ Core Functionality
- **Product Management**: Add, edit, delete, and search products
- **Stock Tracking**: Record purchases (restock) and sales
- **Low Stock Alerts**: Visual warnings when inventory falls below minimum levels
- **Checkout & Billing**: Shopping cart, discount, tax calculation
- **Receipt Generation**: Print and PDF export capabilities
- **Sales Reports**: Analytics with charts and graphs
- **Transaction History**: Complete log of all activities

### 📊 Dashboard
- Total products count
- Low stock items count
- Total inventory value
- Today's sales
- Recent transactions display

## 🛠️ Technology Stack

**Frontend:**
- HTML5 + CSS3
- Vanilla JavaScript (ES6+)
- Chart.js for graphs
- html2pdf for PDF generation

**Backend:**
- Java (Spring Boot recommended)
- SQLite (local database)
- REST API endpoints

## 📁 Project Structure

```
inventory-system/
├── index.html              # Main entry point
├── css/
│   └── style.css          # Complete styling
├── js/
│   ├── main.js            # Navigation & core logic
│   ├── api.js             # API calls & simulated backend
│   ├── products.js        # Product management
│   ├── stock-entry.js     # Stock buy/sell
│   ├── checkout.js        # Billing & receipts
│   ├── reports.js         # Analytics
│   └── alerts.js          # Notifications
├── README.md
└── backend/               # (To be created)
    └── Java Spring Boot project
```

## 🚀 Getting Started

### Frontend Only (Testing)

1. **No installation needed!** Just open `index.html` in a web browser
2. All data is stored in browser's `localStorage`
3. Perfect for testing UI/UX without backend

```bash
# Simply open in browser
open index.html
# or
start index.html
```

### Frontend + Backend Setup (Production)

#### Step 1: Start Backend (Java)

```bash
cd backend
mvn spring-boot:run
# Server runs on http://localhost:8080
```

#### Step 2: Start Frontend

```bash
# Option 1: Open in browser
open index.html

# Option 2: Use a simple HTTP server
python -m http.server 3000
# Then visit http://localhost:3000
```

#### Step 3: Enable Real API

In `js/api.js`, change:
```javascript
const USE_SIMULATED_API = false;  // Changed from true
```

## 💾 Data Storage

### Frontend (Without Backend)
- All data stored in browser's `localStorage`
- Persists across sessions
- Limited to browser capacity (~5-10MB)

### Backend (With Java)
- Stores in SQLite database
- File: `inventory.db`
- Accessible from anywhere

## 📋 How to Use

### Adding Products
1. Go to **Products** page
2. Fill form: Name, Category, Price, Stock, Min Level
3. Click "Add Product"
4. Search by name/category in the table below

### Recording Stock
1. **Restock**: Go to Stock Entry → Restock section
   - Select product
   - Enter quantity
   - Add supplier name (optional)
   - Click "Record Purchase"

2. **Sale**: Go to Stock Entry → Sale section
   - Select product
   - Enter quantity (can't exceed current stock)
   - Click "Record Sale"

### Checkout & Billing
1. Go to **Checkout** page
2. Add products to cart
3. Adjust discount (optional)
4. Click "Generate Bill"
5. Print or download as PDF

### Viewing Reports
1. Go to **Reports** page
2. See sales statistics and graphs
3. View top 5 selling items
4. Export data as CSV

### Checking Alerts
1. Go to **Alerts** page
2. See all low stock items
3. View best sellers
4. Check transaction history

## 🔧 Backend Setup (Java - For Production)

### Create Spring Boot Project

```bash
mvn archetype:generate \
  -DgroupId=com.inventory \
  -DartifactId=inventory-system \
  -DarchetypeArtifactId=maven-archetype-quickstart
```

### Install Dependencies

Add to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
</dependency>

<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

### Create Backend Files

```
backend/src/main/java/com/inventory/
├── controller/
│   ├── ProductController.java
│   ├── StockController.java
│   ├── CheckoutController.java
│   ├── ReportController.java
│   └── AlertController.java
├── service/
│   ├── ProductService.java
│   ├── StockService.java
│   ├── CheckoutService.java
│   ├── ReportService.java
│   └── AlertService.java
├── model/
│   ├── Product.java
│   ├── Transaction.java
│   ├── Receipt.java
│   └── Alert.java
├── repository/
│   ├── ProductRepository.java
│   └── TransactionRepository.java
└── InventoryApplication.java
```

### API Endpoints

```
GET    /api/products                    # Get all products
POST   /api/products                    # Add new product
PUT    /api/products/{id}               # Update product
DELETE /api/products/{id}               # Delete product

POST   /api/stock/buy                   # Record purchase
POST   /api/stock/sell                  # Record sale
GET    /api/stock/history               # Get transactions

POST   /api/checkout/complete           # Complete sale
GET    /api/checkout/receipts           # Get receipts

GET    /api/reports/sales               # Sales data
GET    /api/reports/top-items           # Best sellers
GET    /api/reports/inventory-value     # Total value

GET    /api/alerts/low-stock            # Low stock items
```

## 📝 Sample Data

To add sample products, use the Product form or import via API:

```json
{
    "productName": "Lays Chips",
    "category": "Snacks",
    "unitPrice": 20.00,
    "currentStock": 45,
    "minReorderLevel": 15
}
```

## 🎤 Presentation Script (Hackathon)

```
"Hello, this is Inventory Management System - a complete inventory 
solution for campus stores and businesses.

TECH STACK:
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Java Spring Boot (if implemented)
- Database: SQLite (local, no dependencies)

FEATURES:
1. Complete CRUD operations for products
2. Real-time stock tracking with low-stock alerts
3. Professional billing system with tax & discount
4. Sales analytics with charts
5. Receipt generation (print & PDF)
6. Transaction history tracking

KEY HIGHLIGHTS:
- All data stored locally (no cloud dependency)
- Responsive design (desktop & mobile)
- User-friendly interface
- Production-ready code

DEMO:
[Show adding a product]
[Show checkout process]
[Show sales report with charts]
[Show low-stock alert]
"
```

## 🐛 Troubleshooting

### Data Not Saving?
- Check browser's localStorage is enabled
- Check console for errors (F12 → Console)
- Clear cache and try again

### Backend Connection Error?
- Ensure Java backend is running on port 8080
- Change `USE_SIMULATED_API` back to `true`
- Check `API_BASE_URL` in `js/api.js`

### Charts Not Showing?
- Ensure Chart.js is loaded (check Network tab in DevTools)
- Check console for JavaScript errors

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ⚠️ Requires polyfills

## 🔐 Security Notes

- This is a local application (no authentication)
- For production, add:
  - User authentication
  - Password hashing
  - HTTPS
  - Rate limiting
  - Input validation
  - SQL injection prevention

## 📦 GitHub Push

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial inventory system commit"

# Push to GitHub
git remote add origin https://github.com/username/inventory-system.git
git branch -M main
git push -u origin main
```

## 📄 License

Free for educational and commercial use

## 👥 Author

Created for campus inventory management

---

**Good luck with your hackathon! 🚀**
