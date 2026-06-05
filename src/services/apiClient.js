import http, { API_BASE_URL } from './http';

export const apiClient = {
  getBootstrap: () => http.get('/api/bootstrap').then(res => res.data),
  login: (email, password) => http.post('/api/auth/login', { email, password }).then(res => res.data),
  me: () => http.get('/api/auth/me').then(res => res.data),
  createBooking: (payload) => http.post('/api/bookings', payload).then(res => res.data),
  getGrapherOrders: (status) => {
    const params = status && status !== 'all' ? { status } : {};
    return http.get('/api/bookings/my-orders', { params }).then(res => res.data);
  },
  getCustomerOrders: (customerId, status) => {
    const params = status && status !== 'all' ? { status } : {};
    return http.get(`/api/bookings/customer/${customerId}`, { params }).then(res => res.data);
  },
  register: (data) => http.post('/api/auth/register', data).then(res => res.data),
  updateProfile: (data) => http.put('/api/users/me', data).then(res => res.data),
  cancelBooking: (id, reason) => http.post(`/api/bookings/${id}/cancel`, { reason }).then(res => res.data),
  confirmBooking: (id) => http.post(`/api/bookings/${id}/confirm`).then(res => res.data),
  startBooking: (id) => http.post(`/api/bookings/${id}/start`).then(res => res.data),
  completeBooking: (id) => http.post(`/api/bookings/${id}/complete`).then(res => res.data),
  getBookingDetail: (id) => http.get(`/api/bookings/${id}/detail`).then(res => res.data),
  getGrapherProfile: (id) => http.get(`/api/graphers/${id}`).then(res => res.data),
  seedDefaultPackages: () => http.post('/api/graphers/me/seed-packages').then(res => res.data),
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('picmate_access_token');
    
    // We use fetch here to avoid any global Axios default headers (like Content-Type: application/json)
    // which might mess up the multipart/form-data boundary.
    const res = await fetch(`${API_BASE_URL}/api/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.url;
  },
};

export const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(price || 0)}đ`;
