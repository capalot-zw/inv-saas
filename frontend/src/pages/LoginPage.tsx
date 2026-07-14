import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login,  fetchCurrentUser } from '../api/client';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
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

  return (
  <div className="page">
    <h1>Login</h1>
    <form onSubmit={handleSubmit}>
      <input
        className="input-field"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="input-field"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="checkout-btn" type="submit">Log In</button>
    </form>
    {error && <p className="error-text">{error}</p>}
  </div>
);
}