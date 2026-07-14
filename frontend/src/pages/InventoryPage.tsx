import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { fetchProducts, updateProductStock } from '../api/client';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  function loadProducts() {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products'));
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setNewQuantity(String(product.quantity));
  }

  async function saveQuantity(productId: number) {
    try {
      await updateProductStock(productId, parseInt(newQuantity, 10));
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setError('Failed to update stock. You may not have permission.');
    }
  }

  return (
    <div className="page">
      <h1>Inventory</h1>
      {error && <p className="error-text">{error}</p>}

      {products.map((product) => (
        <div key={product.id} className="cart-item">
          <span className="cart-item-name">
            {product.name} — {product.sku}
          </span>

          {editingId === product.id ? (
            <>
              <input
                className="input-field"
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                style={{ width: '80px', margin: 0 }}
              />
              <button className="qty-btn" onClick={() => saveQuantity(product.id)}>✓</button>
            </>
          ) : (
            <>
              <span>{product.quantity} in stock</span>
              <button className="remove-btn" onClick={() => startEditing(product)}>Edit</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}