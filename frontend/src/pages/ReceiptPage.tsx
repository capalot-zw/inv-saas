import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BusinessSettings } from '../api/client';
import { fetchBusinessSettings } from '../api/client';
import { ReceiptBuilder, connectPrinter, sendToPrinter, isPrinterConnected } from '../api/printer';

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
  const [printStatus, setPrintStatus] = useState('');

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

  async function handlePrint() {
    setPrintStatus('Connecting...');
    try {
      if (!isPrinterConnected()) {
        await connectPrinter();
      }
      const receipt = new ReceiptBuilder()
        .init()
        .center()
        .doubleSize(true)
        .bold(true)
        .text(business?.business_name || 'Receipt')
        .newline()
        .doubleSize(false)
        .bold(false);

      if (business?.receipt_header) {
        receipt.text(business.receipt_header).newline();
      }
      receipt.left().divider();

      items.forEach((item) => {
        receipt.text(`${item.name} x${item.quantity}`).newline();
        receipt.text(`  $${(item.price * item.quantity).toFixed(2)}`).newline();
      });

      receipt.divider();
      receipt.bold(true).text(`Total: $${total.toFixed(2)}`).newline().bold(false);
      receipt.text(`Payment: ${paymentMethod}`).newline();

      if (business?.receipt_footer) {
        receipt.newline().center().text(business.receipt_footer).newline();
      }
      receipt.cut();

      await sendToPrinter(receipt.build());
      setPrintStatus('Printed!');
    } catch (err) {
      setPrintStatus(err instanceof Error ? err.message : 'Print failed.');
    }
  }

  return (
    <div className="page">
      <div className="receipt-paper">
        {state.pending && (
  <div className="receipt-pending-banner">
    ⚠ Offline — will sync when connection returns
  </div>
)}
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

      <button className="checkout-btn" onClick={handlePrint}>Print Receipt</button>
      {printStatus && <p className="empty-state">{printStatus}</p>}

      <button className="checkout-btn" onClick={() => navigate('/pos')}>New Sale</button>
    </div>
  );
}