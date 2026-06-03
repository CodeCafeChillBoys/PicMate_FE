export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5274';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.message || 'API request failed');
  }

  return data;
}

export const apiClient = {
  getBootstrap: () => request('/api/bootstrap'),
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  createBooking: (payload) => request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};

export const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(price || 0)}đ`;
