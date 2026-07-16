import { useState, useEffect } from 'react';
import type { Sale } from '../api/client';
import { fetchAllSales } from '../api/client';
import Loading from '../components/Loading';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchAllSales()
      .then(setSales)
      .catch(() => setError('Failed to load sales.'))
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(id: number) {
    setExpandedId(expandedId === id ? null : id);
  }

  if (loading) {
    return (
      <div className="page">
        <h1>Sales History</h1>
        <Loading text="Loading sales history..." />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Sales History</h1>
      {error && <p className="error-text">{error}</p>}
      {sales.length === 0 ? (
        <p className="empty-state">No sales yet.</p>
      ) : (
        sales.map((sale) => (
          <div key={sale.id} className="sale-card">
            <div className="sale-card-header" onClick={() => toggleExpand(sale.id)}>
              <div className="sale-card-header-left">
                <span>{new Date(sale.time_stamp).toLocaleString()}</span>
                <span className="sale-card-cashier">{sale.cashier_username}</span>
              </div>
              <span>${sale.total} ({sale.payment_method})</span>
            </div>
            {expandedId === sale.id && (
              <div className="sale-card-details">
                {sale.items.map((item) => (
                  <div key={item.id} className="sale-line-item">
                    <span>{item.product_name} x{item.quantity}</span>
                    <span>${(parseFloat(item.price_at_sale) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}