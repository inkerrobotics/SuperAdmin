import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Permission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface CustomRole {
  id: string;
  name: string;
  permissions: Permission[];
}

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  customRole?: CustomRole;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  hasPermission: (module: string, action?: 'view' | 'create' | 'edit' | 'delete') => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage if exists
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isSuperAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete' = 'view') => {
    // Super admin has all permissions
    if (isSuperAdmin()) {
      return true;
    }

    // Check custom role permissions
    if (user?.customRole?.permissions) {
      const permission = user.customRole.permissions.find(p => p.module === module);
      if (!permission) return false;

      switch (action) {
        case 'view':
          return permission.canView;
        case 'create':
          return permission.canCreate;
        case 'edit':
          return permission.canEdit;
        case 'delete':
          return permission.canDelete;
        default:
          return false;
      }
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, hasPermission, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
