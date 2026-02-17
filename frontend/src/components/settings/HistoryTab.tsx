import { useState, useEffect } from 'react';
import { settingsService, SettingHistory } from '../../services/settings.service';

export default function HistoryTab() {
  const [history, setHistory] = useState<SettingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchHistory();
  }, [page, filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getHistory({
        ...filters,
        page,
        limit: 20
      });
      setHistory(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (historyId: string) => {
    if (!confirm('Restore this setting value?')) return;
    
    try {
      await settingsService.restoreSetting(historyId);
      alert('Setting restored successfully!');
      fetchHistory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Configuration History</h3>
        <p className="text-sm text-gray-600 mb-6">Track all setting changes and restore previous values</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="security">Security</option>
            <option value="session">Session</option>
            <option value="features">Features</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border">Date/Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border">Setting</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border">Old Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border">New Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border">Changed By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-900 border">{formatDate(item.changedAt)}</td>
                    <td className="px-4 py-3 text-xs text-gray-900 border">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        {item.setting.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-900 border font-medium">{item.setting.key}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 border">{item.oldValue}</td>
                    <td className="px-4 py-3 text-xs text-gray-900 border font-medium">{item.newValue}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 border">{item.changedByUser.email}</td>
                    <td className="px-4 py-3 text-xs border">
                      <button
                        onClick={() => handleRestore(item.id)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {history.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No history records found
            </div>
          )}
        </>
      )}
    </div>
  );
}
