/**
 * adminService.js
 * Các hàm gọi API dành riêng cho Admin Dashboard.
 * Tất cả endpoints đều yêu cầu token JWT với role "Admin".
 */
import http from './http';

export const adminService = {
  // ── Revenue & Stats ────────────────────────────────────────────────────────
  /**
   * Lấy tổng quan doanh thu + thống kê hệ thống.
   * @returns {Promise<RevenueSummaryResponse>}
   */
  getRevenue: () =>
    http.get('/api/admin/revenue').then((res) => res.data),

  // ── Users ──────────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách người dùng (có filter + search).
   * @param {string} [search] - tìm theo tên hoặc email
   * @param {string} [role]   - 'Customer' | 'Grapher' | 'Admin' | 'all'
   * @returns {Promise<AdminUserResponse[]>}
   */
  getUsers: (search = '', role = 'all') => {
    const params = {};
    if (search) params.search = search;
    if (role && role !== 'all') params.role = role;
    return http.get('/api/admin/users', { params }).then((res) => res.data);
  },

  /**
   * Khóa / mở khóa tài khoản người dùng.
   * @param {string} userId - GUID của user
   * @returns {Promise<AdminUserResponse>}
   */
  toggleUserStatus: (userId) =>
    http.put(`/api/admin/users/${userId}/toggle-status`).then((res) => res.data),

  // ── Photographers (Graphers) ───────────────────────────────────────────────
  /**
   * Lấy danh sách graphers đang chờ duyệt KYC.
   * @returns {Promise<AdminPendingGrapherResponse[]>}
   */
  getPendingGraphers: () =>
    http.get('/api/admin/graphers/pending').then((res) => res.data),

  /**
   * Duyệt hoặc từ chối KYC của một grapher.
   * @param {string} grapherProfileId - GUID của grapher profile
   * @param {boolean} approved - true = duyệt, false = từ chối
   * @returns {Promise<void>}
   */
  approveGrapherKyc: (grapherProfileId, approved) =>
    http
      .post(`/api/admin/graphers/${grapherProfileId}/kyc?approved=${approved}`)
      .then((res) => res.data),

  /**
   * Lấy tất cả graphers đang hoạt động (đã verified) từ API.
   * @returns {Promise<GrapherSummaryResponse[]>}
   */
  getActiveGraphers: () =>
    http.get('/api/graphers').then((res) => res.data),

  // ── Bookings ───────────────────────────────────────────────────────────────
  /**
   * Lấy tất cả đơn hàng trong hệ thống (admin view).
   * @param {string} [status] - 'PendingPayment' | 'Confirmed' | 'Completed' | 'Cancelled' | 'all'
   * @returns {Promise<AdminBookingResponse[]>}
   */
  getAllBookings: (status = 'all') => {
    const params = {};
    if (status && status !== 'all') params.status = status;
    return http.get('/api/admin/bookings', { params }).then((res) => res.data);
  },

  // ── Activities ─────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách hoạt động gần đây trong hệ thống.
   * @returns {Promise<AdminActivityResponse[]>}
   */
  getRecentActivities: () =>
    http.get('/api/admin/activities').then((res) => res.data),
};
