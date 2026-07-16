import { useState, useEffect } from 'react';
import type { StaffUser } from '../api/client';
import { fetchStaff, createStaff, updateStaffRole, deleteStaff, resetStaffPassword } from '../api/client';
import Loading from '../components/Loading';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [resetId, setResetId] = useState<number | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('cashier');

  useEffect(() => {
    loadStaff();
  }, []);

  function loadStaff() {
    setLoading(true);
    fetchStaff()
      .then(setStaff)
      .catch(() => setError('Failed to load staff. You may not have permission.'))
      .finally(() => setLoading(false));
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createStaff(newUsername, newPassword, newRole);
      setNewUsername('');
      setNewPassword('');
      setNewRole('cashier');
      setShowAddForm(false);
      loadStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add staff member.');
    }
  }

  async function handleRoleChange(userId: number, role: string) {
    setError('');
    try {
      await updateStaffRole(userId, role);
      loadStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role.');
    }
  }

  async function handleDelete(userId: number, username: string) {
    if (!confirm(`Remove "${username}" from staff? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteStaff(userId);
      loadStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove staff member.');
    }
  }

  function startReset(userId: number) {
    setResetId(userId);
    setNewResetPassword('');
  }

  async function handleResetPassword(userId: number) {
    setError('');
    try {
      await resetStaffPassword(userId, newResetPassword);
      setResetId(null);
      setNewResetPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h1>Staff Management</h1>
        <Loading text="Loading staff..." />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Staff Management</h1>
      {error && <p className="error-text">{error}</p>}

      <button className="toggle-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? 'Cancel' : '+ Add Staff Member'}
      </button>

      {showAddForm && (
        <form className="add-product-form" onSubmit={handleAddStaff}>
          <input
            className="input-field"
            placeholder="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <select
            className="payment-select"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button className="checkout-btn" type="submit">Add Staff Member</button>
        </form>
      )}

      {staff.map((user) => (
        <div key={user.id} className="cart-item" style={{ flexWrap: 'wrap' }}>
          <span className="cart-item-name">
            {user.username} <span className={`role-badge ${user.role}`}>{user.role}</span>
          </span>

          {resetId === user.id ? (
            <>
              <input
                className="input-field"
                type="password"
                placeholder="New password"
                value={newResetPassword}
                onChange={(e) => setNewResetPassword(e.target.value)}
                style={{ width: '140px', margin: 0 }}
              />
              <button className="qty-btn" onClick={() => handleResetPassword(user.id)}>✓</button>
              <button className="remove-btn" onClick={() => setResetId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <select
                className="role-select"
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button className="remove-btn" onClick={() => startReset(user.id)}>Reset Password</button>
              <button className="remove-btn" onClick={() => handleDelete(user.id, user.username)}>Remove</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}