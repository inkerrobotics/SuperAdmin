import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { dataCleaningService } from '../services/data-cleaning.service';
import Toast from '../components/Toast';

export default function DataCleaning() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [cleaning, setCleaning] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsData = await dataCleaningService.getStats();
      setStats(statsData);
    } catch (err: any) {
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async (type: string) => {
    if (!confirm(`Are you sure you want to clean up ${type}? This action cannot be undone.`)) return;

    try {
      setCleaning(type);
      let result;
      switch (type) {
        case 'expired-sessions':
          result = await dataCleaningService.cleanupExpiredSessions();
          break;
        case 'old-logs':
          result = await dataCleaningService.cleanupOldLogs(90);
          break;
        case 'old-backups':
          result = await dataCleaningService.cleanupOldBackups(30);
          break;
        case 'orphaned-data':
          result = await dataCleaningService.cleanupOrphanedData();
          break;
        default:
          throw new Error('Invalid cleanup type');
      }
      setToast({ message: `Successfully cleaned up ${result.count} items`, type: 'success' });
      fetchStats();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setCleaning(null);
    }
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

  const cleanupTasks = [
    {
      id: 'expired-sessions',
      title: 'Expired Sessions',
      description: 'Remove expired user sessions from the database',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      count: stats?.expiredSessions || 0,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'old-logs',
      title: 'Old Activity Logs',
      description: 'Remove activity logs older than 90 days',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: stats?.oldLogs || 0,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'old-backups',
      title: 'Old Backups',
      description: 'Remove backups older than 30 days',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      count: stats?.oldBackups || 0,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'orphaned-data',
      title: 'Orphaned Data',
      description: 'Remove data without valid references',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      count: stats?.orphanedData || 0,
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <Layout>
      <div className="p-6 animate-fadeIn">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text">Data Cleaning</h1>
          <p className="text-gray-600 mt-1">Optimize database performance by removing unnecessary data</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Warning: Irreversible Action</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Data cleanup operations cannot be undone. Please ensure you have recent backups before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Cleanup Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cleanupTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden interactive-card"
            >
              <div className={`bg-gradient-to-r ${task.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    {task.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Items to Clean</p>
                    <p className="text-4xl font-bold">{task.count}</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold">{task.title}</h3>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">{task.description}</p>
                <button
                  onClick={() => handleCleanup(task.id)}
                  disabled={cleaning === task.id || task.count === 0}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 btn-ripple"
                >
                  {cleaning === task.id ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Cleaning...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>{task.count === 0 ? 'No Items to Clean' : 'Clean Up Now'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Database Stats */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">
                {((stats?.totalSize || 0) / 1024 / 1024).toFixed(2)} MB
              </div>
              <p className="text-sm text-gray-600">Total Database Size</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">
                {stats?.totalRecords || 0}
              </div>
              <p className="text-sm text-gray-600">Total Records</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">
                {stats?.cleanableRecords || 0}
              </div>
              <p className="text-sm text-gray-600">Cleanable Records</p>
            </div>
          </div>
        </div>
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
