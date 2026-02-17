import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { settingsService, Setting } from '../services/settings.service';
import SecuritySettings from '../components/settings/SecuritySettings';
import SessionSettings from '../components/settings/SessionSettings';
import FeaturesSettings from '../components/settings/FeaturesSettings';
import HistoryTab from '../components/settings/HistoryTab';

type TabType = 'security' | 'session' | 'features' | 'history';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('security');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Settings state
  const [securitySettings, setSecuritySettings] = useState<Record<string, any>>({});
  const [sessionSettings, setSessionSettings] = useState<Record<string, any>>({});
  const [featuresSettings, setFeaturesSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const allSettings = await settingsService.getAllSettings();

      // Convert settings arrays to objects
      const security: Record<string, any> = {};
      const session: Record<string, any> = {};
      const features: Record<string, any> = {};

      if (allSettings.security) {
        allSettings.security.forEach((s: Setting) => {
          security[s.key] = s.value;
        });
      }

      if (allSettings.session) {
        allSettings.session.forEach((s: Setting) => {
          session[s.key] = s.value;
        });
      }

      if (allSettings.features) {
        allSettings.features.forEach((s: Setting) => {
          features[s.key] = s.value;
        });
      }

      setSecuritySettings(security);
      setSessionSettings(session);
      setFeaturesSettings(features);

      // Initialize defaults if empty (only if no settings exist at all)
      if (Object.keys(security).length === 0 && Object.keys(session).length === 0 && Object.keys(features).length === 0) {
        try {
          await settingsService.initializeDefaults();
          // Refetch after initialization
          setTimeout(() => fetchData(), 1000);
        } catch (initErr) {
          console.log('Settings may already be initialized:', initErr);
        }
      }
    } catch (err: any) {
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (category: string, settings: Record<string, any>) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await settingsService.updateSettings(category, settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'security' as TabType, name: 'Security', icon: '🔒', color: 'from-red-500 to-pink-500' },
    { id: 'session' as TabType, name: 'Sessions', icon: '⏱️', color: 'from-blue-500 to-cyan-500' },
    { id: 'features' as TabType, name: 'Features', icon: '🎛️', color: 'from-green-500 to-emerald-500' },
    { id: 'history' as TabType, name: 'History', icon: '📜', color: 'from-purple-500 to-indigo-500' }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading settings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600 mt-1">Manage global platform configurations and policies</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md animate-slideDown flex items-center space-x-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-md animate-slideDown flex items-center space-x-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'text-indigo-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-2xl transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.name}</span>
                  {activeTab === tab.id && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.color} animate-slideIn`}></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 min-h-[500px]">
            {saving && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">Saving changes...</p>
                </div>
              </div>
            )}

            <div className="animate-fadeIn">
              {activeTab === 'security' && (
                <SecuritySettings
                  settings={securitySettings}
                  onSave={(settings) => handleSaveSettings('security', settings)}
                />
              )}

              {activeTab === 'session' && (
                <SessionSettings
                  settings={sessionSettings}
                  onSave={(settings) => handleSaveSettings('session', settings)}
                />
              )}

              {activeTab === 'features' && (
                <FeaturesSettings
                  settings={featuresSettings}
                  onSave={(settings) => handleSaveSettings('features', settings)}
                />
              )}

              {activeTab === 'history' && <HistoryTab />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
