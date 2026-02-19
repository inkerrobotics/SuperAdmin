import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Toast from '../components/Toast';

export default function CreateTenant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subscriptionPlan: 'Basic',
    // WhatsApp Integration
    whatsappPhoneNumberId: '',
    whatsappAccessToken: '',
    whatsappBusinessId: '',
    whatsappWebhookSecret: '',
    whatsappVerifyToken: ''
  });

  const [showWhatsAppSection, setShowWhatsAppSection] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setToast({ message: 'Please fill in all required fields', type: 'warning' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (formData.password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        subscriptionPlan: formData.subscriptionPlan
      };

      // Add WhatsApp credentials if provided
      if (showWhatsAppSection) {
        if (formData.whatsappPhoneNumberId) payload.whatsappPhoneNumberId = formData.whatsappPhoneNumberId;
        if (formData.whatsappAccessToken) payload.whatsappAccessToken = formData.whatsappAccessToken;
        if (formData.whatsappBusinessId) payload.whatsappBusinessId = formData.whatsappBusinessId;
        if (formData.whatsappWebhookSecret) payload.whatsappWebhookSecret = formData.whatsappWebhookSecret;
        if (formData.whatsappVerifyToken) payload.whatsappVerifyToken = formData.whatsappVerifyToken;
      }

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
      setToast({ message: `Tenant created successfully! Tenant ID: ${result.tenantId}`, type: 'success' });
      
      setTimeout(() => {
        navigate('/tenants');
      }, 2000);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text">Create New Tenant</h1>
          <p className="text-gray-600 mt-1">Create a new organization with login credentials and WhatsApp integration</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Organization Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Basic">Basic</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </div>

          {/* WhatsApp Integration */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Integration (Optional)
              </h2>
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
                    <strong>Note:</strong> All WhatsApp credentials will be encrypted before storage. You can add these later from the tenant management page.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappPhoneNumberId}
                    onChange={(e) => setFormData({ ...formData, whatsappPhoneNumberId: e.target.value })}
                    placeholder="123456789012345"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Token
                  </label>
                  <textarea
                    value={formData.whatsappAccessToken}
                    onChange={(e) => setFormData({ ...formData, whatsappAccessToken: e.target.value })}
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
                    value={formData.whatsappBusinessId}
                    onChange={(e) => setFormData({ ...formData, whatsappBusinessId: e.target.value })}
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
                      value={formData.whatsappWebhookSecret}
                      onChange={(e) => setFormData({ ...formData, whatsappWebhookSecret: e.target.value })}
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
                      value={formData.whatsappVerifyToken}
                      onChange={(e) => setFormData({ ...formData, whatsappVerifyToken: e.target.value })}
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
              onClick={() => navigate('/tenants')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 btn-ripple font-medium"
            >
              {loading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>

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
