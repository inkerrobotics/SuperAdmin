import axios from 'axios';

const API_URL = '/api';

axios.defaults.withCredentials = true;

export const analyticsService = {
  getCampaignAnalytics: async (campaignId: string) => {
    const response = await axios.get(`${API_URL}/analytics/campaign/${campaignId}`);
    return response.data;
  },

  compareCampaigns: async (tenantId?: string) => {
    const params = tenantId ? { tenantId } : {};
    const response = await axios.get(`${API_URL}/analytics/compare`, { params });
    return response.data;
  },

  getTenantAnalytics: async (tenantId: string) => {
    const response = await axios.get(`${API_URL}/analytics/tenant/${tenantId}`);
    return response.data;
  },

  exportCampaignReport: async (campaignId: string) => {
    const response = await axios.get(`${API_URL}/analytics/export/${campaignId}`);
    return response.data;
  }
};
