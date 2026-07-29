import { useState, useEffect, useCallback } from 'react';
import {
    LayoutDashboard, Users, Camera, Package, DollarSign, Shield,
    Settings, LogOut, AlertTriangle, CheckCircle, XCircle,
    Eye, UserCheck, Search, BarChart3,
    Clock, Ban, RefreshCw, Bell, CreditCard, Globe,
    Star, MapPin, Calendar, MoreHorizontal,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { adminService } from '../../services/adminService';
import { formatPrice } from '../../data/data';

import AdminReconciliationTab from './AdminReconciliationTab';

import toast from 'react-hot-toast';
import './AdminDashboard.css';

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtNum(n) {
    if (n == null) return '—';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

function LoadingRow({ cols = 7 }) {
    return (
        <tr>
            <td colSpan={cols} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <Loader2 size={20} className="spin" style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8 }} />
                Đang tải dữ liệu...
            </td>
        </tr>
    );
}

function EmptyRow({ cols = 7, message = 'Không có dữ liệu' }) {
    return (
        <tr>
            <td colSpan={cols} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                {message}
            </td>
        </tr>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const [pendingPaymentCount, setPendingPaymentCount] = useState(0);

    const [userFilter, setUserFilter] = useState('all');
    const [userSearch, setUserSearch] = useState('');
    const [orderFilter, setOrderFilter] = useState('all');
    const [disputeFilter, setDisputeFilter] = useState('all');
    const { logout } = useAuth();
    const { data } = useAppData();
    const bookingStatuses = data?.bookingStatuses || [];

    // ── API state ──────────────────────────────────────────────────────────
    const [revenue, setRevenue] = useState(null);
    const [revenueLoading, setRevenueLoading] = useState(true);

    const [activities, setActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const [pendingGraphers, setPendingGraphers] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(false);

    const [activeGraphers, setActiveGraphers] = useState([]);
    const [graphersLoading, setGraphersLoading] = useState(false);

    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    const [disputes, setDisputes] = useState([]);
    const [disputesLoading, setDisputesLoading] = useState(false);

    const [settings, setSettings] = useState(null);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsSaving, setSettingsSaving] = useState(false);
    // Local form state cho settings
    const [settingsForm, setSettingsForm] = useState({
        platformFeePercent: 15,
        minWithdrawalAmount: 200000,
        momoEnabled: true,
        vnPayEnabled: true,
        zaloPayEnabled: false,
        emailNotifyNewBooking: true,
        emailNotifyDispute: true,
        maintenanceMode: false,
    });

    // ─── Fetch overview data on mount ──────────────────────────────────────
    useEffect(() => {
        adminService.getRevenue()
            .then(setRevenue)
            .catch(console.error)
            .finally(() => setRevenueLoading(false));

        adminService.getRecentActivities()
            .then(setActivities)
            .catch(console.error)
            .finally(() => setActivitiesLoading(false));
    }, []);

    // ─── Fetch tab-specific data on tab switch ─────────────────────────────
    useEffect(() => {
        if (activeTab === 'users') {
            setUsersLoading(true);
            adminService.getUsers(userSearch, userFilter === 'all' ? '' : userFilter)
                .then(setUsers)
                .catch(console.error)
                .finally(() => setUsersLoading(false));
        }
    }, [activeTab, userSearch, userFilter]);

    useEffect(() => {
        if (activeTab === 'photographers') {
            setPendingLoading(true);
            setGraphersLoading(true);

            adminService.getPendingGraphers()
                .then(setPendingGraphers)
                .catch(console.error)
                .finally(() => setPendingLoading(false));

            // Gọi admin endpoint riêng (có thêm isActive, kycStatus, totalBookings)
            adminService.getActiveGraphers()
                .then(setActiveGraphers)
                .catch(console.error)
                .finally(() => setGraphersLoading(false));
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'orders') {
            setBookingsLoading(true);
            adminService.getAllBookings(orderFilter === 'all' ? '' : orderFilter)
                .then(setBookings)
                .catch(console.error)
                .finally(() => setBookingsLoading(false));
        }
    }, [activeTab, orderFilter]);

    useEffect(() => {
        if (activeTab === 'disputes') {
            setDisputesLoading(true);
            adminService.getDisputes(disputeFilter === 'all' ? '' : disputeFilter)
                .then(setDisputes)
                .catch(console.error)
                .finally(() => setDisputesLoading(false));
        }
    }, [activeTab, disputeFilter]);

    useEffect(() => {
        if (activeTab === 'settings') {
            setSettingsLoading(true);
            adminService.getSystemSettings()
                .then(s => {
                    setSettings(s);
                    setSettingsForm({
                        platformFeePercent: s.platformFeePercent,
                        minWithdrawalAmount: s.minWithdrawalAmount,
                        momoEnabled: s.momoEnabled,
                        vnPayEnabled: s.vnPayEnabled,
                        zaloPayEnabled: s.zaloPayEnabled,
                        emailNotifyNewBooking: s.emailNotifyNewBooking,
                        emailNotifyDispute: s.emailNotifyDispute,
                        maintenanceMode: s.maintenanceMode,
                    });
                })
                .catch(console.error)
                .finally(() => setSettingsLoading(false));
        }
    }, [activeTab]);

    // ─── Modal States ────────────────────────────────────────────────────────
    const [viewUserModal, setViewUserModal] = useState(null);
    const [viewGrapherModal, setViewGrapherModal] = useState(null);
    const [viewBookingModal, setViewBookingModal] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // ─── Actions ───────────────────────────────────────────────────────────
    const handleViewUser = async (userId) => {
        setModalLoading(true);
        setViewUserModal({ id: userId }); // Open modal in loading state
        try {
            const data = await adminService.getUserDetail(userId);
            setViewUserModal(data);
        } catch (err) {
            toast.error('Lỗi lấy thông tin người dùng: ' + (err.message || 'Lỗi không xác định'));
            setViewUserModal(null);
        } finally {
            setModalLoading(false);
        }
    };

    const handleViewGrapher = async (grapherId) => {
        setModalLoading(true);
        setViewGrapherModal({ id: grapherId });
        try {
            const data = await adminService.getGrapherDetail(grapherId);
            setViewGrapherModal(data);
        } catch (err) {
            toast.error('Lỗi lấy thông tin grapher: ' + (err.message || 'Lỗi không xác định'));
            setViewGrapherModal(null);
        } finally {
            setModalLoading(false);
        }
    };

    const handleViewBooking = async (bookingId) => {
        setModalLoading(true);
        setViewBookingModal({ id: bookingId });
        try {
            const data = await adminService.getBookingDetail(bookingId);
            setViewBookingModal(data);
        } catch (err) {
            toast.error('Lỗi lấy thông tin đơn hàng: ' + (err.message || 'Lỗi không xác định'));
            setViewBookingModal(null);
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleUser = useCallback(async (userId) => {
        try {
            const updated = await adminService.toggleUserStatus(userId);
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            toast.success('Cập nhật trạng thái người dùng thành công!');
        } catch (err) {
            toast.error('Không thể cập nhật trạng thái: ' + (err.message || 'Lỗi không xác định'));
        }
    }, []);

    const handleToggleGrapher = useCallback(async (grapherProfileId) => {
        try {
            const updated = await adminService.toggleGrapherStatus(grapherProfileId);
            setActiveGraphers(prev => prev.map(g => g.id === updated.id ? updated : g));
            toast.success(updated.isActive ? 'Đã mở khóa tài khoản grapher!' : 'Đã khóa tài khoản grapher!');
        } catch (err) {
            toast.error('Không thể cập nhật trạng thái: ' + (err.message || 'Lỗi không xác định'));
        }
    }, []);

    const handleKyc = useCallback(async (grapherProfileId, approved) => {
        try {
            await adminService.approveGrapherKyc(grapherProfileId, approved);
            setPendingGraphers(prev => prev.filter(p => p.id !== grapherProfileId));
            // Reload revenue để cập nhật pendingKycCount
            adminService.getRevenue().then(setRevenue).catch(console.error);
            // Reload active graphers nếu duyệt thành công để hiển thị ngay trong danh sách
            if (approved) {
                adminService.getActiveGraphers().then(setActiveGraphers).catch(console.error);
            }
            toast.success(approved ? 'Đã duyệt KYC thành công!' : 'Đã từ chối KYC.');
        } catch (err) {
            toast.error('Không thể xử lý KYC: ' + (err.message || 'Lỗi không xác định'));
        }
    }, []);

    const handleResolveDispute = useCallback(async (disputeId, action) => {
        try {
            const updated = await adminService.resolveDispute(disputeId, action);
            setDisputes(prev => prev.map(d => d.id === updated.id ? updated : d));
            const actionLabels = { refund: 'Đã hoàn tiền thành công!', warning: 'Đã gửi cảnh báo!', resolved: 'Đã giải quyết tranh chấp!' };
            toast.success(actionLabels[action] || 'Xử lý thành công!');
        } catch (err) {
            toast.error('Không thể xử lý tranh chấp: ' + (err.message || 'Lỗi không xác định'));
        }
    }, []);

    const handleSaveSettings = useCallback(async () => {
        setSettingsSaving(true);
        try {
            const updated = await adminService.updateSystemSettings(settingsForm);
            setSettings(updated);
            toast.success('Lưu cài đặt hệ thống thành công!');
        } catch (err) {
            toast.error('Không thể lưu cài đặt: ' + (err.message || 'Lỗi không xác định'));
        } finally {
            setSettingsSaving(false);
        }
    }, [settingsForm]);

    // ─── Derived stats from API ────────────────────────────────────────────
    const adminStats = [
        {
            label: 'Tổng người dùng',
            value: revenueLoading ? '...' : fmtNum(revenue?.totalUsers),
            icon: <Users size={20} />,
            color: 'var(--primary)',
        },
        {
            label: 'Phone-Graphers',
            value: revenueLoading ? '...' : fmtNum(revenue?.totalGraphers),
            icon: <Camera size={20} />,
            color: 'var(--accent-coral)',
        },
        {
            label: 'Đơn hàng tháng',
            value: revenueLoading ? '...' : fmtNum(revenue?.bookingsThisMonth),
            icon: <Package size={20} />,
            color: 'var(--accent-green)',
        },
        {
            label: 'Doanh thu tháng',
            value: revenueLoading ? '...' : formatPrice(revenue?.revenueThisMonth ?? 0),
            icon: <DollarSign size={20} />,
            color: 'var(--accent-gold)',
        },
    ];

    // Dữ liệu biểu đồ từ API (12 tháng trong năm)
    const monthlyData = revenue?.monthlyRevenue ?? [];
    const maxRevenue = Math.max(...monthlyData.map(m => Number(m.grossRevenue)), 1);

    const pendingDisputesCount = disputes.filter(d => d.status === 'Pending').length;

    const getStatusBadge = (status) => {
        const map = {
            PendingPayment: { label: 'Chờ thanh toán', color: 'warning' },
            PendingConfirmation: { label: 'Chờ xác nhận', color: 'warning' },
            Confirmed: { label: 'Đã xác nhận', color: 'info' },
            InProgress: { label: 'Đang thực hiện', color: 'info' },
            Completed: { label: 'Hoàn thành', color: 'success' },
            Cancelled: { label: 'Đã huỷ', color: 'danger' },
        };
        // fallback về bookingStatuses từ bootstrap
        const s = bookingStatuses.find(b => b.key === status);
        const m = map[status];
        const label = m?.label || s?.label || status;
        const color = m?.color || s?.color || 'secondary';
        return <span className={`badge badge-${color}`}>{label}</span>;
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            urgent: { bg: 'rgba(255, 107, 107, 0.1)', color: 'var(--accent-coral)', label: '🔴 Khẩn cấp' },
            high: { bg: 'rgba(253, 203, 110, 0.15)', color: '#e17e00', label: '🟠 Cao' },
            medium: { bg: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary)', label: '🔵 Trung bình' },
        };
        const s = styles[priority];
        if (!s) return null;
        return <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
    };

    return (
        <>
        <div className="dashboard-page admin-dashboard">
            <div className="container">
                <div className="dashboard-layout">
                    {/* ===== SIDEBAR ===== */}
                    <aside className="dashboard-sidebar admin-sidebar">
                        <div className="dashboard-profile">
                            <div className="admin-avatar">
                                <Shield size={28} />
                            </div>
                            <h3>Admin Panel</h3>
                            <span className="badge badge-danger">🔐 Administrator</span>
                        </div>

                        <nav className="dashboard-nav">
                            {[
                                { key: 'overview', icon: <LayoutDashboard size={18} />, label: 'Tổng quan' },
                                { key: 'users', icon: <Users size={18} />, label: 'Người dùng' },
                                {
                                    key: 'photographers', icon: <Camera size={18} />, label: 'Phone-Graphers',
                                    badge: revenue?.pendingKycCount || pendingGraphers.length || null
                                },
                                { key: 'orders', icon: <Package size={18} />, label: 'Đơn hàng' },

                                { key: 'reconciliation', icon: <CreditCard size={18} />, label: 'Đối soát', badge: pendingPaymentCount || null },

                                { key: 'disputes', icon: <AlertTriangle size={18} />, label: 'Tranh chấp', badge: pendingDisputesCount || null },
                                { key: 'settings', icon: <Settings size={18} />, label: 'Cài đặt hệ thống' },
                            ].map(item => (
                                <button
                                    key={item.key}
                                    className={`dashboard-nav-item ${activeTab === item.key ? 'active' : ''}`}
                                    onClick={() => setActiveTab(item.key)}
                                    id={`admin-nav-${item.key}`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                    {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                                </button>
                            ))}
                            <button className="dashboard-nav-item dashboard-logout" onClick={logout}>
                                <LogOut size={18} /> <span>Đăng xuất</span>
                            </button>
                        </nav>
                    </aside>

                    {/* ===== CONTENT ===== */}
                    <div className="dashboard-content">

                        {/* ===== OVERVIEW TAB ===== */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Tổng quan hệ thống</h2>
                                    <div className="header-date">
                                        <Calendar size={16} />
                                        <span>{new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                <div className="stats-grid admin-stats">
                                    {adminStats.map((stat, i) => (
                                        <div key={i} className="stat-card">
                                            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                                                {stat.icon}
                                            </div>
                                            <div className="stat-content">
                                                <span className="stat-label">{stat.label}</span>
                                                <strong className="stat-value">{stat.value}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Revenue Summary Cards */}
                                {!revenueLoading && revenue && (
                                    <div className="admin-revenue-summary">
                                        <div className="revenue-card">
                                            <span className="revenue-label">Tổng doanh thu</span>
                                            <strong className="revenue-value">{formatPrice(revenue.grossRevenue)}</strong>
                                        </div>
                                        <div className="revenue-card">
                                            <span className="revenue-label">Phí platform</span>
                                            <strong className="revenue-value" style={{ color: 'var(--accent-green)' }}>
                                                {formatPrice(revenue.platformRevenue)}
                                            </strong>
                                        </div>
                                        <div className="revenue-card">
                                            <span className="revenue-label">Thanh toán cho Grapher</span>
                                            <strong className="revenue-value" style={{ color: 'var(--accent-coral)' }}>
                                                {formatPrice(revenue.grapherPayouts)}
                                            </strong>
                                        </div>
                                        <div className="revenue-card">
                                            <span className="revenue-label">Đơn hoàn thành</span>
                                            <strong className="revenue-value">{fmtNum(revenue.completedBookings)}</strong>
                                        </div>
                                    </div>
                                )}

                                {/* Revenue Chart – dữ liệu thực từ API */}
                                <div className="admin-chart-card" id="revenue-chart">
                                    <div className="chart-header">
                                        <div>
                                            <h3><BarChart3 size={18} /> Doanh thu {new Date().getFullYear()} (theo tháng)</h3>
                                            <p>Tổng doanh thu bao gồm phí platform</p>
                                        </div>
                                        <div className="chart-summary">
                                            <span className="chart-total">
                                                {revenueLoading ? '...' : formatPrice(revenue?.grossRevenue ?? 0)}
                                            </span>
                                        </div>
                                    </div>
                                    {revenueLoading ? (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                                        </div>
                                    ) : (
                                        <div className="chart-bars-container">
                                            {monthlyData.map((m) => {
                                                const pct = maxRevenue > 0
                                                    ? Math.max((Number(m.grossRevenue) / maxRevenue) * 100, m.bookingCount > 0 ? 4 : 0)
                                                    : 0;
                                                return (
                                                    <div key={m.month} className="chart-bar-wrapper">
                                                        <div className="chart-bar" style={{ height: `${pct}%` }}>
                                                            <span className="chart-bar-tooltip">
                                                                {formatPrice(m.grossRevenue)}<br />
                                                                {m.bookingCount} đơn
                                                            </span>
                                                        </div>
                                                        <span className="chart-bar-label">{m.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Activity Feed & Quick Actions */}
                                <div className="admin-overview-grid">
                                    <div className="activity-feed-card">
                                        <div className="card-header-row">
                                            <h3>📊 Hoạt động gần đây</h3>
                                            {activitiesLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                                        </div>
                                        <div className="activity-list">
                                            {activitiesLoading ? (
                                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                                </div>
                                            ) : activities.length === 0 ? (
                                                <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>Chưa có hoạt động nào</p>
                                            ) : activities.map(a => (
                                                <div key={a.id} className="activity-item">
                                                    <span className="activity-icon">{a.icon}</span>
                                                    <div className="activity-content">
                                                        <p>{a.text}</p>
                                                        <span className="activity-time"><Clock size={12} /> {a.time}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="quick-actions-card">
                                        <div className="card-header-row">
                                            <h3>⚡ Hành động nhanh</h3>
                                        </div>
                                        <div className="quick-actions-grid">
                                            <button className="quick-action-btn" onClick={() => setActiveTab('photographers')}>
                                                <div className="qa-icon" style={{ background: 'rgba(255, 107, 107, 0.1)', color: 'var(--accent-coral)' }}>
                                                    <UserCheck size={20} />
                                                </div>
                                                <span>Duyệt Phone-Grapher</span>
                                                <span className="qa-count">
                                                    {revenue?.pendingKycCount ?? pendingGraphers.length}
                                                </span>
                                            </button>
                                            <button className="quick-action-btn" onClick={() => setActiveTab('disputes')}>
                                                <div className="qa-icon" style={{ background: 'rgba(253, 203, 110, 0.15)', color: '#e17e00' }}>
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <span>Xử lý tranh chấp</span>
                                                <span className="qa-count">{pendingDisputesCount}</span>
                                            </button>
                                            <button className="quick-action-btn" onClick={() => setActiveTab('users')}>
                                                <div className="qa-icon" style={{ background: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary)' }}>
                                                    <Users size={20} />
                                                </div>
                                                <span>Quản lý người dùng</span>
                                                <span className="qa-count">{revenueLoading ? '...' : fmtNum(revenue?.totalUsers)}</span>
                                            </button>
                                            <button className="quick-action-btn" onClick={() => setActiveTab('settings')}>
                                                <div className="qa-icon" style={{ background: 'rgba(0, 184, 148, 0.1)', color: 'var(--accent-green)' }}>
                                                    <Settings size={20} />
                                                </div>
                                                <span>Cài đặt hệ thống</span>
                                                <span className="qa-count"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ===== USERS TAB ===== */}
                        {activeTab === 'users' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Quản lý người dùng</h2>
                                    <div className="admin-header-actions">
                                        <div className="admin-search">
                                            <Search size={16} />
                                            <input
                                                type="text"
                                                placeholder="Tìm theo tên hoặc email..."
                                                className="input"
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                id="admin-search-users"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-filter-row">
                                    {[
                                        { key: 'all', label: 'Tất cả' },
                                        { key: 'Customer', label: 'Khách hàng' },
                                        { key: 'Grapher', label: 'Phone-Grapher' },
                                    ].map(f => (
                                        <button
                                            key={f.key}
                                            className={`order-filter-tab ${userFilter === f.key ? 'active' : ''}`}
                                            onClick={() => setUserFilter(f.key)}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                    <span className="filter-count">
                                        {usersLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : `${users.length} người dùng`}
                                    </span>
                                </div>

                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Người dùng</th>
                                                <th>Email</th>
                                                <th>Loại</th>
                                                <th>Ngày tham gia</th>
                                                <th>Đơn hàng</th>
                                                <th>Trạng thái</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usersLoading ? (
                                                <LoadingRow cols={7} />
                                            ) : users.length === 0 ? (
                                                <EmptyRow cols={7} message="Không tìm thấy người dùng" />
                                            ) : users.map(u => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <div className="user-cell-avatar">{u.name.charAt(0)}</div>
                                                            <strong>{u.name}</strong>
                                                        </div>
                                                    </td>
                                                    <td className="td-email">{u.email}</td>
                                                    <td>
                                                        <span className={`badge ${u.role === 'Grapher' ? 'badge-info' : 'badge-success'}`}>
                                                            {u.role === 'Grapher' ? 'Phone-Grapher' : u.role}
                                                        </span>
                                                    </td>
                                                    <td className="td-date">{u.joinDate}</td>
                                                    <td className="td-num">{u.totalBookings}</td>
                                                    <td>
                                                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                            {u.isActive ? '✅ Hoạt động' : '🔒 Bị khóa'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="table-actions">
                                                            <button className="table-action-btn" title="Xem chi tiết" id={`view-user-${u.id}`} onClick={() => handleViewUser(u.id)}>
                                                                <Eye size={15} />
                                                            </button>
                                                            <button
                                                                className={`table-action-btn ${u.isActive ? 'action-danger' : 'action-success'}`}
                                                                title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                                                                id={`toggle-user-${u.id}`}
                                                                onClick={() => handleToggleUser(u.id)}
                                                            >
                                                                {u.isActive ? <Ban size={15} /> : <CheckCircle size={15} />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* ===== PHOTOGRAPHERS TAB ===== */}
                        {activeTab === 'photographers' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Quản lý Phone-Graphers</h2>
                                </div>

                                {/* Pending Queue */}
                                <div className="admin-section">
                                    <h3>
                                        ⏳ Hàng đợi duyệt
                                        {pendingLoading
                                            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', marginLeft: 8 }} />
                                            : ` (${pendingGraphers.length})`
                                        }
                                    </h3>
                                    {pendingLoading ? (
                                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                        </div>
                                    ) : pendingGraphers.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>
                                            ✅ Không có grapher nào đang chờ duyệt
                                        </p>
                                    ) : (
                                        <div className="pending-list">
                                            {pendingGraphers.map(p => (
                                                <div key={p.id} className="pending-card" id={`pending-${p.id}`}>
                                                    <div className="pending-info">
                                                        {p.avatar
                                                            ? <img src={p.avatar} alt={p.name} className="avatar" />
                                                            : <div className="user-cell-avatar">{p.name.charAt(0)}</div>
                                                        }
                                                        <div>
                                                            <strong>{p.name}</strong>
                                                            <span><MapPin size={12} /> {p.location || 'Chưa cập nhật'}</span>
                                                            <span><Calendar size={12} /> Đăng ký: {p.appliedDate}</span>
                                                        </div>
                                                    </div>
                                                    <div className="pending-detail">
                                                        <div className="pending-tags">
                                                            {(p.styles || []).map(s => <span key={s} className="tag tag-primary">{s}</span>)}
                                                        </div>
                                                        <span className="pending-portfolio">📷 {p.portfolioCount} ảnh portfolio</span>
                                                    </div>
                                                    <div className="pending-actions">
                                                        <button className="btn btn-primary btn-sm" id={`approve-${p.id}`}
                                                            onClick={() => handleKyc(p.id, true)}>
                                                            <CheckCircle size={14} /> Duyệt
                                                        </button>
                                                        <button className="btn btn-ghost btn-sm reject-btn" id={`reject-${p.id}`}
                                                            onClick={() => handleKyc(p.id, false)}>
                                                            <XCircle size={14} /> Từ chối
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Active Photographers */}
                                <div className="admin-section">
                                    <h3>
                                        ✅ Phone-Graphers đang hoạt động
                                        {graphersLoading
                                            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', marginLeft: 8 }} />
                                            : ` (${activeGraphers.length})`
                                        }
                                    </h3>
                                    <div className="admin-table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Phone-Grapher</th>
                                                    <th>Khu vực</th>
                                                    <th>Đánh giá</th>
                                                    <th>Đơn hàng</th>
                                                    <th>Trạng thái</th>
                                                    <th>Verified</th>
                                                    <th>Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {graphersLoading ? (
                                                    <LoadingRow cols={7} />
                                                ) : activeGraphers.length === 0 ? (
                                                    <EmptyRow cols={7} message="Không có grapher nào" />
                                                ) : activeGraphers.map(p => (
                                                    <tr key={p.id}>
                                                        <td>
                                                            <div className="user-cell">
                                                                {p.avatar
                                                                    ? <img src={p.avatar} alt={p.name} className="avatar" style={{ width: 32, height: 32 }} />
                                                                    : <div className="user-cell-avatar">{(p.name || '?').charAt(0)}</div>
                                                                }
                                                                <strong>{p.name}</strong>
                                                            </div>
                                                        </td>
                                                        <td className="td-location">{p.location}</td>
                                                        <td>
                                                            <div className="rating-cell">
                                                                <Star size={13} fill="var(--accent-gold)" color="var(--accent-gold)" />
                                                                <span>{p.rating}</span>
                                                                <span className="review-count">({p.reviewCount})</span>
                                                            </div>
                                                        </td>
                                                        <td className="td-num">{p.reviewCount}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <span className={`badge ${p.isOnline ? 'badge-success' : 'badge-warning'}`}>
                                                                    {p.isOnline ? '🟢 Online' : '⚫ Offline'}
                                                                </span>
                                                                <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                                    {p.isActive ? 'Hoạt động' : '🔒 Bị khóa'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {p.isVerified
                                                                ? <span className="badge badge-info">✅ Verified</span>
                                                                : <span className="badge badge-warning">⏳ Chưa</span>
                                                            }
                                                        </td>
                                                        <td>
                                                            <div className="table-actions">
                                                                <button className="table-action-btn" title="Xem chi tiết" onClick={() => handleViewGrapher(p.id)}>
                                                                    <Eye size={15} />
                                                                </button>
                                                                <button
                                                                    className={`table-action-btn ${p.isActive ? 'action-danger' : 'action-success'}`}
                                                                    title={p.isActive ? 'Tạm khóa' : 'Mở khóa'}
                                                                    onClick={() => handleToggleGrapher(p.id)}
                                                                >
                                                                    {p.isActive ? <Ban size={15} /> : <CheckCircle size={15} />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ===== ORDERS TAB ===== */}
                        {activeTab === 'orders' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Quản lý đơn hàng</h2>
                                    <div className="order-summary-badges">
                                        <span className="summary-badge">
                                            <Package size={14} /> Tổng: <strong>{bookingsLoading ? '...' : bookings.length}</strong>
                                        </span>
                                        <span className="summary-badge revenue">
                                            <DollarSign size={14} /> Doanh thu: <strong>
                                                {bookingsLoading ? '...' : formatPrice(bookings.reduce((s, b) => s + (b.total || 0), 0))}
                                            </strong>
                                        </span>
                                    </div>
                                </div>

                                <div className="admin-filter-row">
                                    {[
                                        { key: 'all', label: 'Tất cả' },
                                        { key: 'PendingPayment', label: 'Chờ thanh toán' },
                                        { key: 'PendingConfirmation', label: 'Chờ xác nhận' },
                                        { key: 'Confirmed', label: 'Đã xác nhận' },
                                        { key: 'Completed', label: 'Hoàn thành' },
                                        { key: 'Cancelled', label: 'Đã hủy' },
                                    ].map(f => (
                                        <button
                                            key={f.key}
                                            className={`order-filter-tab ${orderFilter === f.key ? 'active' : ''}`}
                                            onClick={() => setOrderFilter(f.key)}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Thợ chụp</th>
                                                <th>Dịch vụ</th>
                                                <th>Ngày</th>
                                                <th>Địa điểm</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookingsLoading ? (
                                                <LoadingRow cols={8} />
                                            ) : bookings.length === 0 ? (
                                                <EmptyRow cols={8} message="Không có đơn hàng nào" />
                                            ) : bookings.map(b => (
                                                <tr key={b.id}>
                                                    <td><code className="order-code">{b.id.substring(0, 8)}...</code></td>
                                                    <td>
                                                        <div className="user-cell">
                                                            {b.photographerAvatar
                                                                ? <img src={b.photographerAvatar} alt={b.photographerName} className="avatar" style={{ width: 28, height: 28 }} />
                                                                : <div className="user-cell-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{(b.photographerName || '?').charAt(0)}</div>
                                                            }
                                                            <span>{b.photographerName}</span>
                                                        </div>
                                                    </td>
                                                    <td>{b.service}</td>
                                                    <td className="td-date">{b.date}</td>
                                                    <td className="td-location">{b.location}</td>
                                                    <td><strong className="td-price">{formatPrice(b.total)}</strong></td>
                                                    <td>{getStatusBadge(b.status)}</td>
                                                    <td>
                                                        <div className="table-actions">
                                                            <button className="table-action-btn" title="Xem chi tiết" onClick={() => handleViewBooking(b.id)}>
                                                                <Eye size={15} />
                                                            </button>
                                                            <button className="table-action-btn" title="Thêm">
                                                                <MoreHorizontal size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* ===== DISPUTES TAB ===== */}
                        {activeTab === 'disputes' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Xử lý tranh chấp</h2>
                                    <div className="dispute-stats">
                                        <span className="summary-badge urgent">
                                            <AlertTriangle size={14} /> Đang chờ: <strong>{pendingDisputesCount}</strong>
                                        </span>
                                    </div>
                                </div>

                                <div className="admin-filter-row">
                                    {[
                                        { key: 'all', label: 'Tất cả' },
                                        { key: 'Pending', label: 'Chờ xử lý' },
                                        { key: 'Resolved', label: 'Đã giải quyết' },
                                        { key: 'Closed', label: 'Đã đóng' },
                                    ].map(f => (
                                        <button
                                            key={f.key}
                                            className={`order-filter-tab ${disputeFilter === f.key ? 'active' : ''}`}
                                            onClick={() => setDisputeFilter(f.key)}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                    <span className="filter-count">
                                        {disputesLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : `${disputes.length} tranh chấp`}
                                    </span>
                                </div>

                                {disputesLoading ? (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                                    </div>
                                ) : disputes.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>
                                        ✅ Không có tranh chấp nào cần xử lý
                                    </p>
                                ) : (
                                    <div className="disputes-list">
                                        {disputes.map(d => (
                                            <div key={d.id} className={`dispute-card priority-${d.priority?.toLowerCase()}`} id={`dispute-${d.id}`}>
                                                <div className="dispute-header">
                                                    <div className="dispute-id-row">
                                                        <code className="order-code">{d.id?.substring(0, 8)}...</code>
                                                        {getPriorityBadge(d.priority?.toLowerCase())}
                                                        {d.status === 'Resolved' || d.status === 'Closed'
                                                            ? <span className="badge badge-success">✅ Đã xử lý</span>
                                                            : <span className="badge badge-warning">⏳ Đang chờ</span>
                                                        }
                                                    </div>
                                                    <span className="dispute-date"><Calendar size={13} /> {d.createdAt}</span>
                                                </div>

                                                <div className="dispute-parties">
                                                    <div className="dispute-party">
                                                        {d.reporterAvatar
                                                            ? <img src={d.reporterAvatar} alt={d.reporterName} className="avatar" />
                                                            : <div className="user-cell-avatar">{(d.reporterName || '?').charAt(0)}</div>
                                                        }
                                                        <div>
                                                            <span className="party-role">Người báo cáo</span>
                                                            <strong>{d.reporterName}</strong>
                                                        </div>
                                                    </div>
                                                    <span className="dispute-vs">VS</span>
                                                    <div className="dispute-party">
                                                        {d.respondentAvatar
                                                            ? <img src={d.respondentAvatar} alt={d.respondentName} className="avatar" />
                                                            : <div className="user-cell-avatar">{(d.respondentName || '?').charAt(0)}</div>
                                                        }
                                                        <div>
                                                            <span className="party-role">Bị báo cáo</span>
                                                            <strong>{d.respondentName}</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="dispute-reason">
                                                    <p>📝 {d.reason}</p>
                                                    {d.adminNote && <p style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>💬 Admin: {d.adminNote}</p>}
                                                </div>

                                                <div className="dispute-footer">
                                                    <div className="dispute-amount">
                                                        <DollarSign size={14} /> Giá trị đơn: <strong>{formatPrice(d.bookingAmount)}</strong>
                                                    </div>
                                                    {d.status === 'Pending' && (
                                                        <div className="dispute-actions">
                                                            <button className="btn btn-ghost btn-sm" id={`dispute-refund-${d.id}`}
                                                                onClick={() => handleResolveDispute(d.id, 'refund')}>
                                                                <RefreshCw size={14} /> Hoàn tiền
                                                            </button>
                                                            <button className="btn btn-ghost btn-sm" id={`dispute-warn-${d.id}`}
                                                                onClick={() => handleResolveDispute(d.id, 'warning')}>
                                                                <AlertTriangle size={14} /> Cảnh báo
                                                            </button>
                                                            <button className="btn btn-primary btn-sm" id={`dispute-resolve-${d.id}`}
                                                                onClick={() => handleResolveDispute(d.id, 'resolved')}>
                                                                <CheckCircle size={14} /> Giải quyết
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}


                        {/* ===== RECONCILIATION TAB ===== */}
                        <AdminReconciliationTab
                            active={activeTab === 'reconciliation'}
                            onPendingCountChange={setPendingPaymentCount}
                        />


                        {/* ===== SETTINGS TAB ===== */}
                        {activeTab === 'settings' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Cài đặt hệ thống</h2>
                                    {settingsLoading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />}
                                </div>

                                <div className="settings-section">
                                    <h3><DollarSign size={18} /> Phí Platform</h3>
                                    <div className="settings-group">
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Phí dịch vụ (% trên mỗi đơn)</strong>
                                                <span>Phí commission thu từ Phone-Grapher</span>
                                            </div>
                                            <div className="setting-input-group">
                                                <input
                                                    type="number"
                                                    className="input setting-number-input"
                                                    value={settingsForm.platformFeePercent}
                                                    onChange={e => setSettingsForm(f => ({ ...f, platformFeePercent: Number(e.target.value) }))}
                                                    id="platform-fee"
                                                    min={0} max={100}
                                                />
                                                <span className="input-suffix">%</span>
                                            </div>
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Phí rút tiền tối thiểu</strong>
                                                <span>Số tiền tối thiểu để Phone-Grapher rút</span>
                                            </div>
                                            <div className="setting-input-group">
                                                <input
                                                    type="number"
                                                    className="input setting-number-input"
                                                    value={settingsForm.minWithdrawalAmount}
                                                    onChange={e => setSettingsForm(f => ({ ...f, minWithdrawalAmount: Number(e.target.value) }))}
                                                    id="min-withdrawal"
                                                    min={0}
                                                />
                                                <span className="input-suffix">đ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3><CreditCard size={18} /> Thanh toán</h3>
                                    <div className="settings-group">
                                        {[
                                            { key: 'momoEnabled', label: 'MoMo Payment', desc: 'Thanh toán qua ví MoMo' },
                                            { key: 'vnPayEnabled', label: 'VNPay', desc: 'Thanh toán qua VNPay (ATM, Visa, QR)' },
                                            { key: 'zaloPayEnabled', label: 'ZaloPay', desc: 'Thanh toán qua ZaloPay' },
                                        ].map(({ key, label, desc }) => (
                                            <div key={key} className="setting-item">
                                                <div className="setting-info">
                                                    <strong>{label}</strong>
                                                    <span>{desc}</span>
                                                </div>
                                                <button
                                                    className={`toggle-switch ${settingsForm[key] ? 'active' : ''}`}
                                                    id={`toggle-${key}`}
                                                    onClick={() => setSettingsForm(f => ({ ...f, [key]: !f[key] }))}
                                                    type="button"
                                                >
                                                    <span className="toggle-knob" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3><Bell size={18} /> Thông báo hệ thống</h3>
                                    <div className="settings-group">
                                        {[
                                            { key: 'emailNotifyNewBooking', label: 'Email thông báo đơn mới', desc: 'Gửi email cho admin khi có đơn hàng mới' },
                                            { key: 'emailNotifyDispute', label: 'Cảnh báo tranh chấp', desc: 'Thông báo ngay khi có tranh chấp mới' },
                                        ].map(({ key, label, desc }) => (
                                            <div key={key} className="setting-item">
                                                <div className="setting-info">
                                                    <strong>{label}</strong>
                                                    <span>{desc}</span>
                                                </div>
                                                <button
                                                    className={`toggle-switch ${settingsForm[key] ? 'active' : ''}`}
                                                    id={`toggle-${key}`}
                                                    onClick={() => setSettingsForm(f => ({ ...f, [key]: !f[key] }))}
                                                    type="button"
                                                >
                                                    <span className="toggle-knob" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3><Globe size={18} /> Bảo trì</h3>
                                    <div className="settings-group">
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Chế độ bảo trì</strong>
                                                <span>Tạm ngừng hoạt động hệ thống để bảo trì</span>
                                            </div>
                                            <button
                                                className={`toggle-switch ${settingsForm.maintenanceMode ? 'active' : ''}`}
                                                id="toggle-maintenance"
                                                onClick={() => setSettingsForm(f => ({ ...f, maintenanceMode: !f.maintenanceMode }))}
                                                type="button"
                                            >
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-save-row">
                                    <button
                                        className="btn btn-primary"
                                        id="admin-save-settings"
                                        onClick={handleSaveSettings}
                                        disabled={settingsSaving}
                                    >
                                        {settingsSaving
                                            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang lưu...</>
                                            : <><CheckCircle size={16} /> Lưu cài đặt</>
                                        }
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* ─── Modals ───────────────────────────────────────────────────────── */}
        {viewUserModal && (
            <div className="admin-modal-overlay" onClick={() => setViewUserModal(null)}>
                <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="admin-modal-header">
                        <h2>Chi tiết Người dùng</h2>
                        <button className="admin-modal-close" onClick={() => setViewUserModal(null)}><XCircle size={20} /></button>
                    </div>
                    <div className="admin-modal-body">
                        {modalLoading && !viewUserModal.email ? (
                            <div className="admin-modal-loading"><Loader2 className="spin" size={24} /> Đang tải...</div>
                        ) : (
                            <div className="admin-detail-grid">
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">ID:</span>
                                    <span className="admin-detail-value">{viewUserModal.id}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Họ tên:</span>
                                    <span className="admin-detail-value">{viewUserModal.name}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Email:</span>
                                    <span className="admin-detail-value">{viewUserModal.email}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Vai trò:</span>
                                    <span className="admin-detail-value">{viewUserModal.role}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Ngày tham gia:</span>
                                    <span className="admin-detail-value">{viewUserModal.joinDate}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Trạng thái:</span>
                                    <span className="admin-detail-value">
                                        <span className={`status-badge ${viewUserModal.isActive ? 'completed' : 'cancelled'}`}>
                                            {viewUserModal.isActive ? 'Hoạt động' : 'Bị khóa'}
                                        </span>
                                    </span>
                                </div>
                                <div className="admin-detail-full">
                                    <h3>Các đơn hàng gần đây ({viewUserModal.totalBookings} tổng)</h3>
                                    {viewUserModal.recentBookings?.length > 0 ? (
                                        <table className="admin-table mini-table">
                                            <thead>
                                                <tr>
                                                    <th>Grapher</th>
                                                    <th>Gói</th>
                                                    <th>Ngày</th>
                                                    <th>Giá</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewUserModal.recentBookings.map(b => (
                                                    <tr key={b.id}>
                                                        <td>{b.photographerName}</td>
                                                        <td>{b.service}</td>
                                                        <td>{b.date}</td>
                                                        <td>{formatPrice(b.total)}</td>
                                                        <td>{getStatusBadge(b.status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-muted">Chưa có đơn hàng nào.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {viewGrapherModal && (
            <div className="admin-modal-overlay" onClick={() => setViewGrapherModal(null)}>
                <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="admin-modal-header">
                        <h2>Chi tiết Grapher</h2>
                        <button className="admin-modal-close" onClick={() => setViewGrapherModal(null)}><XCircle size={20} /></button>
                    </div>
                    <div className="admin-modal-body">
                        {modalLoading && !viewGrapherModal.email && !viewGrapherModal.bio ? (
                            <div className="admin-modal-loading"><Loader2 className="spin" size={24} /> Đang tải...</div>
                        ) : (
                            <div className="admin-detail-grid">
                                <div className="admin-detail-full" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                    <img src={viewGrapherModal.avatar || 'https://via.placeholder.com/80'} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                                    <div>
                                        <h3 style={{ margin: '0 0 0.25rem 0' }}>{viewGrapherModal.name}</h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{viewGrapherModal.location}</p>
                                    </div>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Đánh giá:</span>
                                    <span className="admin-detail-value"><Star size={14} style={{ color: '#f59e0b', marginRight: 4 }} />{viewGrapherModal.rating} ({viewGrapherModal.reviewCount})</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Tổng doanh thu:</span>
                                    <span className="admin-detail-value" style={{ color: 'var(--success-color)', fontWeight: 600 }}>{formatPrice(viewGrapherModal.totalRevenue)}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Tổng đơn:</span>
                                    <span className="admin-detail-value">{viewGrapherModal.totalBookings}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Trạng thái KYC:</span>
                                    <span className="admin-detail-value">{viewGrapherModal.kycStatus}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Xác thực:</span>
                                    <span className="admin-detail-value">{viewGrapherModal.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Trạng thái TK:</span>
                                    <span className="admin-detail-value">
                                        <span className={`status-badge ${viewGrapherModal.isActive ? 'completed' : 'cancelled'}`}>
                                            {viewGrapherModal.isActive ? 'Hoạt động' : 'Bị khóa'}
                                        </span>
                                    </span>
                                </div>
                                <div className="admin-detail-full">
                                    <span className="admin-detail-label">Bio:</span>
                                    <p style={{ margin: '0.5rem 0', color: 'var(--text-color)' }}>{viewGrapherModal.bio || 'Chưa cập nhật'}</p>
                                </div>
                                <div className="admin-detail-full">
                                    <span className="admin-detail-label">Phong cách:</span>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                        {viewGrapherModal.styles?.map(s => <span key={s} className="style-tag">{s}</span>)}
                                    </div>
                                </div>
                                <div className="admin-detail-full">
                                    <h3>Gói dịch vụ</h3>
                                    {viewGrapherModal.packages?.length > 0 ? (
                                        <table className="admin-table mini-table">
                                            <thead>
                                                <tr>
                                                    <th>Tên gói</th>
                                                    <th>Thời lượng</th>
                                                    <th>Giá</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewGrapherModal.packages.map(p => (
                                                    <tr key={p.id}>
                                                        <td>{p.name}</td>
                                                        <td>{p.durationMinutes} phút</td>
                                                        <td>{formatPrice(p.price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-muted">Chưa có gói dịch vụ.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {viewBookingModal && (
            <div className="admin-modal-overlay" onClick={() => setViewBookingModal(null)}>
                <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="admin-modal-header">
                        <h2>Chi tiết Đơn hàng</h2>
                        <button className="admin-modal-close" onClick={() => setViewBookingModal(null)}><XCircle size={20} /></button>
                    </div>
                    <div className="admin-modal-body">
                        {modalLoading && !viewBookingModal.serviceName ? (
                            <div className="admin-modal-loading"><Loader2 className="spin" size={24} /> Đang tải...</div>
                        ) : (
                            <div className="admin-detail-grid">
                                <div className="admin-detail-full" style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Mã đơn: {viewBookingModal.id}</h3>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ngày tạo: {new Date(viewBookingModal.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Khách hàng:</span>
                                    <span className="admin-detail-value">{viewBookingModal.customerName}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Grapher:</span>
                                    <span className="admin-detail-value">{viewBookingModal.grapherName}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Dịch vụ:</span>
                                    <span className="admin-detail-value">{viewBookingModal.serviceName} ({viewBookingModal.durationMinutes} phút)</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Trạng thái đơn:</span>
                                    <span className="admin-detail-value">{getStatusBadge(viewBookingModal.status)}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Ngày chụp:</span>
                                    <span className="admin-detail-value">{new Date(viewBookingModal.scheduledAt).toLocaleString('vi-VN')}</span>
                                </div>
                                <div className="admin-detail-item">
                                    <span className="admin-detail-label">Địa điểm:</span>
                                    <span className="admin-detail-value">{viewBookingModal.location}</span>
                                </div>
                                <div className="admin-detail-full">
                                    <span className="admin-detail-label">Ghi chú:</span>
                                    <p style={{ margin: '0.5rem 0', color: 'var(--text-color)' }}>{viewBookingModal.note || 'Không có ghi chú'}</p>
                                </div>
                                {viewBookingModal.cancellationReason && (
                                    <div className="admin-detail-full" style={{ color: 'var(--danger-color)' }}>
                                        <span className="admin-detail-label">Lý do hủy:</span>
                                        <p style={{ margin: '0.5rem 0' }}>{viewBookingModal.cancellationReason}</p>
                                    </div>
                                )}
                                <div className="admin-detail-full" style={{ marginTop: '1rem' }}>
                                    <h3>Thông tin thanh toán</h3>
                                    {viewBookingModal.payment ? (
                                        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span>Cổng thanh toán:</span>
                                                <strong>{viewBookingModal.payment.provider}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span>Trạng thái thanh toán:</span>
                                                <strong>{viewBookingModal.payment.status}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span>Trạng thái Escrow:</span>
                                                <strong>{viewBookingModal.payment.escrowStatus}</strong>
                                            </div>
                                            <hr style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span>Tổng tiền:</span>
                                                <strong>{formatPrice(viewBookingModal.totalAmount)}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span>Phí nền tảng:</span>
                                                <strong style={{ color: 'var(--danger-color)' }}>- {formatPrice(viewBookingModal.platformFeeAmount)}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                                <span>Thực nhận (Grapher):</span>
                                                <strong style={{ color: 'var(--success-color)' }}>{formatPrice(viewBookingModal.grapherPayoutAmount)}</strong>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted">Chưa có thông tin thanh toán.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

