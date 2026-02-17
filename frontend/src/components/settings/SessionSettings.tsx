import { useState, useEffect } from 'react';

interface SessionSettingsProps {
  settings: Record<string, any>;
  onSave: (settings: Record<string, any>) => void;
}

export default function SessionSettings({ settings, onSave }: SessionSettingsProps) {
  const [formData, setFormData] = useState({
    sessionTimeout: 60,
    idleTimeout: 30,
    rememberMeDuration: 30,
    allowConcurrentSessions: true,
    maxConcurrentSessions: 3
  });

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setFormData({
        sessionTimeout: settings.sessionTimeout || 60,
        idleTimeout: settings.idleTimeout || 30,
        rememberMeDuration: settings.rememberMeDuration || 30,
        allowConcurrentSessions: settings.allowConcurrentSessions !== undefined ? settings.allowConcurrentSessions : true,
        maxConcurrentSessions: settings.maxConcurrentSessions || 3
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Session Management</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="1440"
              value={formData.sessionTimeout}
              onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">15 minutes to 24 hours</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idle Timeout (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={formData.idleTimeout}
              onChange={(e) => setFormData({ ...formData, idleTimeout: parseInt(e.target.value) })}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-logout after inactivity</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remember Me Duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={formData.rememberMeDuration}
              onChange={(e) => setFormData({ ...formData, rememberMeDuration: parseInt(e.target.value) })}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.allowConcurrentSessions}
              onChange={(e) => setFormData({ ...formData, allowConcurrentSessions: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Allow concurrent sessions</span>
          </label>

          {formData.allowConcurrentSessions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Concurrent Sessions
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxConcurrentSessions}
                onChange={(e) => setFormData({ ...formData, maxConcurrentSessions: parseInt(e.target.value) })}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg"
        >
          Save Session Settings
        </button>
      </div>
    </form>
  );
}
