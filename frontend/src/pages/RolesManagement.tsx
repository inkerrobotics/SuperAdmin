import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { rolesService, Role } from '../services/roles.service';
import { usersService, User } from '../services/users.service';
import Toast from '../components/Toast';

export default function RolesManagement() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [deleteRoleInfo, setDeleteRoleInfo] = useState<{ name: string; userCount: number; users: any[] } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  // Tenant form data
  const [tenantData, setTenantData] = useState({
    // Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subscriptionPlan: 'Basic',
    
    // Core Organization Details
    organizationLogo: '',
    businessCategory: '',
    
    // Authorized Tenant Admin Details
    adminFullName: '',
    adminMobileNumber: '',
    adminDesignation: '',
    
    // Branding & Display Preferences
    displayName: '',
    brandColor: '#6366f1',
    
    // Operational & Configuration Details
    timezone: 'Asia/Kolkata',
    country: 'India',
    region: '',
    drawFrequency: 'monthly',
    
    // Compliance & Verification
    dataUsageConsent: false,
    dataPrivacyAcknowledged: false,
    
    // Communication & Support Contacts
    primaryContactPerson: '',
    supportContactEmail: '',
    escalationContact: '',
    
    // WhatsApp Integration
    whatsappPhoneNumberId: '',
    whatsappAccessToken: '',
    whatsappBusinessId: '',
    whatsappWebhookSecret: '',
    whatsappVerifyToken: ''
  });
  const [showWhatsAppSection, setShowWhatsAppSection] = useState(false);
  
  // Lucky Draw System Permissions
  const luckyDrawModules = [
    'Campaigns',
    'Participants',
    'Winners',
    'Draw Management',
    'Reports & Analytics',
    'Settings'
  ];
  
  const [tenantPermissions, setTenantPermissions] = useState<Record<string, { 
    canView: boolean; 
    canCreate: boolean; 
    canEdit: boolean; 
    canDelete: boolean 
  }>>({});

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

  const openTenantModal = () => {
    setTenantData({
      // Basic Info
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      subscriptionPlan: 'Basic',
      
      // Core Organization Details
      organizationLogo: '',
      businessCategory: '',
      
      // Authorized Tenant Admin Details
      adminFullName: '',
      adminMobileNumber: '',
      adminDesignation: '',
      
      // Branding & Display Preferences
      displayName: '',
      brandColor: '#6366f1',
      
      // Operational & Configuration Details
      timezone: 'Asia/Kolkata',
      country: 'India',
      region: '',
      drawFrequency: 'monthly',
      
      // Compliance & Verification
      dataUsageConsent: false,
      dataPrivacyAcknowledged: false,
      
      // Communication & Support Contacts
      primaryContactPerson: '',
      supportContactEmail: '',
      escalationContact: '',
      
      // WhatsApp Integration
      whatsappPhoneNumberId: '',
      whatsappAccessToken: '',
      whatsappBusinessId: '',
      whatsappWebhookSecret: '',
      whatsappVerifyToken: ''
    });
    setShowWhatsAppSection(false);
    
    // Initialize permissions - all enabled by default
    const initialPermissions: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {};
    luckyDrawModules.forEach(module => {
      initialPermissions[module] = { 
        canView: true, 
        canCreate: true, 
        canEdit: true, 
        canDelete: true 
      };
    });
    setTenantPermissions(initialPermissions);
    
    setShowTenantModal(true);
  };

  const handlePermissionToggle = (module: string, permission: 'canView' | 'canCreate' | 'canEdit' | 'canDelete') => {
    setTenantPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: !prev[module][permission]
      }
    }));
  };

  const handleTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!tenantData.name || !tenantData.email || !tenantData.password) {
      setToast({ message: 'Please fill in all required fields', type: 'warning' });
      return;
    }

    if (tenantData.password !== tenantData.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (tenantData.password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    if (!tenantData.dataUsageConsent || !tenantData.dataPrivacyAcknowledged) {
      setToast({ message: 'Please accept data usage consent and privacy acknowledgment', type: 'warning' });
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        name: tenantData.name,
        email: tenantData.email,
        password: tenantData.password,
        subscriptionPlan: tenantData.subscriptionPlan,
        
        // Core Organization Details
        organizationLogo: tenantData.organizationLogo,
        businessCategory: tenantData.businessCategory,
        
        // Authorized Tenant Admin Details
        adminFullName: tenantData.adminFullName,
        adminMobileNumber: tenantData.adminMobileNumber,
        adminDesignation: tenantData.adminDesignation,
        
        // Branding & Display Preferences
        displayName: tenantData.displayName,
        brandColor: tenantData.brandColor,
        
        // Operational & Configuration Details
        timezone: tenantData.timezone,
        country: tenantData.country,
        region: tenantData.region,
        drawFrequency: tenantData.drawFrequency,
        
        // Compliance & Verification
        dataUsageConsent: tenantData.dataUsageConsent,
        dataPrivacyAcknowledged: tenantData.dataPrivacyAcknowledged,
        
        // Communication & Support Contacts
        primaryContactPerson: tenantData.primaryContactPerson,
        supportContactEmail: tenantData.supportContactEmail,
        escalationContact: tenantData.escalationContact
      };

      // Add WhatsApp credentials if provided
      if (showWhatsAppSection) {
        if (tenantData.whatsappPhoneNumberId) payload.whatsappPhoneNumberId = tenantData.whatsappPhoneNumberId;
        if (tenantData.whatsappAccessToken) payload.whatsappAccessToken = tenantData.whatsappAccessToken;
        if (tenantData.whatsappBusinessId) payload.whatsappBusinessId = tenantData.whatsappBusinessId;
        if (tenantData.whatsappWebhookSecret) payload.whatsappWebhookSecret = tenantData.whatsappWebhookSecret;
        if (tenantData.whatsappVerifyToken) payload.whatsappVerifyToken = tenantData.whatsappVerifyToken;
      }

      // Add permissions
      payload.permissions = Object.entries(tenantPermissions).map(([module, perms]) => ({
        module,
        canView: perms.canView,
        canCreate: perms.canCreate,
        canEdit: perms.canEdit,
        canDelete: perms.canDelete
      }));

      const response = await fetch('http://localhost:5001/api/tenants/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create tenant');
      }

      const result = await response.json();
      setToast({ message: `Client created successfully! Client ID: ${result.tenantId}`, type: 'success' });
      setShowTenantModal(false);
      fetchData();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
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
              onClick={openTenantModal}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Create Tenant</span>
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

        {/* Tenant Creation Modal */}
        {showTenantModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Create New Tenant</h2>
                  <button
                    onClick={() => setShowTenantModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleTenantSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Organization Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tenantData.name}
                        onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
                        placeholder="Acme Corporation"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={tenantData.email}
                        onChange={(e) => setTenantData({ ...tenantData, email: e.target.value })}
                        placeholder="admin@acme.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={tenantData.password}
                        onChange={(e) => setTenantData({ ...tenantData, password: e.target.value })}
                        placeholder="Min. 8 characters"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        minLength={8}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={tenantData.confirmPassword}
                        onChange={(e) => setTenantData({ ...tenantData, confirmPassword: e.target.value })}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subscription Plan
                      </label>
                      <select
                        value={tenantData.subscriptionPlan}
                        onChange={(e) => setTenantData({ ...tenantData, subscriptionPlan: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lucky Draw System Permissions */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Lucky Draw System Permissions
                  </h3>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-indigo-700">
                      <strong>Note:</strong> Configure what features this tenant can access in the Lucky Draw System. All permissions are enabled by default.
                    </p>
                  </div>

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
                        {luckyDrawModules.map((module) => (
                          <tr key={module} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 border">{module}</td>
                            <td className="px-4 py-3 text-center border">
                              <input
                                type="checkbox"
                                checked={tenantPermissions[module]?.canView || false}
                                onChange={() => handlePermissionToggle(module, 'canView')}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3 text-center border">
                              <input
                                type="checkbox"
                                checked={tenantPermissions[module]?.canCreate || false}
                                onChange={() => handlePermissionToggle(module, 'canCreate')}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3 text-center border">
                              <input
                                type="checkbox"
                                checked={tenantPermissions[module]?.canEdit || false}
                                onChange={() => handlePermissionToggle(module, 'canEdit')}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3 text-center border">
                              <input
                                type="checkbox"
                                checked={tenantPermissions[module]?.canDelete || false}
                                onChange={() => handlePermissionToggle(module, 'canDelete')}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* WhatsApp Integration */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp Integration (Optional)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppSection(!showWhatsAppSection)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center"
                    >
                      {showWhatsAppSection ? 'Hide' : 'Show'} WhatsApp Settings
                      <svg className={`w-4 h-4 ml-1 transition-transform ${showWhatsAppSection ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {showWhatsAppSection && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4 animate-slideDown">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                        <p className="text-sm text-blue-700">
                          <strong>Note:</strong> All WhatsApp credentials will be encrypted before storage.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number ID
                        </label>
                        <input
                          type="text"
                          value={tenantData.whatsappPhoneNumberId}
                          onChange={(e) => setTenantData({ ...tenantData, whatsappPhoneNumberId: e.target.value })}
                          placeholder="123456789012345"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Access Token
                        </label>
                        <textarea
                          value={tenantData.whatsappAccessToken}
                          onChange={(e) => setTenantData({ ...tenantData, whatsappAccessToken: e.target.value })}
                          placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxx"
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Account ID
                        </label>
                        <input
                          type="text"
                          value={tenantData.whatsappBusinessId}
                          onChange={(e) => setTenantData({ ...tenantData, whatsappBusinessId: e.target.value })}
                          placeholder="987654321098765"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook Secret
                          </label>
                          <input
                            type="text"
                            value={tenantData.whatsappWebhookSecret}
                            onChange={(e) => setTenantData({ ...tenantData, whatsappWebhookSecret: e.target.value })}
                            placeholder="your_webhook_secret"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verify Token
                          </label>
                          <input
                            type="text"
                            value={tenantData.whatsappVerifyToken}
                            onChange={(e) => setTenantData({ ...tenantData, whatsappVerifyToken: e.target.value })}
                            placeholder="your_verify_token"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowTenantModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium"
                  >
                    {loading ? 'Creating...' : 'Create Tenant'}
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
                onClick={() => handleDeleteConfirm(!!(deleteRoleInfo && deleteRoleInfo.userCount > 0))}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                {deleteRoleInfo && deleteRoleInfo.userCount > 0 ? 'Delete Role & Users' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}
