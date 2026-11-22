# StockFlow — Automated Inventory & Point-of-Sale (POS) Tracker

**Author:** Aeman Abid — BBIT, UET Lahore

StockFlow is a lightweight, responsive retail **Inventory Management** and **Point-of-Sale (POS)** billing web application designed to streamline product catalog tracking, gross profit margin calculations, low-stock replenishment, and printable invoice generation.

---

## Key Features

- **Dashboard Overview (`#view-dashboard`)**
  - Displays live inventory valuation, total product counts, daily revenue metrics, low-stock alerts, and past transaction receipts (`viewPastReceipt`).
- **Inventory Manager (`#view-inventory`)**
  - Full product Create / Edit / Delete workflow (`openProductModal`, `handleProductFormSubmit`, `deleteProduct`).
  - Automatic gross profit margin percentage preview and per-item tracking:
    ```text
    Gross Margin (%) = ((Selling Price - Cost Price) / Selling Price) * 100
    ```
  - Category filtering (`Electronics`, `Groceries`, `Beverages`, `Stationery`, `Accessories`) and real-time search.
  - Automated low-stock detection (`stock <= threshold`) with a 1-click `+10` unit replenishment button (`quickRestock`).
- **Real-Time POS & Billing (`#view-pos`)**
  - Interactive product grid and live shopping cart (`addToCart`, `updateCartQty`, `removeFromCart`, `clearCart`).
  - Dynamic stock validation preventing overselling (`qty <= product.stock`).
  - Discount percentage and configurable sales tax calculation (`calculateCartTotals`), atomic checkout (`processCheckout`), and sequential invoice numbering (`INV-...`).
  - Print-ready itemized receipt view (`openReceiptModal` with `@media print` styling on `#printable-receipt`).
- **Zero-Friction Client-Side Persistence**
  - Persists product catalogs and sales history automatically in browser `localStorage` (`stockflow_products`, `stockflow_transactions`).
  - Includes **Load Demo Data** (9 pre-configured retail items priced in PKR / `Rs`) and **Reset to Default** (`confirmResetData`).

---

## Project Structure

| File | Description |
| :--- | :--- |
| `index.html` | Complete standalone responsive web application (HTML5, Tailwind CSS CDN, Plus Jakarta Sans font, Lucide Icons CDN, and vanilla JS). |
| `backend_engine.js` | Modular JavaScript business-logic layer (`Product`, `Transaction`, `StockFlowEngine`) exporting via `module.exports`. |
| `api_server.py` | Python 3 dataclass billing & inventory engine (`Product`, `CartItem`, `Invoice`, `InventoryBillingEngine`) structured for Flask/FastAPI REST integration. |

---

## Tech Stack

- **Frontend:** HTML5, Tailwind CSS (CDN), Vanilla JavaScript, Lucide Icons, Google Fonts (`Plus Jakarta Sans`)
- **Storage:** Browser `localStorage`
- **Backend Architecture Modules:** JavaScript (ES/CommonJS) & Python 3 (`dataclasses`)

---

## Getting Started

### Run in Browser (No Build Required)
1. Clone this repository or click **Code → Download ZIP** and extract the folder:
   ```bash
   git clone https://github.com/aemanabid877-max/stockflow-pos.git
   ```
2. Double-click **`index.html`** to open StockFlow directly in Chrome, Edge, or any modern browser.
   *(Internet access loads Tailwind CSS, Google Fonts, and Lucide Icons CDNs.)*

### Run with a Local HTTP Server (Optional)
```bash
cd stockflow-pos
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

## Backend Module Overview

- **`backend_engine.js`**: Exports `Product`, `Transaction`, and `StockFlowEngine` (with `loadState`, `saveState`, `processCheckout`, `restockProduct`, and `getAnalytics`) for Node.js or custom storage adapters.
- **`api_server.py`**: Implements `Product`, `CartItem`, `Invoice`, and `InventoryBillingEngine` (`add_product`, `restock`, `process_checkout`) using the Python 3 standard library.
