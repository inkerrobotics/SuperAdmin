import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTitle = (title?: string) => {
  const location = useLocation();

  useEffect(() => {
    const getPageTitle = () => {
      if (title) return title;

      const path = location.pathname;
      const baseName = 'Super Admin Dashboard';

      switch (path) {
        case '/login':
          return 'Login - Super Admin Dashboard';
        case '/dashboard':
          return 'Dashboard - Super Admin';
        case '/tenants':
          return 'Tenants - Super Admin';
        case '/tenants/create':
          return 'Create Tenant - Super Admin';
        case '/roles':
          return 'Roles Management - Super Admin';
        case '/settings':
          return 'Settings - Super Admin';
        case '/activity-logs':
          return 'Activity Logs - Super Admin';
        case '/notifications':
          return 'Notifications - Super Admin';
        case '/backups':
          return 'Backups - Super Admin';
        case '/sessions':
          return 'Sessions - Super Admin';
        case '/analytics':
          return 'Analytics - Super Admin';
        case '/data-cleaning':
          return 'Data Cleaning - Super Admin';
        default:
          if (path.startsWith('/tenant/')) {
            return 'Tenant Details - Super Admin';
          }
          return baseName;
      }
    };

    document.title = getPageTitle();
  }, [location.pathname, title]);
};

export default usePageTitle;