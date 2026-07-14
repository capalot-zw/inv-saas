import { useState, useEffect } from 'react';
import type { Sale } from '../api/client';
import { fetchMySales } from '../api/client';

export default function MySalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMySales()
      .then(setSales)
      .catch(() => setError('Failed to load sales'));
  }, []);

  return (
    <div>
      <h1>My Sales</h1>
      {error && <p>{error}</p>}
      {sales.map((sale) => (
        <div key={sale.id}>
          {new Date(sale.time_stamp).toLocaleString()} — ${sale.total} ({sale.payment_method})
        </div>
      ))}
    </div>
  );
}