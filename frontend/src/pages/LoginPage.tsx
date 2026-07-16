import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, fetchCurrentUser, fetchBusinessSettings } from '../api/client';
import type { BusinessSettings } from '../api/client';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinessSettings().then(setBusiness).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const token = await login(username, password);
      localStorage.setItem('token', token);
      const user = await fetchCurrentUser();
      localStorage.setItem('role', user.role);
      navigate(user.role === 'cashier' ? '/pos' : '/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    }
  }

  const businessName = business?.business_name || 'Vetmas Investments';
  const initial = businessName.trim().charAt(0).toUpperCase();

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-mark">
          {business?.logo ? (
            <img src={business.logo} alt={businessName} />
          ) : (
            <span className="login-mark-letter">{initial}</span>
          )}
        </div>

        <div className="login-business-name">{businessName}</div>
        <div className="login-rule" />
        {business?.receipt_header && (
          <div className="login-tagline">{business.receipt_header}</div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="username">Username</label>
          <input
            id="username"
            className="input-field"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="login-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="checkout-btn" type="submit">Sign In</button>
        </form>

        {error && <p className="error-text">{error}</p>}

        <div className="login-footer-brand">Powered by The Purple Web Dev</div>
      </div>
    </div>
  );
}