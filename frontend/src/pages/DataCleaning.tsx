import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { dataCleaningService } from '../services/data-cleaning.service';
import { campaignsService } from '../services/campaigns.service';

export default function DataCleaning() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<any[]>([]);
  const [invalidPhones, setInvalidPhones] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'duplicates' | 'emails' | 'phones'>('duplicates');

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      loadData();
    }
  }, [selectedCampaign]);

  const loadCampaigns = async () => {
    try {
      const data = await campaignsService.getAllCampaigns();
      setCampaigns(data);
      if (data.length > 0) {
        setSelectedCampaign(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const loadData = async () => {
    if (!selectedCampaign) return;
    setLoading(true);
    try {
      const [statsData, dupsData, emailsData, phonesData] = await Promise.all([
        dataCleaningService.getCleaningStats(selectedCampaign),
        dataCleaningService.detectDuplicates(selectedCampaign),
        dataCleaningService.validateEmails(selectedCampaign),
        dataCleaningService.validatePhoneNumbers(selectedCampaign)
      ]);
      setStats(statsData);
      setDuplicates(dupsData);
      setInvalidEmails(emailsData);
      setInvalidPhones(phonesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDuplicates = async () => {
    if (!selectedCampaign) return;
    setLoading(true);
    try {
      await dataCleaningService.markDuplicates(selectedCampaign);
      await loadData();
      alert('Duplicates marked successfully');
    } catch (error) {
      console.error('Failed to mark duplicates:', error);
      alert('Failed to mark duplicates');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Delete ${selectedItems.size} participants?`)) return;
    
    setLoading(true);
    try {
      await dataCleaningService.bulkDelete(Array.from(selectedItems));
      setSelectedItems(new Set());
      await loadData();
      alert('Participants deleted successfully');
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete participants');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Cleaning Tools</h1>
          <p className="text-gray-600 mt-1">Clean and validate participant data</p>
        </div>

        {/* Campaign Selector */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Campaign
          </label>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : stats ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Duplicates</div>
                <div className="text-2xl font-bold text-orange-600">{stats.duplicates}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Invalid Emails</div>
                <div className="text-2xl font-bold text-red-600">{stats.invalidEmails}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Invalid Phones</div>
                <div className="text-2xl font-bold text-red-600">{stats.invalidPhones}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Clean</div>
                <div className="text-2xl font-bold text-green-600">{stats.clean}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleMarkDuplicates}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Mark Duplicates
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedItems.size === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete Selected ({selectedItems.size})
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('duplicates')}
                    className={`px-6 py-3 font-medium ${
                      activeTab === 'duplicates'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Duplicates ({duplicates.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('emails')}
                    className={`px-6 py-3 font-medium ${
                      activeTab === 'emails'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Invalid Emails ({invalidEmails.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('phones')}
                    className={`px-6 py-3 font-medium ${
                      activeTab === 'phones'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Invalid Phones ({invalidPhones.length})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'duplicates' && (
                  <div className="space-y-4">
                    {duplicates.map((group, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="font-medium text-gray-900 mb-2">
                          Duplicate Group {idx + 1} ({group.count} entries)
                        </div>
                        <div className="space-y-2">
                          {group.participants.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-3 text-sm">
                              <input
                                type="checkbox"
                                checked={selectedItems.has(p.id)}
                                onChange={() => toggleSelection(p.id)}
                                className="rounded"
                              />
                              <span>{p.name}</span>
                              <span className="text-gray-500">{p.email || p.phone}</span>
                              {p.isDuplicate && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                  Marked
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'emails' && (
                  <div className="space-y-2">
                    {invalidEmails.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-red-600">{item.email}</div>
                        </div>
                        <span className="text-xs text-gray-500">{item.reason}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'phones' && (
                  <div className="space-y-2">
                    {invalidPhones.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-red-600">{item.phone}</div>
                        </div>
                        <span className="text-xs text-gray-500">{item.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
}
