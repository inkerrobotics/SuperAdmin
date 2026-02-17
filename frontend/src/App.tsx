import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SuperAdminLogin from './pages/SuperAdminLogin';
import Dashboard from './pages/Dashboard';
import TenantDetails from './pages/TenantDetails';
import RolesManagement from './pages/RolesManagement';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<SuperAdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roles" element={<RolesManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tenant/:id" element={<TenantDetails />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
