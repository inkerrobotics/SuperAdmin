import { useState, useEffect } from 'react';

interface SecuritySettingsProps {
  settings: Record<string, any>;
  onSave: (settings: Record<string, any>) => void;
}

export default function SecuritySettings({ settings, onSave }: SecuritySettingsProps) {
  const [formData, setFormData] = useState({
    minPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    passwordExpiration: 0,
    passwordHistory: 0
  });

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setFormData({
        minPasswordLength: settings.minPasswordLength || 8,
        requireUppercase: settings.requireUppercase !== undefined ? settings.requireUppercase : true,
        requireLowercase: settings.requireLowercase !== undefined ? settings.requireLowercase : true,
        requireNumbers: settings.requireNumbers !== undefined ? settings.requireNumbers : true,
        requireSpecialChars: settings.requireSpecialChars || false,
        passwordExpiration: settings.passwordExpiration || 0,
        passwordHistory: settings.passwordHistory || 0
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getPasswordRequirements = () => {
    const reqs = [];
    reqs.push(`At least ${formData.minPasswordLength} characters`);
    if (formData.requireUppercase) reqs.push('Uppercase letter');
    if (formData.requireLowercase) reqs.push('Lowercase letter');
    if (formData.requireNumbers) reqs.push('Number');
    if (formData.requireSpecialChars) reqs.push('Special character');
    return reqs;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Password Requirements */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <span className="text-2xl">🔐</span>
              <span>Password Policy</span>
            </h3>
            
            <div className="space-y-4">
              {/* Password Length */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Password Length
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="6"
                    max="32"
                    value={formData.minPasswordLength}
                    onChange={(e) => setFormData({ ...formData, minPasswordLength: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-2xl font-bold text-indigo-600 w-12 text-center">
                    {formData.minPasswordLength}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Between 6 and 32 characters</p>
              </div>

              {/* Password Requirements Checkboxes */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-3">Required Characters</p>
                
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.requireUppercase}
                    onChange={(e) => setFormData({ ...formData, requireUppercase: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 flex items-center space-x-2">
                    <span>Uppercase letters</span>
                    <span className="text-xs text-gray-500">(A-Z)</span>
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.requireLowercase}
                    onChange={(e) => setFormData({ ...formData, requireLowercase: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 flex items-center space-x-2">
                    <span>Lowercase letters</span>
                    <span className="text-xs text-gray-500">(a-z)</span>
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.requireNumbers}
                    onChange={(e) => setFormData({ ...formData, requireNumbers: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 flex items-center space-x-2">
                    <span>Numbers</span>
                    <span className="text-xs text-gray-500">(0-9)</span>
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.requireSpecialChars}
                    onChange={(e) => setFormData({ ...formData, requireSpecialChars: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 flex items-center space-x-2">
                    <span>Special characters</span>
                    <span className="text-xs text-gray-500">(!@#$%^&*)</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Additional Settings & Preview */}
        <div className="space-y-6">
          {/* Password Expiration & History */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Expiration
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={formData.passwordExpiration}
                  onChange={(e) => setFormData({ ...formData, passwordExpiration: parseInt(e.target.value) })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">days</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">0 = never expires</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password History
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={formData.passwordHistory}
                  onChange={(e) => setFormData({ ...formData, passwordHistory: parseInt(e.target.value) })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">passwords</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Prevent reuse of last N passwords (0 = disabled)</p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-5">
            <div className="flex items-center space-x-2 mb-3">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <h4 className="text-sm font-bold text-indigo-900">Password Requirements Preview</h4>
            </div>
            <ul className="space-y-2">
              {getPasswordRequirements().map((req, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-indigo-800">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{req}</span>
                </li>
              ))}
              {formData.passwordExpiration > 0 && (
                <li className="flex items-center space-x-2 text-sm text-indigo-800">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Expires after {formData.passwordExpiration} days</span>
                </li>
              )}
              {formData.passwordHistory > 0 && (
                <li className="flex items-center space-x-2 text-sm text-indigo-800">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cannot reuse last {formData.passwordHistory} passwords</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg font-medium"
        >
          Save Security Settings
        </button>
      </div>
    </form>
  );
}
