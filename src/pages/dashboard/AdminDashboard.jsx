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
import { formatPrice, avatarFallback } from '../../data/data';

import AdminReconciliationTab from './AdminReconciliationTab';
import AdminOverviewTab from './overview/AdminOverviewTab';
import AdminOrdersTab from './orders/AdminOrdersTab';
import AdminPayoutTab from './AdminPayoutTab';

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

    const [applicationDetail, setApplicationDetail] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);

    // Danh sách đơn hàng do AdminOrdersTab tự tải và tự lọc.

    const [disputes, setDisputes] = useState([]);
    const [disputesLoading, setDisputesLoading] = useState(false);
    
    // Tranh chấp nâng cao & AI
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [disputeChatLog, setDisputeChatLog] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [refundPercent, setRefundPercent] = useState(50);
    const [disputeAction, setDisputeAction] = useState('resolved');
    const [disputeAdminNote, setDisputeAdminNote] = useState('');
    const [viewEvidenceImage, setViewEvidenceImage] = useState(null);

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

        // Fetch counts for sidebar badges and landing quick actions
        adminService.getPendingPayments()
            .then(list => setPendingPaymentCount(list.length))
            .catch(console.error);

        adminService.getDisputes('Pending')
            .then(setDisputes)
            .catch(console.error);
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

    const handleViewApplication = useCallback(async (grapherProfileId) => {
        setDetailLoading(true);
        console.log("Admin: Đang lấy chi tiết hồ sơ xét duyệt cho grapherProfileId:", grapherProfileId);
        try {
            const detail = await adminService.getApplicationDetail(grapherProfileId);
            console.log("Admin: Lấy chi tiết hồ sơ thành công. Data:", detail);
            setApplicationDetail(detail);
            setShowDetailModal(true);
        } catch (err) {
            console.error("Admin: Lỗi lấy chi tiết hồ sơ xét duyệt:", err);
            if (err.response) {
                console.log("Admin: Chi tiết error response body từ server:", err.response.data);
            }
            toast.error('Không thể tải chi tiết hồ sơ: ' + (err.message || 'Lỗi'));
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const handleRejectClick = useCallback((grapherProfileId) => {
        setRejectingId(grapherProfileId);
        setRejectReason('');
        setShowRejectDialog(true);
    }, []);

    const handleConfirmReject = useCallback(async () => {
        if (!rejectingId) return;
        try {
            await adminService.approveGrapherKyc(rejectingId, false, rejectReason || 'Không đạt yêu cầu');
            setPendingGraphers(prev => prev.filter(p => p.id !== rejectingId));
            adminService.getRevenue().then(setRevenue).catch(console.error);
            setShowRejectDialog(false);
            setRejectingId(null);
            setRejectReason('');
            toast.success('Đã từ chối hồ sơ.');
        } catch (err) {
            toast.error('Không thể từ chối: ' + (err.message || 'Lỗi'));
        }
    }, [rejectingId, rejectReason]);

    const handleKyc = useCallback(async (grapherProfileId, approved) => {
        try {
            await adminService.approveGrapherKyc(grapherProfileId, approved);
            setPendingGraphers(prev => prev.filter(p => p.id !== grapherProfileId));
            adminService.getRevenue().then(setRevenue).catch(console.error);
            if (approved) {
                adminService.getActiveGraphers().then(setActiveGraphers).catch(console.error);
            }
            toast.success(approved ? 'Đã duyệt hồ sơ thành công!' : 'Đã từ chối hồ sơ.');
            if (showDetailModal) {
                setShowDetailModal(false);
                setApplicationDetail(null);
            }
        } catch (err) {
            toast.error('Không thể xử lý: ' + (err.message || 'Lỗi không xác định'));
        }
    }, [showDetailModal]);

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

    const handleOpenDisputeWorkspace = useCallback(async (dispute) => {
        setSelectedDispute(dispute);
        setDisputeChatLog([]);
        setChatLoading(true);
        setAiAnalysis(null);
        setAiLoading(false);
        setRefundPercent(50);
        setDisputeAction('resolved');
        setDisputeAdminNote('');
        
        try {
            const chatLog = await adminService.getDisputeChatLog(dispute.id);
            setDisputeChatLog(chatLog);
        } catch (err) {
            console.error('Lỗi khi tải lịch sử chat:', err);
            toast.error('Không thể tải lịch sử cuộc trò chuyện.');
        } finally {
            setChatLoading(false);
        }
    }, []);

    const handleRunDisputeAi = useCallback(async (disputeId) => {
        setAiLoading(true);
        setAiAnalysis(null);
        try {
            const analysis = await adminService.getDisputeAiAnalysis(disputeId);
            setAiAnalysis(analysis);
            toast.success('Đã hoàn thành phân tích tranh chấp bằng AI!');
        } catch (err) {
            console.error('Lỗi phân tích AI:', err);
            toast.error('Không thể chạy phân tích AI: ' + (err.message || 'Lỗi'));
        } finally {
            setAiLoading(false);
        }
    }, []);

    const handleConfirmResolveDispute = useCallback(async () => {
        if (!selectedDispute) return;
        try {
            const updated = await adminService.resolveDispute(
                selectedDispute.id,
                disputeAction,
                disputeAdminNote || `Admin giải quyết tranh chấp: ${disputeAction}`,
                disputeAction === 'split' ? refundPercent : null
            );
            
            // Xóa hoặc cập nhật đơn trong danh sách
            setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id));
            adminService.getRevenue().then(setRevenue).catch(console.error);
            
            toast.success('Giải quyết tranh chấp thành công!');
            setSelectedDispute(null);
        } catch (err) {
            toast.error('Không thể hoàn tất xử lý: ' + (err.message || 'Lỗi'));
        }
    }, [selectedDispute, disputeAction, disputeAdminNote, refundPercent]);

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

    // Các chỉ số tổng quan và biểu đồ doanh thu đã chuyển sang AdminOverviewTab,
    // lấy từ endpoint /api/admin/analytics.

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
                                { key: 'payouts', icon: <CreditCard size={18} />, label: 'Rút tiền' },

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
                            <AdminOverviewTab
                                active
                                activities={activities}
                                activitiesLoading={activitiesLoading}
                                quickActions={(
                                    <div className="quick-actions-card admin-overview-quick">
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
                                )}
                            />
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
                                                        <img src={p.avatar || avatarFallback(p.name)} alt={p.name} className="avatar" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback(p.name); }} />
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
                                                        <button className="btn btn-ghost btn-sm" id={`detail-${p.id}`}
                                                            onClick={() => handleViewApplication(p.id)}>
                                                            <Eye size={14} /> Xem chi tiết
                                                        </button>
                                                        <button className="btn btn-primary btn-sm" id={`approve-${p.id}`}
                                                            onClick={() => handleKyc(p.id, true)}>
                                                            <CheckCircle size={14} /> Duyệt
                                                        </button>
                                                        <button className="btn btn-ghost btn-sm reject-btn" id={`reject-${p.id}`}
                                                            onClick={() => handleRejectClick(p.id)}>
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
                                                                <img src={p.avatar || avatarFallback(p.name)} alt={p.name} className="avatar" style={{ width: 32, height: 32 }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback(p.name); }} />
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
                                                        <td className="td-num">{p.totalBookings}</td>
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
                            <AdminOrdersTab
                                active
                                onViewDetail={handleViewBooking}
                            />
                        )}

                        {/* ===== DISPUTES TAB ===== */}
                        {activeTab === 'disputes' && (
                            selectedDispute ? (
                                <div className="dispute-workspace container fadeInUp">
                                    {/* Workspace Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedDispute(null)}>
                                            ⬅ Quay lại danh sách
                                        </button>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <code style={{ fontSize: '1rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                                Booking #{selectedDispute.bookingId.substring(0, 8)}
                                            </code>
                                            {getPriorityBadge(selectedDispute.priority?.toLowerCase())}
                                        </div>
                                    </div>

                                    {/* Split Layout */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        
                                        {/* Left Panel: Information & AI */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            <div className="admin-section" style={{ margin: 0, padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                                <h3 style={{ margin: '0 0 1rem 0' }}>📄 Thông tin vụ việc</h3>
                                                
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>Giá trị Booking:</span>
                                                    <strong>{formatPrice(selectedDispute.bookingAmount)}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>Ngày tạo khiếu nại:</span>
                                                    <span>{selectedDispute.createdAt}</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>👤 Người báo cáo: {selectedDispute.reporterName}</div>
                                                    <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{selectedDispute.reason}</div>
                                                     {selectedDispute.evidenceImageUrls && selectedDispute.evidenceImageUrls.length > 0 && (
                                                         <div style={{ marginTop: '1rem' }}>
                                                             <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                                                 📷 Ảnh bằng chứng:
                                                             </div>
                                                             <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                 {selectedDispute.evidenceImageUrls.map((url, idx) => (
                                                                     <div 
                                                                         key={idx} 
                                                                         style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                                                                         onClick={() => setViewEvidenceImage(url)}
                                                                     >
                                                                         <img src={url} alt={`Bằng chứng ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                     </div>
                                                                 ))}
                                                             </div>
                                                         </div>
                                                     )}
                                                </div>
                                            </div>

                                            {/* AI Gemini Assistant Panel */}
                                            <div className="admin-section" style={{ margin: 0, padding: '1.25rem', background: 'linear-gradient(135deg, rgba(108,92,231,0.05) 0%, rgba(162,155,254,0.05) 100%)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(108, 92, 231, 0.2)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                                        🤖 Trợ lý Phân giải AI
                                                    </h3>
                                                    <button className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleRunDisputeAi(selectedDispute.id)} disabled={aiLoading}>
                                                        {aiLoading ? <Loader2 size={12} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Chạy AI Phân tích'}
                                                    </button>
                                                </div>

                                                {aiLoading && (
                                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Loader2 size={24} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                                                        <p style={{ fontSize: '0.85rem' }}>Gemini đang phân tích nội dung cuộc trò chuyện...</p>
                                                    </div>
                                                )}

                                                {!aiLoading && !aiAnalysis && (
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, textAlign: 'center', padding: '1rem 0' }}>
                                                        Bấm nút "Chạy AI Phân tích" phía trên để yêu cầu AI đọc lịch sử trò chuyện và đưa ra đề xuất.
                                                    </p>
                                                )}

                                                {aiAnalysis && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                                                        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                                                            <strong>📝 Tóm tắt chính:</strong>
                                                            <p style={{ margin: '0.25rem 0 0 0', lineHeight: 1.4, color: 'var(--text-color)' }}>{aiAnalysis.summary}</p>
                                                        </div>
                                                        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                                                            <strong>🗣️ Nhận diện thái độ:</strong>
                                                            <p style={{ margin: '0.25rem 0 0 0', lineHeight: 1.4, color: 'var(--text-color)' }}>{aiAnalysis.chatSentiment}</p>
                                                        </div>
                                                        <div style={{ padding: '0.75rem', background: 'rgba(108, 92, 231, 0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)' }}>
                                                            <strong style={{ color: 'var(--primary)' }}>💡 Đề xuất của AI:</strong>
                                                            <p style={{ margin: '0.25rem 0 0 0', lineHeight: 1.4, fontWeight: '500' }}>{aiAnalysis.aiRecommendation}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Panel: Chat Log & Decision */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            
                                            {/* Simulated Chat Log Viewer */}
                                            <div className="admin-section" style={{ margin: 0, padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', height: '360px' }}>
                                                <h3 style={{ margin: '0 0 0.75rem 0' }}>💬 Lịch sử hội thoại</h3>
                                                
                                                {chatLoading ? (
                                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Loader2 size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                                                    </div>
                                                ) : disputeChatLog.length === 0 ? (
                                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                        Không tìm thấy lịch sử cuộc hội thoại nào giữa 2 bên trên hệ thống.
                                                    </div>
                                                ) : (
                                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
                                                        {disputeChatLog.map((msg, index) => (
                                                            <div key={index} style={{ 
                                                                display: 'flex', 
                                                                flexDirection: 'column', 
                                                                alignItems: msg.isFromCustomer ? 'flex-end' : 'flex-start',
                                                                maxWidth: '85%',
                                                                alignSelf: msg.isFromCustomer ? 'flex-end' : 'flex-start'
                                                            }}>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                                                                    {msg.senderName} • {msg.createdAt}
                                                                </div>
                                                                <div style={{ 
                                                                    padding: '0.5rem 0.75rem', 
                                                                    borderRadius: 'var(--radius-md)', 
                                                                    background: msg.isFromCustomer ? 'var(--primary)' : 'var(--bg-secondary)',
                                                                    color: msg.isFromCustomer ? '#fff' : 'var(--text-color)',
                                                                    fontSize: '0.85rem',
                                                                    lineHeight: 1.4,
                                                                    borderTopRightRadius: msg.isFromCustomer ? '0' : 'var(--radius-md)',
                                                                    borderTopLeftRadius: !msg.isFromCustomer ? '0' : 'var(--radius-md)'
                                                                }}>
                                                                    {msg.content}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Decision Maker */}
                                            <div className="admin-section" style={{ margin: 0, padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                                <h3 style={{ margin: '0 0 1rem 0' }}>⚖️ Quyết định phân xử</h3>
                                                
                                                {/* Action Type Select */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem', marginBottom: '1rem' }}>
                                                    {[
                                                        { val: 'resolved', lbl: 'Giải ngân 100%' },
                                                        { val: 'refund', lbl: 'Hoàn 100%' },
                                                        { val: 'split', lbl: 'Chia tiền' },
                                                        { val: 'warning', lbl: 'Cảnh cáo' }
                                                    ].map(act => (
                                                        <button key={act.val} 
                                                                className={`btn btn-sm ${disputeAction === act.val ? 'btn-primary' : 'btn-outline'}`}
                                                                style={{ padding: '0.5rem 0.25rem', fontSize: '0.75rem' }}
                                                                onClick={() => setDisputeAction(act.val)}>
                                                            {act.lbl}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Split Slider */}
                                                {disputeAction === 'split' && (
                                                    <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px dashed var(--border-color)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                            <span>Hoàn khách: <strong>{refundPercent}%</strong></span>
                                                            <span>Giải ngân thợ: <strong>{100 - refundPercent}%</strong></span>
                                                        </div>
                                                        <input type="range" min="0" max="100" value={refundPercent} 
                                                               onChange={e => setRefundPercent(Number(e.target.value))}
                                                               style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', marginBottom: '0.75rem' }} />
                                                        
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                                                            <div>💸 Khách nhận: <strong style={{ color: 'var(--success)' }}>{formatPrice(selectedDispute.bookingAmount * (refundPercent / 100))}</strong></div>
                                                            <div>📸 Thợ nhận: <strong>{formatPrice(selectedDispute.bookingAmount * ((100 - refundPercent) / 100))}</strong></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Admin Note */}
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Lý do quyết định (Gửi tới 2 bên):</label>
                                                    <textarea 
                                                        rows={2}
                                                        value={disputeAdminNote}
                                                        onChange={e => setDisputeAdminNote(e.target.value)}
                                                        placeholder="Mô tả lý do phân xử, ví dụ: Thợ đi trễ 30 phút, đồng ý hoàn 20% đền bù."
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem', resize: 'none' }}
                                                    />
                                                </div>

                                                {/* Submit decision */}
                                                <button className="btn btn-primary" style={{ width: '100%', gap: '0.5rem' }} onClick={handleConfirmResolveDispute}>
                                                    <Shield size={16} /> Xác nhận quyết định phân xử
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // LIST OF DISPUTES
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
                                                            <img src={d.reporterAvatar || avatarFallback(d.reporterName)} alt={d.reporterName} className="avatar" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback(d.reporterName); }} />
                                                            <div>
                                                                <span className="party-role">Người báo cáo</span>
                                                                <strong>{d.reporterName}</strong>
                                                            </div>
                                                        </div>
                                                        <span className="dispute-vs">VS</span>
                                                        <div className="dispute-party">
                                                            <img src={d.respondentAvatar || avatarFallback(d.respondentName)} alt={d.respondentName} className="avatar" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback(d.respondentName); }} />
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
                                                        <div className="dispute-actions">
                                                            {d.status === 'Pending' ? (
                                                                <button className="btn btn-primary btn-sm" id={`dispute-workspace-${d.id}`}
                                                                    onClick={() => handleOpenDisputeWorkspace(d)}>
                                                                    <Shield size={14} /> Phân xử vụ việc
                                                                </button>
                                                            ) : (
                                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                                    Quyết định: {d.resolution === 'refund' ? 'Hoàn tiền 100%' : d.resolution === 'warning' ? 'Cảnh cáo' : d.resolution === 'split' ? 'Phân chia ký quỹ' : 'Giải ngân 100%'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )
                        )}


                        {/* ===== PAYOUTS ===== */}
                        {activeTab === 'payouts' && <AdminPayoutTab />}

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
                                    <img src={viewGrapherModal.avatar || avatarFallback(viewGrapherModal.name)} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback(viewGrapherModal.name); }} />
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

        {/* Application Detail Modal */}
        {showDetailModal && applicationDetail && (
            <div className="lightbox" onClick={() => { setShowDetailModal(false); setApplicationDetail(null); }}>
                <div className="modal-content" style={{ maxWidth: '720px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>📋 Chi tiết hồ sơ xét duyệt</h3>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setShowDetailModal(false); setApplicationDetail(null); }}>
                            <XCircle size={18} />
                        </button>
                    </div>
                    
                    {/* Header Info */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <img src={applicationDetail.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(applicationDetail.name)}&background=6C5CE7&color=fff`} 
                             alt={applicationDetail.name} className="avatar avatar-lg" 
                             onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(applicationDetail.name)}&background=6C5CE7&color=fff`; }} />
                        <div>
                            <strong style={{ fontSize: '1.1rem' }}>{applicationDetail.name}</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{applicationDetail.email}</div>
                            {applicationDetail.phone && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📞 {applicationDetail.phone}</div>}
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📅 Ngày gửi: {applicationDetail.appliedDate}</div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>📍 Khu vực</div>
                            <strong>{applicationDetail.location || 'Chưa cập nhật'}</strong>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>⏱️ Kinh nghiệm</div>
                            <strong>{applicationDetail.experienceYears != null ? `${applicationDetail.experienceYears} năm` : 'Chưa cập nhật'}</strong>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', gridColumn: 'span 2' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>🎯 Chuyên môn</div>
                            <strong>{applicationDetail.specialization || 'Chưa cập nhật'}</strong>
                        </div>
                    </div>

                    {/* Bio */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>💬 Giới thiệu bản thân</h4>
                        <p style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {applicationDetail.bio || 'Chưa có giới thiệu.'}
                        </p>
                    </div>

                    {/* CV */}
                    {applicationDetail.cvFileUrl && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>📄 CV / Hồ sơ năng lực</h4>
                            <a href={applicationDetail.cvFileUrl} target="_blank" rel="noopener noreferrer" 
                               className="btn btn-ghost btn-sm" style={{ gap: '0.5rem' }}>
                                📥 Xem / Tải CV
                            </a>
                        </div>
                    )}

                    {/* Portfolio Images */}
                    {applicationDetail.portfolioImages && applicationDetail.portfolioImages.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>📷 Portfolio ({applicationDetail.portfolioImages.length} ảnh)</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                {applicationDetail.portfolioImages.map((img, i) => (
                                    <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                                        <img src={img} alt={`Portfolio ${i + 1}`} 
                                             style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'transform 0.2s' }}
                                             onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                             onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* External Links */}
                    {applicationDetail.externalLinks && applicationDetail.externalLinks.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>🔗 Links bên ngoài</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {applicationDetail.externalLinks.map((link, i) => (
                                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" 
                                       style={{ color: 'var(--primary)', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                                        🌐 {link}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Styles */}
                    {applicationDetail.styles && applicationDetail.styles.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>🎨 Phong cách</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {applicationDetail.styles.map(s => <span key={s} className="tag tag-primary">{s}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <button className="btn btn-primary" onClick={() => handleKyc(applicationDetail.id, true)}>
                            <CheckCircle size={16} /> Duyệt hồ sơ
                        </button>
                        <button className="btn btn-ghost reject-btn" onClick={() => { setShowDetailModal(false); handleRejectClick(applicationDetail.id); }}>
                            <XCircle size={16} /> Từ chối
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Reject Reason Dialog */}
        {showRejectDialog && (
            <div className="lightbox" onClick={() => { setShowRejectDialog(false); setRejectingId(null); }}>
                <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ marginBottom: '1rem' }}>❌ Từ chối hồ sơ</h3>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Vui lòng nhập lý do từ chối để thợ biết cần sửa đổi những gì:</p>
                    <textarea 
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Ví dụ: Ảnh portfolio chưa rõ nét, CV chưa đầy đủ thông tin..."
                        className="input"
                        style={{ width: '100%', minHeight: '100px', resize: 'vertical', marginBottom: '1rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" onClick={() => { setShowRejectDialog(false); setRejectingId(null); }}>
                            Huỷ
                        </button>
                        <button className="btn btn-coral" onClick={handleConfirmReject}>
                            Xác nhận từ chối
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {/* Evidence Image Lightbox */}
        {viewEvidenceImage && (
            <div 
                className="lightbox" 
                onClick={() => setViewEvidenceImage(null)}
                style={{ zIndex: 2000 }}
            >
                <div 
                    className="modal-content" 
                    style={{ padding: '0.5rem', background: 'transparent', boxShadow: 'none', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
                    onClick={e => e.stopPropagation()}
                >
                    <img 
                        src={viewEvidenceImage} 
                        alt="Bằng chứng phóng to" 
                        style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }} 
                    />
                    <button 
                        className="btn btn-icon btn-ghost" 
                        style={{ position: 'absolute', top: '-40px', right: '0', color: '#fff', fontSize: '1.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }} 
                        onClick={() => setViewEvidenceImage(null)}
                    >
                        <XCircle size={30} />
                    </button>
                </div>
            </div>
        )}
        </>
    );
}

