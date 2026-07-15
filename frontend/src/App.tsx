import { BrowserRouter, Routes, Route } from 'react-router-dom';
import POSPage from './pages/POSPage';
import MySalesPage from './pages/MySalesPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ReceiptPage from './pages/ReceiptPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import InventoryPage from './pages/InventoryPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={['cashier', 'manager', 'admin']}>
              <POSPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipt"
          element={
            <ProtectedRoute allowedRoles={['cashier', 'manager', 'admin']}>
              <ReceiptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-sales"
          element={
            <ProtectedRoute allowedRoles={['cashier', 'manager', 'admin']}>
              <MySalesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-history"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <SalesHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;