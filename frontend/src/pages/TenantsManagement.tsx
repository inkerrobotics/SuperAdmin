import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { tenantsService, Tenant, TenantStats } from '../services/tenants.service';
import { useDebounce } from '../hooks/useDebounce';
import Toast from '../components/Toast';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';

export default function TenantsManagement() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    fetchData();
  }, [filters.status, filters.page, debouncedSearch]);

  const fetchData = async () => {
    try {
      const [tenantsData, statsData] = await Promise.all([
        tenantsService.getAllTenants({
          ...filters,
          search: debouncedSearch
        }),
        tenantsService.getTenantStats()
      ]);
      setTenants(tenantsData.tenants);
      setPagination(tenantsData.pagination);
      setStats(statsData);
    } catch (err: any) {
      if (err.message?.includes('Unauthorized')) {
        navigate('/login');
      }
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setNewStatus(tenant.status);
    setReason('');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedTenant || !reason.trim()) {
      setToast({ message: 'Please provide a reason for status change', type: 'warning' });
      return;
    }

    try {
      setUpdating(true);
      await tenantsService.updateTenantStatus(selectedTenant.id, newStatus, reason);
      setToast({ message: 'Tenant status updated successfully', type: 'success' });
      setShowStatusModal(false);
      setSelectedTenant(null);
      setReason('');
      fetchData();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedTenants.length === 0) {
      setToast({ message: 'Please select tenants to update', type: 'warning' });
      return;
    }

    const reason = prompt('Enter reason for bulk status change:');
    if (!reason) return;

    const status = prompt('Enter new status (ACTIVE, INACTIVE, PENDING, SUSPENDED):');
    if (!status) return;

    try {
      await tenantsService.bulkUpdateStatus(selectedTenants, status, reason);
      setToast({ message: `Updated ${selectedTenants.length} tenant(s) successfully`, type: 'success' });
      setSelectedTenants([]);
      fetchData();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const toggleTenantSelection = (tenantId: string) => {
    setSelectedTenants(prev =>
      prev.includes(tenantId)
        ? prev.filter(id => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'INACTIVE':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      case 'PENDING':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'SUSPENDED':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={10} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 animate-fadeIn">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text">Tenant Management</h1>
          <p className="text-gray-600 mt-1">Control tenant activation and manage client access</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <div className="interactive-card bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="interactive-card bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  {getStatusIcon('ACTIVE')}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="interactive-card bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  {getStatusIcon('PENDING')}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="interactive-card bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  {getStatusIcon('INACTIVE')}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
                </div>
              </div>
            </div>

            <div className="interactive-card bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  {getStatusIcon('SUSPENDED')}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Suspended</p>
                  <p className="text-3xl font-bold text-red-600">{stats.suspended}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {selectedTenants.length > 0 && (
              <button
                onClick={handleBulkStatusUpdate}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg btn-ripple"
              >
                Bulk Update ({selectedTenants.length})
              </button>
            )}
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTenants.length === tenants.length && tenants.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTenants(tenants.map(t => t.id));
                        } else {
                          setSelectedTenants([]);
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTenants.includes(tenant.id)}
                        onChange={() => toggleTenantSelection(tenant.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tenant.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tenant._count?.users || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusChange(tenant)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                        >
                          Change Status
                        </button>
                        <button
                          onClick={() => navigate(`/tenant/${tenant.id}`)}
                          className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total tenants)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Change Modal */}
        {showStatusModal && selectedTenant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-bounce-in">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">Change Tenant Status</h2>
                <p className="text-sm text-gray-600 mt-1">Update status for {selectedTenant.name}</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <div className={`px-4 py-2 rounded-lg ${getStatusColor(selectedTenant.status)}`}>
                    {selectedTenant.status}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for status change..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be logged in the audit trail</p>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-4 flex space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedTenant(null);
                    setReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || !reason.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 btn-ripple font-medium"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}
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
