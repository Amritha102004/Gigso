import axios from 'axios';

// Authorized Axios Instance capturing the JWT
const adminApi = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const adminService = {
  getUsersByRole: async (role: 'owner' | 'worker') => {
    // Assuming backend endpoint exists resolving array of user objects correctly
    const response = await adminApi.get(`/admin/users?role=${role}`);
    return response.data;
  },

  approveUser: async (userId: string) => {
    // Modify this if backend route differs
    const response = await adminApi.put(`/admin/users/${userId}/approve`);
    return response.data;
  },

  suspendUser: async (userId: string, isSuspended: boolean) => {
    // Send dynamic suspension state natively (assuming PUT standard)
    const response = await adminApi.put(`/admin/users/${userId}/suspend`, { suspend: isSuspended });
    return response.data;
  }
};

export default adminService;
