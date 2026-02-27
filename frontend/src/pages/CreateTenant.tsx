import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { tenantsService } from '../services/tenants.service';

export default function CreateTenant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const [clientData, setClientData] = useState({
    // Basic Information
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

  // Lucky Draw Permissions (matching Lucky Draw system structure)
  const luckyDrawModules = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'contests', label: 'Contests' },
    { key: 'participants', label: 'Participants' },
    { key: 'draw', label: 'Draw' },
    { key: 'winners', label: 'Winners' },
    { key: 'communication', label: 'Communication' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'settings', label: 'Settings' },
    { key: 'user_management', label: 'User Management' }
  ];

  const [permissions, setPermissions] = useState<Record<string, ('read' | 'write' | 'update')[]>>(() => {
    const initial: any = {};
    luckyDrawModules.forEach(module => {
      // Dashboard has read permission by default, others are empty
      initial[module.key] = module.key === 'dashboard' ? ['read'] : [];
    });
    return initial;
  });

  const handlePermissionToggle = (moduleKey: string, permission: 'read' | 'write' | 'update') => {
    setPermissions(prev => {
      const currentPerms = prev[moduleKey] || [];
      const hasPermission = currentPerms.includes(permission);
      
      return {
        ...prev,
        [moduleKey]: hasPermission
          ? currentPerms.filter(p => p !== permission)
          : [...currentPerms, permission]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!clientData.name || !clientData.email || !clientData.password) {
      setToast({ message: 'Please fill in all required fields', type: 'warning' });
      return;
    }

    if (clientData.password !== clientData.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (clientData.password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    if (!clientData.dataUsageConsent || !clientData.dataPrivacyAcknowledged) {
      setToast({ message: 'Please accept data usage consent and privacy acknowledgment', type: 'warning' });
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        ...clientData,
        permissions: permissions // Send permissions object directly in Lucky Draw format
      };

      const result = await tenantsService.createTenant(payload);
      setToast({ message: `Client created successfully! Client ID: ${result.tenantId}`, type: 'success' });
      
      setTimeout(() => {
        navigate('/tenants');
      }, 2000);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Information', icon: '📋' },
    { id: 'organization', name: 'Organization Details', icon: '🏢' },
    { id: 'admin', name: 'Admin Contact', icon: '👤' },
    { id: 'branding', name: 'Branding', icon: '🎨' },
    { id: 'operational', name: 'Operational', icon: '⚙️' },
    { id: 'permissions', name: 'Permissions', icon: '🔐' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'compliance', name: 'Compliance', icon: '✅' },
    { id: 'support', name: 'Support Contacts', icon: '📞' }
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Create New Client</h1>
              <p className="text-gray-600 mt-1">Add a new organization to the Lucky Draw System</p>
            </div>
            <button
              onClick={() => navigate('/tenants')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Clients
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-6">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-2 p-4" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                      ${activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={clientData.name}
                        onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Acme Corporation"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={clientData.email}
                        onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="admin@acme.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={clientData.password}
                        onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Min. 8 characters"
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
                        value={clientData.confirmPassword}
                        onChange={(e) => setClientData({ ...clientData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Re-enter password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subscription Plan
                      </label>
                      <select
                        value={clientData.subscriptionPlan}
                        onChange={(e) => setClientData({ ...clientData, subscriptionPlan: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Organization Details Tab */}
              {activeTab === 'organization' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Logo URL
                      </label>
                      <input
                        type="url"
                        value={clientData.organizationLogo}
                        onChange={(e) => setClientData({ ...clientData, organizationLogo: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-sm text-gray-500 mt-1">High resolution logo for posters and branding</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Category / Industry Type
                      </label>
                      <select
                        value={clientData.businessCategory}
                        onChange={(e) => setClientData({ ...clientData, businessCategory: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Category</option>
                        <option value="Retail">Retail</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Automotive">Automotive</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Contact Tab */}
              {activeTab === 'admin' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Authorized Tenant Admin Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={clientData.adminFullName}
                        onChange={(e) => setClientData({ ...clientData, adminFullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={clientData.adminMobileNumber}
                        onChange={(e) => setClientData({ ...clientData, adminMobileNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role / Designation
                      </label>
                      <input
                        type="text"
                        value={clientData.adminDesignation}
                        onChange={(e) => setClientData({ ...clientData, adminDesignation: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="CEO, Marketing Manager, etc."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Branding & Display Preferences</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Display Name for Posters
                      </label>
                      <input
                        type="text"
                        value={clientData.displayName}
                        onChange={(e) => setClientData({ ...clientData, displayName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Acme Lucky Draw"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={clientData.brandColor}
                          onChange={(e) => setClientData({ ...clientData, brandColor: e.target.value })}
                          className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={clientData.brandColor}
                          onChange={(e) => setClientData({ ...clientData, brandColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="#6366f1"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">For posters and interface theming</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Operational Tab */}
              {activeTab === 'operational' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Operational & Configuration Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Time Zone
                      </label>
                      <select
                        value={clientData.timezone}
                        onChange={(e) => setClientData({ ...clientData, timezone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                        <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={clientData.country}
                        onChange={(e) => setClientData({ ...clientData, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="India"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region / State
                      </label>
                      <input
                        type="text"
                        value={clientData.region}
                        onChange={(e) => setClientData({ ...clientData, region: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Maharashtra, Karnataka, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Draw Frequency
                      </label>
                      <select
                        value={clientData.drawFrequency}
                        onChange={(e) => setClientData({ ...clientData, drawFrequency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="campaign-based">Campaign-based</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Permissions Tab */}
              {activeTab === 'permissions' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Lucky Draw Permissions</h2>
                  <p className="text-sm text-gray-600 mb-4">Configure module-level permissions for this client (read, write, update)</p>
                  
                  <div className="space-y-4">
                    {luckyDrawModules.map((module) => (
                      <div key={module.key} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3">{module.label}</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions[module.key]?.includes('read')}
                              onChange={() => handlePermissionToggle(module.key, 'read')}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Read</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions[module.key]?.includes('write')}
                              onChange={() => handlePermissionToggle(module.key, 'write')}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Write</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions[module.key]?.includes('update')}
                              onChange={() => handlePermissionToggle(module.key, 'update')}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Update</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Permission Types</h4>
                        <ul className="text-sm text-blue-700 mt-1 space-y-1">
                          <li><strong>Read:</strong> View and access module data</li>
                          <li><strong>Write:</strong> Create new entries in the module</li>
                          <li><strong>Update:</strong> Modify existing entries in the module</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Integration Tab */}
              {activeTab === 'whatsapp' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">WhatsApp Integration</h2>
                  <p className="text-sm text-gray-600 mb-4">Configure WhatsApp Business API credentials (all fields are encrypted)</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Phone Number ID
                      </label>
                      <input
                        type="text"
                        value={clientData.whatsappPhoneNumberId}
                        onChange={(e) => setClientData({ ...clientData, whatsappPhoneNumberId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="123456789012345"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Access Token
                      </label>
                      <input
                        type="password"
                        value={clientData.whatsappAccessToken}
                        onChange={(e) => setClientData({ ...clientData, whatsappAccessToken: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="EAAxxxxxxxxxx..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Business Account ID
                      </label>
                      <input
                        type="text"
                        value={clientData.whatsappBusinessId}
                        onChange={(e) => setClientData({ ...clientData, whatsappBusinessId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="123456789012345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook Secret
                      </label>
                      <input
                        type="password"
                        value={clientData.whatsappWebhookSecret}
                        onChange={(e) => setClientData({ ...clientData, whatsappWebhookSecret: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Your webhook secret"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verify Token
                      </label>
                      <input
                        type="text"
                        value={clientData.whatsappVerifyToken}
                        onChange={(e) => setClientData({ ...clientData, whatsappVerifyToken: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Your verify token"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Security Note</h4>
                        <p className="text-sm text-blue-700 mt-1">All WhatsApp credentials are encrypted with AES-256-CBC before storage.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Tab */}
              {activeTab === 'compliance' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance & Verification</h2>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clientData.dataUsageConsent}
                          onChange={(e) => setClientData({ ...clientData, dataUsageConsent: e.target.checked })}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
                          required
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Consent for Participant Data Usage <span className="text-red-500">*</span>
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            I confirm that this organization has obtained necessary consent from participants for data collection and usage in lucky draw campaigns.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clientData.dataPrivacyAcknowledged}
                          onChange={(e) => setClientData({ ...clientData, dataPrivacyAcknowledged: e.target.checked })}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
                          required
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Data Privacy Acknowledgment <span className="text-red-500">*</span>
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            I acknowledge that this organization will comply with all applicable data privacy laws and regulations (GDPR, CCPA, etc.) when using this system.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-yellow-900">Important</h4>
                          <p className="text-sm text-yellow-700 mt-1">Both compliance checkboxes are required to create a new client.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Support Contacts Tab */}
              {activeTab === 'support' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Communication & Support Contacts</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Contact Person
                      </label>
                      <input
                        type="text"
                        value={clientData.primaryContactPerson}
                        onChange={(e) => setClientData({ ...clientData, primaryContactPerson: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Contact Email
                      </label>
                      <input
                        type="email"
                        value={clientData.supportContactEmail}
                        onChange={(e) => setClientData({ ...clientData, supportContactEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="support@acme.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Escalation Contact (Optional)
                      </label>
                      <input
                        type="text"
                        value={clientData.escalationContact}
                        onChange={(e) => setClientData({ ...clientData, escalationContact: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="escalation@acme.com or +91 98765 43210"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/tenants')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 btn-ripple font-medium"
            >
              {loading ? 'Creating Client...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>

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
