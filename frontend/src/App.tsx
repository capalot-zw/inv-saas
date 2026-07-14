import { BrowserRouter, Routes, Route } from 'react-router-dom';
import POSPage from './pages/POSPage';
import MySalesPage from './pages/MySalesPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ReceiptPage from './pages/ReceiptPage';
import InventoryPage from './pages/InventoryPage';
import SalesHistoryPage from './pages/SalesHistoryPage';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/my-sales" element={<MySalesPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/receipt" element={<ReceiptPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/sales-history" element={<SalesHistoryPage />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;