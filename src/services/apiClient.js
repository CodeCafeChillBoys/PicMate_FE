import http, { API_BASE_URL } from './http';

export const apiClient = {
  getBootstrap: () => http.get('/api/bootstrap').then(res => res.data),
  login: (email, password) => http.post('/api/auth/login', { email, password }).then(res => res.data),
  googleAuth: (credential, role) => http.post('/api/auth/google', { credential, role }).then(res => res.data),
  me: () => http.get('/api/auth/me').then(res => res.data),
  getNotifications: () => http.get('/api/notifications').then(res => res.data),
  getUnreadNotifCount: () => http.get('/api/notifications/unread-count').then(res => res.data),
  markNotifRead: (id) => http.put(`/api/notifications/${id}/read`).then(res => res.data),
  markAllNotifRead: () => http.put('/api/notifications/read-all').then(res => res.data),
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
  createReview: (bookingId, data) => http.post(`/api/bookings/${bookingId}/reviews`, data).then(res => res.data),
  createDispute: (data) => http.post('/api/disputes', data).then(res => res.data),
  confirmBooking: (id) => http.post(`/api/bookings/${id}/confirm`).then(res => res.data),
  startBooking: (id) => http.post(`/api/bookings/${id}/start`).then(res => res.data),
  completeBooking: (id) => http.post(`/api/bookings/${id}/complete`).then(res => res.data),
  getBookingDetail: (id) => http.get(`/api/bookings/${id}/detail`).then(res => res.data),
  getVietQrPayment: (bookingId) => http.get(`/api/payments/${bookingId}/vietqr`).then(res => res.data),
  claimTransferred: (bookingId) => http.post(`/api/payments/${bookingId}/claim-transferred`).then(res => res.data),
  getPaymentStatus: (bookingId) => http.get(`/api/payments/${bookingId}/status`).then(res => res.data),
  getGrapherProfile: (id) => http.get(`/api/graphers/${id}`).then(res => res.data),
  getMyGrapherProfile: () => http.get('/api/graphers/me').then(res => res.data),
  setOnlineStatus: (isOnline) => http.put('/api/graphers/me/online', { isOnline }).then(res => res.data),
  seedDefaultPackages: () => http.post('/api/graphers/me/seed-packages').then(res => res.data),
  getMyServices: () => http.get('/api/graphers/me/services').then(res => res.data),
  addService: (data) => http.post('/api/graphers/me/services', data).then(res => res.data),
  updateService: (id, data) => http.put(`/api/graphers/me/services/${id}`, data).then(res => res.data),
  deleteService: (id) => http.delete(`/api/graphers/me/services/${id}`).then(res => res.data),
  updateGrapherProfile: (data) => http.put('/api/graphers/me', data).then(res => res.data),
  toggleFavorite: (grapherId) => http.post(`/api/graphers/${grapherId}/favorite`).then(res => res.data),
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
    
    if (!res.ok) {
        let errorMsg = `Lỗi hệ thống khi tải ảnh lên. (HTTP ${res.status})`;
        try {
            const errData = await res.json();
            errorMsg = errData.Error || errData.title || errData.message || errorMsg;
        } catch {
            if (res.status === 401) errorMsg = 'Bạn chưa đăng nhập hoặc phiên đã hết hạn.';
            else if (res.status === 400) errorMsg = 'File ảnh không hợp lệ.';
            else if (res.status === 413) errorMsg = 'File ảnh quá lớn.';
        }
        throw new Error(errorMsg);
    }
    const data = await res.json();
    return data.url;
  },
};

export const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(price || 0)}đ`;
