import { useState, useEffect } from 'react';
import type { Sale } from '../api/client';
import { fetchAllSales } from '../api/client';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllSales()
      .then(setSales)
      .catch(() => setError('Failed to load sales.'));
  }, []);

  return (
    <div className="page">
      <h1>Sales History</h1>
      {error && <p className="error-text">{error}</p>}
      {sales.map((sale) => (
        <div key={sale.id} className="sale-row">
          <span>{new Date(sale.time_stamp).toLocaleString()}</span>
          <span>${sale.total} ({sale.payment_method})</span>
        </div>
      ))}
    </div>
  );
}