import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

axios.defaults.withCredentials = true;

export const dataCleaningService = {
  detectDuplicates: async (campaignId: string) => {
    const response = await axios.get(`${API_URL}/data-cleaning/duplicates/${campaignId}`);
    return response.data;
  },

  markDuplicates: async (campaignId: string) => {
    const response = await axios.post(`${API_URL}/data-cleaning/mark-duplicates/${campaignId}`);
    return response.data;
  },

  mergeParticipants: async (keepId: string, removeIds: string[]) => {
    const response = await axios.post(`${API_URL}/data-cleaning/merge`, { keepId, removeIds });
    return response.data;
  },

  validatePhoneNumbers: async (campaignId: string) => {
    const response = await axios.get(`${API_URL}/data-cleaning/validate-phones/${campaignId}`);
    return response.data;
  },

  validateEmails: async (campaignId: string) => {
    const response = await axios.get(`${API_URL}/data-cleaning/validate-emails/${campaignId}`);
    return response.data;
  },

  bulkDelete: async (participantIds: string[]) => {
    const response = await axios.post(`${API_URL}/data-cleaning/bulk-delete`, { participantIds });
    return response.data;
  },

  getCleaningStats: async (campaignId: string) => {
    const response = await axios.get(`${API_URL}/data-cleaning/stats/${campaignId}`);
    return response.data;
  }
};
