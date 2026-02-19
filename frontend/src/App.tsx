import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SuperAdminLogin from './pages/SuperAdminLogin';
import Dashboard from './pages/Dashboard';
import TenantDetails from './pages/TenantDetails';
import RolesManagement from './pages/RolesManagement';
import Settings from './pages/Settings';
import ActivityLogs from './pages/ActivityLogs';
import Notifications from './pages/Notifications';
import Backups from './pages/Backups';
import Sessions from './pages/Sessions';
import Analytics from './pages/Analytics';
import DataCleaning from './pages/DataCleaning';
import TenantsManagement from './pages/TenantsManagement';
import CreateTenant from './pages/CreateTenant';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<SuperAdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activity-logs" element={<ActivityLogs />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/backups" element={<Backups />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/data-cleaning" element={<DataCleaning />} />
          <Route path="/tenants" element={<TenantsManagement />} />
          <Route path="/tenants/create" element={<CreateTenant />} />
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
