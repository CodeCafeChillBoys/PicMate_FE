import http from './http';

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
  cancelBooking: (id, reason) => http.post(`/api/bookings/${id}/cancel`, { reason }).then(res => res.data),
  getBookingDetail: (id) => http.get(`/api/bookings/${id}/detail`).then(res => res.data),
};

export const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(price || 0)}đ`;
