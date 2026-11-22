/**
 * StockFlow — Automated Inventory & Billing Engine
 * Backend Architecture & Business Logic
 *
 * Core Modules:
 * 1. Inventory State & Stock Controller
 * 2. Automated Point-of-Sale (POS) & Billing Processor
 * 3. Dynamic Profit Margin Calculator
 * 4. Audit & Sales Ledger System
 */

// ==========================================
// 1. DATA MODELS & SCHEMAS
// ==========================================

class Product {
  constructor({ id, sku, name, category, costPrice, sellingPrice, stock, threshold }) {
    this.id = id || `PROD-${Date.now()}`;
    this.sku = sku.toUpperCase();
    this.name = name;
    this.category = category;
    this.costPrice = Number(costPrice);
    this.sellingPrice = Number(sellingPrice);
    this.stock = Number(stock);
    this.threshold = Number(threshold);
  }

  // Calculates gross profit margin %: ((Selling - Cost) / Selling) * 100
  getGrossMargin() {
    if (this.sellingPrice <= 0) return 0;
    return (((this.sellingPrice - this.costPrice) / this.sellingPrice) * 100).toFixed(1);
  }

  isLowStock() {
    return this.stock <= this.threshold;
  }
}

class Transaction {
  constructor({ id, customer, items, subtotal, discountRate, taxRate }) {
    this.id = id;
    this.timestamp = new Date().toISOString();
    this.customer = customer || 'Walk-in Customer';
    this.items = items; // Array of { id, sku, name, price, qty }
    this.subtotal = Number(subtotal);
    this.discountRate = Number(discountRate) || 0;
    this.discountAmount = (this.subtotal * this.discountRate) / 100;
    
    const taxableAmount = Math.max(0, this.subtotal - this.discountAmount);
    this.taxRate = Number(taxRate) || 0;
    this.taxAmount = (taxableAmount * this.taxRate) / 100;
    this.grandTotal = taxableAmount + this.taxAmount;
  }
}

// ==========================================
// 2. INVENTORY & TRANSACTION CONTROLLER
// ==========================================

class StockFlowEngine {
  constructor(storageAdapter) {
    this.storage = storageAdapter;
    this.products = [];
    this.transactions = [];
    this.loadState();
  }

  loadState() {
    const rawProducts = this.storage.getItem('stockflow_products');
    const rawTx = this.storage.getItem('stockflow_transactions');
    this.products = rawProducts ? JSON.parse(rawProducts).map(p => new Product(p)) : [];
    this.transactions = rawTx ? JSON.parse(rawTx) : [];
  }

  saveState() {
    this.storage.setItem('stockflow_products', JSON.stringify(this.products));
    this.storage.setItem('stockflow_transactions', JSON.stringify(this.transactions));
  }

  /**
   * Processes a live POS checkout transaction:
   * 1. Validates stock availability for each item.
   * 2. Atomically decrements purchased quantities from inventory.
   * 3. Flags low-stock threshold triggers.
   * 4. Appends transaction to immutable sales history.
   */
  processCheckout({ customer, cartItems, discountPercent = 0, taxPercent = 5 }) {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty. Cannot process checkout.');
    }

    // Step 1: Pre-flight stock validation
    for (const item of cartItems) {
      const product = this.products.find(p => p.id === item.id);
      if (!product) {
        throw new Error(`Product ${item.name} not found in inventory.`);
      }
      if (item.qty > product.stock) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
      }
    }

    // Step 2: Atomic stock deduction & threshold checks
    const lowStockAlerts = [];
    cartItems.forEach(item => {
      const product = this.products.find(p => p.id === item.id);
      product.stock -= item.qty;
      if (product.isLowStock()) {
        lowStockAlerts.push(product.name);
      }
    });

    // Step 3: Financial Calculations & Invoice Generation
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const invoiceId = `INV-${1000 + this.transactions.length + 1}`;

    const newTx = new Transaction({
      id: invoiceId,
      customer,
      items: cartItems,
      subtotal,
      discountRate: discountPercent,
      taxRate: taxPercent
    });

    this.transactions.push(newTx);
    this.saveState();

    return {
      success: true,
      transaction: newTx,
      lowStockAlerts,
      invoiceNumber: invoiceId
    };
  }

  /**
   * Fast restock handler
   */
  restockProduct(productId, amount = 10) {
    const product = this.products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found.');
    product.stock += amount;
    this.saveState();
    return product;
  }

  /**
   * Generates live business analytics for the dashboard
   */
  getAnalytics() {
    const totalUnits = this.products.reduce((acc, p) => acc + p.stock, 0);
    const inventoryValuation = this.products.reduce((acc, p) => acc + (p.stock * p.sellingPrice), 0);
    const lowStockCount = this.products.filter(p => p.isLowStock()).length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTransactions = this.transactions.filter(t => t.timestamp.startsWith(todayStr));
    const todayRevenue = todayTransactions.reduce((acc, t) => acc + t.grandTotal, 0);

    return {
      totalProducts: this.products.length,
      totalUnits,
      inventoryValuation,
      todayRevenue,
      salesCount: todayTransactions.length,
      lowStockCount
    };
  }
}

// Export for Node.js or Browser ES Module environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Product, Transaction, StockFlowEngine };
}
