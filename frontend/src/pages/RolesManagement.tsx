import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { rolesService, Role } from '../services/roles.service';
import { usersService, User } from '../services/users.service';

export default function RolesManagement() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [roleName, setRoleName] = useState('');
  const [userPermissions, setUserPermissions] = useState<Record<string, { read: boolean; write: boolean; update: boolean }>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [deleteRoleInfo, setDeleteRoleInfo] = useState<{ name: string; userCount: number; users: any[] } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesData, modulesData, usersData] = await Promise.all([
        rolesService.getAllRoles(),
        rolesService.getAvailableModules(),
        usersService.getAllUsers()
      ]);
      setRoles(rolesData);
      setModules(modulesData);
      setUsers(usersData);
    } catch (err: any) {
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = () => {
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setRoleName('');
    const initialPermissions: Record<string, { read: boolean; write: boolean; update: boolean }> = {};
    modules.forEach(module => {
      initialPermissions[module] = { read: false, write: false, update: false };
    });
    setUserPermissions(initialPermissions);
    setShowUserModal(true);
  };

  const handlePermissionToggle = (module: string, permission: 'read' | 'write' | 'update') => {
    setUserPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: !prev[module][permission]
      }
    }));
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const adminCount = users.filter(u => u.role === 'USER' && u.customRoleId).length;
      if (adminCount >= 5) {
        setError('Maximum of 5 admins reached. Cannot create more admins.');
        return;
      }

      // Map permissions: read->canView, write->canCreate, update->canEdit, delete is always false
      const permissions = Object.entries(userPermissions).map(([module, perms]) => ({
        module,
        canView: perms.read,
        canCreate: perms.write,
        canEdit: perms.update,
        canDelete: false
      }));

      const roleData = {
        name: roleName,
        description: `Custom role for ${userName}`,
        permissions
      };

      const createdRole = await rolesService.createRole(roleData);

      const userData = {
        name: userName,
        email: userEmail,
        password: userPassword,
        role: 'USER',
        customRoleId: createdRole.id
      };

      await usersService.createUser(userData);

      setSuccess(`User "${userName}" created successfully! They can now login with the provided credentials.`);
      setShowUserModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (role: Role) => {
    setDeleteRoleId(role.id);
    setDeleteRoleInfo({
      name: role.name,
      userCount: role._count?.users || 0,
      users: []
    });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (deleteUsers: boolean = false) => {
    if (!deleteRoleId) return;

    try {
      setError('');
      await rolesService.deleteRole(deleteRoleId, deleteUsers);
      setSuccess(`Role deleted successfully${deleteUsers ? ' along with assigned users' : ''}`);
      setShowDeleteModal(false);
      setDeleteRoleId(null);
      setDeleteRoleInfo(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      // If error contains user count, show it in the modal
      if (err.userCount) {
        setDeleteRoleInfo({
          name: deleteRoleInfo?.name || '',
          userCount: err.userCount,
          users: err.users || []
        });
      }
      setError(err.message);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteRoleId(null);
    setDeleteRoleInfo(null);
    setError('');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  const adminCount = users.filter(u => u.role === 'USER' && u.customRoleId).length;
  const availableSlots = 5 - adminCount;

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Roles & Permissions</h1>
              <p className="text-gray-600 mt-1">Define custom roles and create users with specific permissions</p>
            </div>
            <button
              onClick={openUserModal}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Create Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-slideDown">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg animate-slideDown">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{role.description || 'No description'}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{role._count?.users || 0} users assigned</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    const activePermissions = role.permissions.filter(
                      perm => perm.canView || perm.canCreate || perm.canEdit || perm.canDelete
                    );
                    
                    if (activePermissions.length === 0) {
                      return (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          No permissions assigned
                        </span>
                      );
                    }
                    
                    return (
                      <>
                        {activePermissions.slice(0, 3).map((perm) => (
                          <span
                            key={perm.module}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                          >
                            {perm.module}
                          </span>
                        ))}
                        {activePermissions.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{activePermissions.length - 3} more
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteClick(role)}
                  className="flex items-center justify-center space-x-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {roles.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-600">No admins created yet. Create your first admin to get started.</p>
          </div>
        )}

        {/* User Creation Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Create New Admin</h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleUserSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Info Banner */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-blue-800 font-medium">{adminCount}/5 admins created. {availableSlots} slots available.</span>
                  </div>

                  {/* User Details Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter admin name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <input
                        type="password"
                        required
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter password"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <input
                        type="text"
                        required
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Event Manager, Data Analyst"
                      />
                    </div>
                  </div>

                  {/* Permissions Matrix */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Permissions Matrix</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border">Module</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border">View</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border">Create</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border">Edit</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border">Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modules.map((module) => (
                            <tr key={module} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 border">{module}</td>
                              <td className="px-4 py-3 text-center border">
                                <input
                                  type="checkbox"
                                  checked={userPermissions[module]?.read || false}
                                  onChange={() => handlePermissionToggle(module, 'read')}
                                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                              </td>
                              <td className="px-4 py-3 text-center border">
                                <input
                                  type="checkbox"
                                  checked={userPermissions[module]?.write || false}
                                  onChange={() => handlePermissionToggle(module, 'write')}
                                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                              </td>
                              <td className="px-4 py-3 text-center border">
                                <input
                                  type="checkbox"
                                  checked={userPermissions[module]?.update || false}
                                  onChange={() => handlePermissionToggle(module, 'update')}
                                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                              </td>
                              <td className="px-4 py-3 text-center border">
                                <input
                                  type="checkbox"
                                  disabled
                                  className="w-4 h-4 text-gray-400 rounded cursor-not-allowed"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adminCount >= 5}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {adminCount >= 5 ? 'Maximum Admins Reached' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Role
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm text-gray-600 text-center mb-4">
                Are you sure you want to delete the role <span className="font-semibold text-gray-900">"{deleteRoleInfo?.name}"</span>?
              </p>

              {deleteRoleInfo && deleteRoleInfo.userCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">
                        Warning: {deleteRoleInfo.userCount} user{deleteRoleInfo.userCount > 1 ? 's' : ''} assigned
                      </p>
                      <p className="text-xs text-yellow-700">
                        This role has {deleteRoleInfo.userCount} user{deleteRoleInfo.userCount > 1 ? 's' : ''} assigned to it. 
                        Deleting this role will also delete all assigned users.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteRoleInfo && deleteRoleInfo.userCount > 0)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                {deleteRoleInfo && deleteRoleInfo.userCount > 0 ? 'Delete Role & Users' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
