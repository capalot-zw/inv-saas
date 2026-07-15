import { useState, useEffect } from 'react';
import type { Sale } from '../api/client';
import { fetchMySales } from '../api/client';
import Loading from '../components/Loading';

export default function MySalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMySales()
      .then(setSales)
      .catch(() => setError('Failed to load sales'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h1>My Sales</h1>
        <Loading text="Loading your sales..." />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Sales</h1>
      {error && <p className="error-text">{error}</p>}
      {sales.length === 0 ? (
        <p className="empty-state">No sales yet.</p>
      ) : (
        sales.map((sale) => (
          <div key={sale.id} className="sale-row">
            <span>{new Date(sale.time_stamp).toLocaleString()}</span>
            <span>${sale.total} ({sale.payment_method})</span>
          </div>
        ))
      )}
    </div>
  );
}