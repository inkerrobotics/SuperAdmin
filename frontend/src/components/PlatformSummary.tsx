import { DashboardStats } from '../services/dashboard.service';

interface Props {
  stats: DashboardStats;
}

export default function PlatformSummary({ stats }: Props) {
  const activeRate = stats.totalTenants > 0 
    ? ((stats.activeTenants / stats.totalTenants) * 100).toFixed(1) 
    : 0;
  
  const avgUsersPerTenant = stats.totalTenants > 0 
    ? (stats.totalUsers / stats.totalTenants).toFixed(1) 
    : 0;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Platform Summary
        </h2>
        <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
          <span className="text-xs sm:text-sm font-medium">Real-time Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm opacity-90">Active Rate</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{activeRate}%</p>
          <p className="text-xs opacity-75 mt-1">of all tenants</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm opacity-90">Avg Users/Tenant</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{avgUsersPerTenant}</p>
          <p className="text-xs opacity-75 mt-1">users per tenant</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm opacity-90">Pending Review</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.pendingTenants}</p>
          <p className="text-xs opacity-75 mt-1">awaiting approval</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm opacity-90">Admin Users</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.totalAdminUsers}</p>
          <p className="text-xs opacity-75 mt-1">tenant administrators</p>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div>
            <p className="text-xl sm:text-2xl font-bold">{stats.totalTenants}</p>
            <p className="text-xs opacity-75">Total Tenants</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold">{stats.activeTenants}</p>
            <p className="text-xs opacity-75">Active</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold">{stats.inactiveTenants}</p>
            <p className="text-xs opacity-75">Inactive</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold">{stats.suspendedTenants || 0}</p>
            <p className="text-xs opacity-75">Suspended</p>
          </div>
        </div>
      </div>
    </div>
  );
}
