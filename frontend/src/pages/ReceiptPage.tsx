import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BusinessSettings } from '../api/client';
import { fetchBusinessSettings } from '../api/client';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptState {
  items: ReceiptItem[];
  total: number;
  paymentMethod: string;
}

export default function ReceiptPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReceiptState | null;
  const [business, setBusiness] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    fetchBusinessSettings().then(setBusiness);
  }, []);

  if (!state) {
    return (
      <div className="page">
        <p>No receipt to show.</p>
        <button className="checkout-btn" onClick={() => navigate('/pos')}>Back to POS</button>
      </div>
    );
  }

  const { items, total, paymentMethod } = state;

  return (
    <div className="page">
      <div className="receipt-paper">
        <div className="receipt-business-name">
          {business?.business_name || 'Your Business'}
        </div>
        {business?.receipt_header && (
          <div className="receipt-header-text">{business.receipt_header}</div>
        )}

        <hr className="receipt-divider" />

        {items.map((item, index) => (
          <div key={index} className="receipt-item-row">
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}

        <hr className="receipt-divider" />

        <div className="receipt-total-row">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="receipt-item-row">
          <span>Payment</span>
          <span>{paymentMethod}</span>
        </div>

        {business?.receipt_footer && (
          <>
            <hr className="receipt-divider" />
            <div className="receipt-footer-text">{business.receipt_footer}</div>
          </>
        )}

        <div className="receipt-meta">{new Date().toLocaleString()}</div>
      </div>

      <button className="checkout-btn" onClick={() => navigate('/pos')}>New Sale</button>
    </div>
  );
}