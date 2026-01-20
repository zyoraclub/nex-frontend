import api from './api';

export const organizationAPI = {
  getMyOrganization: () => api.get('/organization/me'),
  
  updateMyOrganization: (data: {
    mobile?: string;
    category?: string;
    domain?: string;
    country?: string;
    website?: string;
    linkedin?: string;
  }) => api.put('/organization/me', data),
};
