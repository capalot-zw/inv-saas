import { useState, useEffect } from 'react';
import type { Sale } from '../api/client';
import type { Product } from '../types';
import { fetchAllSales, fetchProducts } from '../api/client';
import { Link } from 'react-router-dom';

const LOW_STOCK_THRESHOLD = 10;

export default function DashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchAllSales(), fetchProducts()])
      .then(([salesData, productsData]) => {
        setSales(salesData);
        setProducts(productsData);
      })
      .catch(() => setError('Failed to load dashboard data. You may not have permission.'));
  }, []);

  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const categories = new Set(products.map((p) => p.category).filter(Boolean));
  const lowStockProducts = products.filter((p) => p.quantity < LOW_STOCK_THRESHOLD);
  const healthyPercent = products.length
    ? Math.round(((products.length - lowStockProducts.length) / products.length) * 100)
    : 0;

  const today = new Date().toDateString();
  const todaysSales = sales.filter((s) => new Date(s.time_stamp).toDateString() === today);
  const todaysTotal = todaysSales.reduce((sum, s) => sum + parseFloat(s.total), 0);

  const unitsByCategory: Record<string, number> = {};
  products.forEach((p) => {
    const cat = p.category || 'Uncategorized';
    unitsByCategory[cat] = (unitsByCategory[cat] || 0) + p.quantity;
  });
  const maxCategoryUnits = Math.max(...Object.values(unitsByCategory), 1);

  const recentSales = sales.slice(0, 5);

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="dashboard-nav">
        <Link to="/pos">Point of Sale</Link>
        <Link to="/sales-history">Sales History</Link>
        <Link to="/inventory">Inventory</Link>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">Total Products</div>
          <div className="stat-card-value">{products.length}</div>
          <div className="stat-card-sub">Across {categories.size} categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Units</div>
          <div className="stat-card-value">{totalUnits}</div>
          <div className="stat-card-sub">Items currently in stock</div>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="alert-box">
          <div className="alert-box-title">Low Stock Alerts</div>
          <div className="alert-box-count">{lowStockProducts.length}</div>
          <div className="stat-card-sub">Items below {LOW_STOCK_THRESHOLD} units</div>
          {lowStockProducts.map((p) => (
            <div key={p.id} className="alert-item">
              <div>
                <div className="alert-item-name">{p.name}</div>
                <div className="alert-item-sku">{p.sku}</div>
              </div>
              <div className="alert-item-qty">{p.quantity} left</div>
            </div>
          ))}
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">Today's Sales</div>
          <div className="stat-card-value">${todaysTotal.toFixed(2)}</div>
          <div className="stat-card-sub">{todaysSales.length} transactions today</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Stock Health</div>
          <div className="stat-card-value">{healthyPercent}%</div>
          <div className="stat-card-sub">Products at healthy stock levels</div>
        </div>
      </div>

      <div className="section-card">
        <h2 style={{ marginTop: 0 }}>Inventory by Category</h2>
        {Object.entries(unitsByCategory).map(([cat, units]) => (
          <div key={cat} className="category-row">
            <div className="category-row-header">
              <span>{cat}</span>
              <span>{units} units</span>
            </div>
            <div className="category-bar-track">
              <div
                className="category-bar-fill"
                style={{ width: `${(units / maxCategoryUnits) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="section-card">
        <h2 style={{ marginTop: 0 }}>Recent Sales</h2>
        {recentSales.length === 0 ? (
          <p className="empty-state">No sales yet.</p>
        ) : (
          recentSales.map((sale) => (
            <div key={sale.id} className="sale-row">
              <span>{new Date(sale.time_stamp).toLocaleString()}</span>
              <span>${sale.total} ({sale.payment_method})</span>
            </div>
          ))
        )}
        <Link to="/sales-history" className="view-all-link">View all sales →</Link>
      </div>
    </div>
  );
}