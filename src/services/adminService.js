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
   * Lấy danh sách graphers đã được duyệt (admin view, bao gồm trạng thái khóa).
   * @returns {Promise<AdminActiveGrapherResponse[]>}
   */
  getActiveGraphers: () =>
    http.get('/api/admin/graphers/active').then((res) => res.data),

  /**
   * Khóa hoặc mở khóa tài khoản của một grapher.
   * @param {string} grapherProfileId - GUID của grapher profile
   * @returns {Promise<AdminActiveGrapherResponse>}
   */
  toggleGrapherStatus: (grapherProfileId) =>
    http
      .put(`/api/admin/graphers/${grapherProfileId}/toggle-status`)
      .then((res) => res.data),

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

  // ── Disputes ───────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách tranh chấp.
   * @param {string} [status] - 'Pending' | 'Resolved' | 'Closed' | 'all'
   * @returns {Promise<AdminDisputeResponse[]>}
   */
  getDisputes: (status = 'all') => {
    const params = {};
    if (status && status !== 'all') params.status = status;
    return http.get('/api/admin/disputes', { params }).then((res) => res.data);
  },

  /**
   * Giải quyết một tranh chấp.
   * @param {string} disputeId - GUID của dispute
   * @param {string} action - 'refund' | 'warning' | 'resolved'
   * @param {string} [adminNote] - ghi chú của admin
   * @returns {Promise<AdminDisputeResponse>}
   */
  resolveDispute: (disputeId, action, adminNote = '') =>
    http
      .post(`/api/admin/disputes/${disputeId}/resolve`, { action, adminNote })
      .then((res) => res.data),

  // ── System Settings ────────────────────────────────────────────────────────
  /**
   * Lấy cài đặt hệ thống hiện tại.
   * @returns {Promise<SystemSettingsResponse>}
   */
  getSystemSettings: () =>
    http.get('/api/admin/settings').then((res) => res.data),

  /**
   * Cập nhật cài đặt hệ thống.
   * @param {object} data - SystemSettings object
   * @returns {Promise<SystemSettingsResponse>}
   */
  updateSystemSettings: (data) =>
    http.put('/api/admin/settings', data).then((res) => res.data),

  // ── Detail Views ─────────────────────────────────────────────────────────
  /**
   * Xem chi tiết User
   */
  getUserDetail: (userId) =>
    http.get(`/api/admin/users/${userId}`).then((res) => res.data),

  /**
   * Xem chi tiết Grapher
   */
  getGrapherDetail: (grapherProfileId) =>
    http.get(`/api/admin/graphers/${grapherProfileId}`).then((res) => res.data),

  /**
   * Xem chi tiết Booking
   */
  getBookingDetail: (bookingId) =>
    http.get(`/api/admin/bookings/${bookingId}`).then((res) => res.data),
};
