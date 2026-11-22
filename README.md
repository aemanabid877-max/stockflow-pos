# StockFlow — Automated Inventory & Point-of-Sale (POS) Tracker

**Author:** Aeman Abid (BBIT, UET Lahore)

> **Attachment Note:** Because Gmail blocks `.js` files (and `.zip` files containing `.js`) for security reasons, `backend_engine.js` is included as `backend_engine.js.txt`. `index.html` runs completely standalone in the browser with no changes needed; if you use the modular JS backend separately, simply rename `backend_engine.js.txt` back to `backend_engine.js`.

StockFlow is an automated retail Inventory Management and Point-of-Sale (POS) billing web application built to simplify product catalog tracking, profit margin visibility, low-stock replenishment, and invoice generation.

---

## Project Files

| File | Role | Description |
| :--- | :--- | :--- |
| `index.html` | Complete Web Application | Standalone responsive frontend built with HTML5, Tailwind CSS (CDN), Google Fonts (`Plus Jakarta Sans`), Lucide Icons (CDN), and vanilla JavaScript with `localStorage` persistence. |
| `backend_engine.js` | JavaScript Engine Module | Modular ES/CommonJS data models and transaction controller (`Product`, `Transaction`, `StockFlowEngine`) covering margin math, atomic checkout validation, restocking, and analytics. |
| `api_server.py` | Python Engine / REST Models | Python 3 dataclass architecture (`Product`, `CartItem`, `Invoice`, `InventoryBillingEngine`) designed for FastAPI/Flask REST integration. |
| `README.md` | Documentation | Architecture summary, file guide, and local run instructions. |

---

## Key Features & Architecture

1. **Dashboard Overview (`#view-dashboard`)**
   - Displays real-time inventory metrics, stock valuation, daily sales revenue, low-stock summaries, and sales history access (`viewPastReceipt`).
2. **Inventory Manager (`#view-inventory`)**
   - Full product CRUD via modal form (`openProductModal`, `handleProductFormSubmit`, `deleteProduct`).
   - Automatic gross profit margin percentage calculation:
     `Gross Margin (%) = ((Selling Price - Cost Price) / Selling Price) * 100`
   - Category filtering (`Electronics`, `Groceries`, `Beverages`, `Stationery`, `Accessories`), search filtering, low-stock threshold alerts (`stock <= threshold`), and 1-click `+10` restock (`quickRestock`).
3. **Real-Time POS & Billing (`#view-pos`)**
   - Interactive product catalog grid and live shopping cart (`addToCart`, `updateCartQty`, `removeFromCart`, `clearCart`).
   - Dynamic stock validation preventing overselling (`qty > product.stock`).
   - Discount percentage and configurable sales tax calculation (`calculateCartTotals`), generating numbered invoices (`INV-...`) via `processCheckout`.
   - Clean print stylesheet (`@media print` targeting `#printable-receipt`) for itemized receipts (`openReceiptModal`).
4. **Client-Side Persistence**
   - Zero-setup persistence in browser `localStorage` under keys:
     - `stockflow_products`
     - `stockflow_transactions`
   - Includes **Load Demo Data** (`loadDemoData`, 9 pre-configured retail items in PKR / `Rs`) and **Reset to Default** (`confirmResetData`).

---

## How to Run Locally

### Option 1: Open Directly in Browser (Fastest)
1. Extract all files into a single folder.
2. Double-click **`index.html`** to open it in Google Chrome, Microsoft Edge, or any modern browser.
   *(Requires internet access on load for Tailwind CSS CDN, Google Fonts, and Lucide Icons CDN.)*

### Option 2: Run via Local HTTP Server
If you prefer serving over `http://localhost`:
```bash
# Inside the project folder (Python 3):
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Backend Architecture Modules
- **JavaScript (`backend_engine.js`):** Exports `{ Product, Transaction, StockFlowEngine }` via `module.exports` for Node.js or wrapper adapters (`new StockFlowEngine(storageAdapter)`).
- **Python (`api_server.py`):** Uses Python 3 standard library (`dataclasses`, `datetime`, `typing`) to define `Product`, `CartItem`, `Invoice`, and `InventoryBillingEngine` ready to wire into FastAPI or Flask HTTP endpoints.
