import { useState, useEffect } from 'react';

interface FeaturesSettingsProps {
  settings: Record<string, any>;
  onSave: (settings: Record<string, any>) => void;
}

const FEATURES = [
  { key: 'userRegistration', name: 'User Registration', description: 'Allow new users to register accounts', icon: '👤' },
  { key: 'multiFactorAuth', name: 'Multi-Factor Authentication', description: 'Require 2FA for enhanced security', icon: '🔐' },
  { key: 'apiAccess', name: 'API Access', description: 'Enable REST API endpoints', icon: '🔌' },
  { key: 'fileUploads', name: 'File Uploads', description: 'Allow users to upload files', icon: '📁' },
  { key: 'emailNotifications', name: 'Email Notifications', description: 'Send automated email notifications', icon: '📧' },
  { key: 'auditLogging', name: 'Audit Logging', description: 'Track all system activities', icon: '📝' }
];

export default function FeaturesSettings({ settings, onSave }: FeaturesSettingsProps) {
  const [formData, setFormData] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      const data: Record<string, boolean> = {};
      FEATURES.forEach(feature => {
        data[feature.key] = settings[feature.key] !== undefined ? settings[feature.key] : true;
      });
      setFormData(data);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleToggle = (key: string) => {
    setFormData({ ...formData, [key]: !formData[key] });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Feature Toggles</h3>
        <p className="text-sm text-gray-600 mb-6">Enable or disable platform features. Changes take effect immediately.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.key}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{feature.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(feature.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData[feature.key] ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData[feature.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <span className={`text-xs font-medium ${formData[feature.key] ? 'text-green-600' : 'text-gray-500'}`}>
                  {formData[feature.key] ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg"
        >
          Save Feature Settings
        </button>
      </div>
    </form>
  );
}
