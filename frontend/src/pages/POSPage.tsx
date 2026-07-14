import { useState, useEffect } from 'react';
import type { Product } from '../types';
import type { BusinessSettings } from '../api/client';
import { fetchProducts, createSale, fetchBusinessSettings } from '../api/client';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    Promise.all([fetchProducts(), fetchBusinessSettings()])
      .then(([productData, businessData]) => {
        setProducts(productData);
        setBusiness(businessData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(product: Product) {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty >= product.quantity) return prevCart;

      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  }

  function increaseQuantity(productId: number) {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id !== productId) return item;
        if (item.quantity >= item.product.quantity) return item;
        return { ...item, quantity: item.quantity + 1 };
      })
    );
  }

  function decreaseQuantity(productId: number) {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId: number) {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }

  const total = cart.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  const tendered = parseFloat(amountTendered) || 0;
  const change = tendered - total;

  async function handleCheckout() {
    setCheckoutError('');
    try {
      await createSale(
        paymentMethod,
        cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))
      );
      const receiptItems = cart.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.product.price),
      }));
      const receiptTotal = total;
      setCart([]);
      setAmountTendered('');
      navigate('/receipt', {
        state: { items: receiptItems, total: receiptTotal, paymentMethod },
      });
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="empty-state">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="pos-header">
        <p className="pos-business-name">{business?.business_name || 'POS'}</p>
      </div>

      <input
        className="search-input"
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <h2>Products</h2>
      {filteredProducts.length === 0 ? (
        <p className="empty-state">No products found.</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const inCart = cart.find((item) => item.product.id === product.id);
            const remaining = product.quantity - (inCart?.quantity ?? 0);
            return (
              <button
                key={product.id}
                className="product-button"
                onClick={() => addToCart(product)}
                disabled={remaining <= 0}
              >
                {product.name}<br />${product.price}
                <span className="stock-label">
                  {remaining <= 0 ? 'Out of stock' : `${remaining} left`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <h2>Cart</h2>
      {cart.length === 0 ? (
        <p className="empty-state">Cart is empty. Tap a product to add it.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.product.id} className="cart-item">
              <span className="cart-item-name">
                {item.product.name} — ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
              </span>
              <div className="qty-controls">
                <button className="qty-btn" onClick={() => decreaseQuantity(item.product.id)}>−</button>
                <span>{item.quantity}</span>
                <button className="qty-btn" onClick={() => increaseQuantity(item.product.id)}>+</button>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.product.id)}>Remove</button>
            </div>
          ))}

          <select
            className="payment-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank transfer">Bank Transfer</option>
            <option value="ecocash">EcoCash</option>
          </select>

          {paymentMethod === 'cash' && (
            <>
              <input
                className="input-field"
                type="number"
                placeholder="Amount tendered"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
              />
              {amountTendered && (
                <div className="change-row">
                  <span>Change</span>
                  <span className={`change-amount ${change < 0 ? 'insufficient' : ''}`}>
                    {change < 0 ? `Short by $${Math.abs(change).toFixed(2)}` : `$${change.toFixed(2)}`}
                  </span>
                </div>
              )}
            </>
          )}

          <div className="total-row">
            <h3>Total</h3>
            <h3>${total.toFixed(2)}</h3>
          </div>

          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={paymentMethod === 'cash' && tendered < total}
          >
            Checkout
          </button>
        </>
      )}

      {checkoutError && <p className="error-text">{checkoutError}</p>}
    </div>
  );
}