import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLogin from './pages/SuperAdminLogin';
import Dashboard from './pages/Dashboard';
import TenantDetails from './pages/TenantDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SuperAdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tenant/:id" element={<TenantDetails />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
