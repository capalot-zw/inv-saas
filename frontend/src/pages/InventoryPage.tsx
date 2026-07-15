import { useState, useEffect } from 'react';
import type { Product } from '../types';
import type { NewProduct } from '../api/client';
import { fetchProducts, updateProductStock, createProduct, deleteProduct } from '../api/client';
import Loading from '../components/Loading';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  function loadProducts() {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
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

  async function handleDelete(productId: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(productId);
      loadProducts();
    } catch (err) {
      setError('Failed to delete product.');
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const product: NewProduct = {
      name: newName,
      sku: newSku,
      price: parseFloat(newPrice),
      quantity: parseInt(newStock, 10),
      category: newCategory || undefined,
    };
    try {
      await createProduct(product);
      setNewName('');
      setNewSku('');
      setNewPrice('');
      setNewStock('');
      setNewCategory('');
      setShowAddForm(false);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product.');
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h1>Inventory</h1>
        <Loading text="Loading inventory..." />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Inventory</h1>
      {error && <p className="error-text">{error}</p>}

      <button className="toggle-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? 'Cancel' : '+ Add New Product'}
      </button>

      {showAddForm && (
        <form className="add-product-form" onSubmit={handleAddProduct}>
          <input
            className="input-field"
            placeholder="Product name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <input
            className="input-field"
            placeholder="SKU"
            value={newSku}
            onChange={(e) => setNewSku(e.target.value)}
            required
          />
          <div className="form-row">
            <input
              className="input-field"
              type="number"
              step="0.01"
              placeholder="Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="number"
              placeholder="Starting stock"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              required
            />
          </div>
          <input
            className="input-field"
            placeholder="Category (optional)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="checkout-btn" type="submit">Save Product</button>
        </form>
      )}

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
              <button className="remove-btn" onClick={() => handleDelete(product.id, product.name)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}