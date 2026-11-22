"""
StockFlow — Automated Inventory & Point-of-Sale (POS) REST API
Framework: Python / FastAPI or Flask Architecture
Author: Aeman Abid (BBIT, UET Lahore)
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

@dataclass
class Product:
    id: str
    sku: str
    name: str
    category: str
    cost_price: float
    selling_price: float
    stock: int
    threshold: int

    @property
    def gross_profit_margin(self) -> float:
        """Calculates item profit margin percentage."""
        if self.selling_price <= 0:
            return 0.0
        return round(((self.selling_price - self.cost_price) / self.selling_price) * 100, 2)

    @property
    def is_low_stock(self) -> bool:
        return self.stock <= self.threshold


@dataclass
class CartItem:
    product_id: str
    sku: str
    name: str
    unit_price: float
    quantity: int


@dataclass
class Invoice:
    invoice_id: str
    customer_name: str
    items: List[CartItem]
    subtotal: float
    discount_percent: float
    discount_amount: float
    tax_percent: float
    tax_amount: float
    grand_total: float
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


class InventoryBillingEngine:
    def __init__(self):
        self.catalog: dict[str, Product] = {}
        self.ledger: List[Invoice] = []
        self._invoice_counter = 1000

    def add_product(self, product: Product) -> None:
        self.catalog[product.id] = product

    def restock(self, product_id: str, units: int = 10) -> Product:
        if product_id not in self.catalog:
            raise ValueError(f"Product {product_id} does not exist.")
        self.catalog[product_id].stock += units
        return self.catalog[product_id]

    def process_checkout(
        self,
        customer_name: str,
        cart: List[CartItem],
        discount_percent: float = 0.0,
        tax_percent: float = 5.0
    ) -> Invoice:
        """
        Atomic checkout execution:
        1. Validates inventory thresholds
        2. Deducts sold quantities
        3. Generates itemized invoice
        """
        if not cart:
            raise ValueError("Cart cannot be empty.")

        # 1. Stock availability validation
        for item in cart:
            product = self.catalog.get(item.product_id)
            if not product:
                raise ValueError(f"Item {item.name} not found.")
            if item.quantity > product.stock:
                raise ValueError(f"Insufficient stock for {product.name}. Available: {product.stock}")

        # 2. Inventory deduction & alert monitoring
        for item in cart:
            self.catalog[item.product_id].stock -= item.quantity

        # 3. Financial calculations
        subtotal = sum(i.unit_price * i.quantity for i in cart)
        discount_amt = (subtotal * discount_percent) / 100
        taxable_amt = max(0.0, subtotal - discount_amt)
        tax_amt = (taxable_amt * tax_percent) / 100
        grand_total = round(taxable_amt + tax_amt, 2)

        self._invoice_counter += 1
        invoice = Invoice(
            invoice_id=f"INV-{self._invoice_counter}",
            customer_name=customer_name or "Walk-in Customer",
            items=cart,
            subtotal=round(subtotal, 2),
            discount_percent=discount_percent,
            discount_amount=round(discount_amt, 2),
            tax_percent=tax_percent,
            tax_amount=round(tax_amt, 2),
            grand_total=grand_total
        )

        self.ledger.append(invoice)
        return invoice
