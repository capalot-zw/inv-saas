import { useState, useEffect } from 'react';
import type { Sale, TopProduct } from '../api/client';
import type { Product } from '../types';
import { fetchAllSales, fetchProducts, fetchTopProducts, logout } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Receipt, Package } from 'lucide-react';

const LOW_STOCK_THRESHOLD = 10;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchAllSales(), fetchProducts(), fetchTopProducts()])
      .then(([salesData, productsData, topData]) => {
        setSales(salesData);
        setProducts(productsData);
        setTopProducts(topData);
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

  const last7Days: { label: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayTotal = sales
      .filter((s) => new Date(s.time_stamp).toDateString() === dateStr)
      .reduce((sum, s) => sum + parseFloat(s.total), 0);
    last7Days.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }), total: dayTotal });
  }
  const maxDayTotal = Math.max(...last7Days.map((d) => d.total), 1);

  const recentSales = sales.slice(0, 5);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="dashboard-nav">
        <Link to="/pos">
          <span className="nav-pill-icon"><ShoppingCart size={15} /> Point of Sale</span>
        </Link>
        <Link to="/sales-history">
          <span className="nav-pill-icon"><Receipt size={15} /> Sales History</span>
        </Link>
        <Link to="/inventory">
          <span className="nav-pill-icon"><Package size={15} /> Inventory</span>
        </Link>
        <button
          className="nav-pill-icon"
          style={{
            background: 'var(--white)',
            border: '1px solid var(--green-light)',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--danger)',
          }}
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="stat-grid">
        <Link to="/inventory" className="stat-card-link">
          <div className="stat-card">
            <div className="stat-card-label">Total Products</div>
            <div className="stat-card-value">{products.length}</div>
            <div className="stat-card-sub">Across {categories.size} categories</div>
          </div>
        </Link>
        <Link to="/inventory" className="stat-card-link">
          <div className="stat-card">
            <div className="stat-card-label">Total Units</div>
            <div className="stat-card-value">{totalUnits}</div>
            <div className="stat-card-sub">Items currently in stock</div>
          </div>
        </Link>
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
        <Link to="/sales-history" className="stat-card-link">
          <div className="stat-card">
            <div className="stat-card-label">Today's Sales</div>
            <div className="stat-card-value">${todaysTotal.toFixed(2)}</div>
            <div className="stat-card-sub">{todaysSales.length} transactions today</div>
          </div>
        </Link>
        <Link to="/inventory" className="stat-card-link">
          <div className="stat-card">
            <div className="stat-card-label">Stock Health</div>
            <div className="stat-card-value">{healthyPercent}%</div>
            <div className="stat-card-sub">Products at healthy stock levels</div>
          </div>
        </Link>
      </div>

      <div className="section-card">
        <h2 style={{ marginTop: 0 }}>Last 7 Days</h2>
        <div className="trend-chart">
          {last7Days.map((day, i) => (
            <div key={i} className="trend-bar-wrap">
              <div
                className="trend-bar"
                style={{ height: `${(day.total / maxDayTotal) * 100}%` }}
              />
              <span className="trend-bar-label">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="section-card">
          <h2 style={{ marginTop: 0 }}>Top Selling Products</h2>
          {topProducts.map((tp, i) => (
            <div key={tp.product__id} className="top-product-row">
              <span>
                <span className="top-product-rank">{i + 1}</span>
                {tp.product__name}
              </span>
              <span>{tp.total_sold} sold</span>
            </div>
          ))}
        </div>
      )}

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