import { useState, useEffect } from 'react';
import {
    Camera, DollarSign, TrendingUp, Clock, Package, Users, Settings, LogOut,
    Eye, ToggleLeft, ToggleRight, Star, MapPin, Calendar, CheckCircle, Zap, Image,
    XCircle, MessageCircle, Upload, Heart, Trash2, Filter, Plus, Maximize2, Edit, CreditCard
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient, formatPrice } from '../../services/apiClient';
import { API_BASE_URL } from '../../services/http';
import http from '../../services/http';
import ChatComponent from '../../components/chat/ChatComponent';
import './PhotographerDashboard.css';

export default function PhotographerDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [isOnline, setIsOnline] = useState(true);
    const [orderFilter, setOrderFilter] = useState('all');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const { data } = useAppData();
    const { user, updateUser } = useAuth();
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    
    // Services state
    const [services, setServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', durationMinutes: '' });

    // Portfolio and Profile state
    const [grapherProfile, setGrapherProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [newPortfolioUrl, setNewPortfolioUrl] = useState('');
    const [viewPortfolioImage, setViewPortfolioImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Profile Edit State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileForm, setProfileForm] = useState({ fullName: '', avatarUrl: '' });
    const [isProfileUpdating, setIsProfileUpdating] = useState(false);

    // Map backend BookingStatus enum names to UI status keys
    const mapStatus = (s) => {
        if (!s) return 'pending';
        const lower = s.toLowerCase();
        if (lower === 'pendingpayment' || lower === 'pendingconfirmation') return 'pending';
        if (lower === 'confirmed') return 'confirmed';
        if (lower === 'inprogress') return 'in_progress';
        if (lower === 'completed') return 'completed';
        if (lower === 'cancelled') return 'cancelled';
        return lower;
    };

    useEffect(() => {
        let cancelled = false;
        setOrdersLoading(true);
        apiClient.getGrapherOrders()
            .then((data) => {
                if (!cancelled) {
                    setOrders((data || []).map(b => ({
                        id: b.id,
                        customerId: b.customerId,
                        photographerName: b.customerName,
                        photographerAvatar: b.customerAvatar,
                        service: b.serviceName,
                        date: new Date(b.scheduledAt).toLocaleDateString('vi-VN'),
                        time: new Date(b.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                        location: b.location,
                        note: b.note,
                        status: mapStatus(b.status),
                        total: b.totalAmount,
                        payout: b.grapherPayoutAmount,
                    })));
                }
            })
            .catch((err) => {
                console.warn('Failed to fetch grapher orders:', err);
                if (!cancelled) setOrders([]);
            })
            .finally(() => { if (!cancelled) setOrdersLoading(false); });

        const fetchConversations = async () => {
            if (!user || !user.id) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/Messages/conversations`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('picmate_access_token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setConversations(data);
                }
            } catch (err) {
                console.error('Failed to fetch conversations:', err);
            }
        };

        const fetchProfile = async () => {
            if (!user || !user.id) return;
            try {
                const profile = await apiClient.getGrapherProfile(user.id);
                setGrapherProfile(profile);
                setPortfolio(profile.portfolio || []);
            } catch (err) {
                console.error('Failed to fetch grapher profile:', err);
            }
        };

        fetchConversations();
        fetchProfile();
        return () => { cancelled = true; };
    }, [user]);

    // Fetch services when services tab is active
    useEffect(() => {
        if (activeTab !== 'services') return;
        const fetchServices = async () => {
            setServicesLoading(true);
            try {
                // Use the grapher's own profile to get packages
                const res = await fetch(`${API_BASE_URL}/api/graphers/me/seed-packages`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('picmate_access_token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setServices(data);
                }
            } catch (err) {
                console.error('Failed to fetch services:', err);
            } finally {
                setServicesLoading(false);
            }
        };
        fetchServices();
    }, [activeTab]);

    const handleOpenAddService = () => {
        setEditingService(null);
        setServiceForm({ name: '', description: '', price: '', durationMinutes: '' });
        setShowServiceModal(true);
    };

    const handleOpenEditService = (svc) => {
        setEditingService(svc);
        setServiceForm({ name: svc.name, description: svc.description, price: String(svc.price), durationMinutes: String(svc.durationMinutes) });
        setShowServiceModal(true);
    };

    const handleSaveService = async () => {
        const updatedList = editingService
            ? services.map(s => s.id === editingService.id ? { ...s, name: serviceForm.name, description: serviceForm.description, price: Number(serviceForm.price), durationMinutes: Number(serviceForm.durationMinutes) } : s)
            : [...services, { id: null, name: serviceForm.name, description: serviceForm.description, price: Number(serviceForm.price), durationMinutes: Number(serviceForm.durationMinutes) }];
        
        try {
            // Call UpsertProfile to save packages
            const payload = {
                bio: grapherProfile?.bio || '',
                location: grapherProfile?.location || '',
                styles: grapherProfile?.styles || [],
                portfolio: portfolio,
                servicePackages: updatedList.map(s => ({
                    id: s.id || undefined,
                    name: s.name,
                    description: s.description,
                    price: s.price,
                    durationMinutes: s.durationMinutes
                }))
            };
            await http.put('/api/graphers/me', payload);
            // Refetch
            const res = await fetch(`${API_BASE_URL}/api/graphers/me/seed-packages`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('picmate_access_token')}` }
            });
            if (res.ok) setServices(await res.json());
            setShowServiceModal(false);
        } catch (err) {
            alert('Lỗi khi lưu dịch vụ: ' + (err.response?.data?.title || err.message));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const url = await apiClient.uploadImage(file);
            
            // Re-use logic from handleAddPortfolio but with new url
            const updatedPortfolio = [...portfolio, url];
            const payload = {
                bio: grapherProfile?.bio || '',
                location: grapherProfile?.location || '',
                styles: grapherProfile?.styles || [],
                portfolio: updatedPortfolio,
                servicePackages: services.map(s => ({
                    id: s.id || undefined,
                    name: s.name,
                    description: s.description,
                    price: s.price,
                    durationMinutes: s.durationMinutes
                }))
            };
            await http.put('/api/graphers/me', payload);
            setPortfolio(updatedPortfolio);
        } catch (err) {
            alert('Lỗi khi tải ảnh lên: ' + (err.response?.data?.Error || err.response?.data?.title || err.message));
        } finally {
            setIsUploading(false);
            e.target.value = null; // reset input
        }
    };

    const handleOpenProfileModal = () => {
        setProfileForm({
            fullName: user?.name || '',
            avatarUrl: user?.avatar || ''
        });
        setShowProfileModal(true);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsProfileUpdating(true);
            const url = await apiClient.uploadImage(file);
            setProfileForm({ ...profileForm, avatarUrl: url });
        } catch (err) {
            alert('Lỗi khi tải ảnh lên: ' + (err.response?.data?.Error || err.message));
        } finally {
            setIsProfileUpdating(false);
            e.target.value = null;
        }
    };

    const handleSaveProfile = async () => {
        try {
            setIsProfileUpdating(true);
            const response = await apiClient.updateProfile({
                fullName: profileForm.fullName,
                avatarUrl: profileForm.avatarUrl
            });
            updateUser({
                name: response.fullName,
                avatar: response.avatarUrl
            });
            alert('Cập nhật hồ sơ thành công!');
            setShowProfileModal(false);
        } catch (err) {
            alert('Lỗi khi cập nhật hồ sơ: ' + (err.response?.data?.Error || err.message));
        } finally {
            setIsProfileUpdating(false);
        }
    };

    const handleAddPortfolio = async () => {
        if (!newPortfolioUrl) return;
        const updatedPortfolio = [...portfolio, newPortfolioUrl];
        try {
            const payload = {
                bio: grapherProfile?.bio || '',
                location: grapherProfile?.location || '',
                styles: grapherProfile?.styles || [],
                portfolio: updatedPortfolio,
                servicePackages: services.map(s => ({
                    id: s.id || undefined,
                    name: s.name,
                    description: s.description,
                    price: s.price,
                    durationMinutes: s.durationMinutes
                }))
            };
            await http.put('/api/graphers/me', payload);
            setPortfolio(updatedPortfolio);
            setNewPortfolioUrl('');
        } catch (err) {
            alert('Lỗi khi thêm ảnh portfolio: ' + (err.response?.data?.title || err.message));
        }
    };

    const handleDeletePortfolio = async (index) => {
        if (!confirm('Bạn có chắc muốn xóa ảnh này khỏi portfolio?')) return;
        const updatedPortfolio = portfolio.filter((_, i) => i !== index);
        try {
            const payload = {
                bio: grapherProfile?.bio || '',
                location: grapherProfile?.location || '',
                styles: grapherProfile?.styles || [],
                portfolio: updatedPortfolio,
                servicePackages: services.map(s => ({
                    id: s.id || undefined,
                    name: s.name,
                    description: s.description,
                    price: s.price,
                    durationMinutes: s.durationMinutes
                }))
            };
            await http.put('/api/graphers/me', payload);
            setPortfolio(updatedPortfolio);
        } catch (err) {
            alert('Lỗi khi xóa ảnh portfolio: ' + (err.response?.data?.title || err.message));
        }
    };

    const handleDeleteService = async (svcId) => {
        if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
        const updatedList = services.filter(s => s.id !== svcId);
        try {
            const payload = {
                bio: grapherProfile?.bio || '',
                location: grapherProfile?.location || '',
                styles: grapherProfile?.styles || [],
                portfolio: portfolio,
                servicePackages: updatedList.map(s => ({
                    id: s.id || undefined,
                    name: s.name,
                    description: s.description,
                    price: s.price,
                    durationMinutes: s.durationMinutes
                }))
            };
            await http.put('/api/graphers/me', payload);
            setServices(updatedList);
        } catch (err) {
            alert('Lỗi khi xóa dịch vụ');
        }
    };

    const getRoleLabel = (role) => {
        if (!role) return 'Phone-Grapher';
        const r = String(role).toLowerCase();
        if (r === 'photographer') return 'Phone-Grapher';
        if (r === 'admin') return 'Administrator';
        return 'Phone-Grapher';
    };

    const bookingStatuses = data.bookingStatuses || [];

    const getStatusBadge = (status) => {
        if (!status) return <span className="badge badge-warning">Chờ xác nhận</span>;
        const lower = status.toLowerCase();
        if (lower === 'pendingpayment' || lower === 'pendingconfirmation' || lower === 'pending') {
            return <span className="badge badge-warning">⏳ Chờ xác nhận</span>;
        } else if (lower === 'confirmed') {
            return <span className="badge badge-info">📅 Đã nhận</span>;
        } else if (lower === 'inprogress' || lower === 'in_progress') {
            return <span className="badge badge-primary">📸 Đang thực hiện</span>;
        } else if (lower === 'completed') {
            return <span className="badge badge-success">✅ Hoàn thành</span>;
        } else if (lower === 'cancelled') {
            return <span className="badge badge-danger">❌ Đã hủy</span>;
        }
        return <span className="badge badge-secondary">{status}</span>;
    };

    const filteredOrders = orderFilter === 'all'
        ? orders
        : orders.filter(b => b.status === orderFilter);

    const pendingCount = orders.filter(b => b.status === 'pending').length;
    const confirmedCount = orders.filter(b => b.status === 'confirmed').length;

    const stats = [
        { label: 'Doanh thu tháng', value: '3,200,000đ', icon: <DollarSign size={20} />, color: 'var(--accent-green)' },
        { label: 'Đơn hoàn thành', value: '24', icon: <CheckCircle size={20} />, color: 'var(--primary)' },
        { label: 'Đánh giá TB', value: '4.9 ⭐', icon: <Star size={20} />, color: 'var(--accent-gold)' },
        { label: 'Lượt xem hồ sơ', value: '1,245', icon: <Eye size={20} />, color: 'var(--accent-coral)' },
    ];

    const handleViewBookingDetails = async (id) => {
        try {
            const detail = await apiClient.getBookingDetail(id);
            setSelectedOrder(detail);
            setShowOrderDetail(true);
        } catch (err) {
            alert("Lỗi khi tải chi tiết đơn hàng");
        }
    };

    const handleCancelBooking = async () => {
        try {
            await apiClient.cancelBooking(selectedOrder.id, cancelReason);
            alert("Từ chối / Hủy đơn hàng thành công");
            setShowCancelModal(false);
            setCancelReason('');
            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'cancelled' } : o));
        } catch (err) {
            alert("Lỗi khi hủy đơn hàng. Vui lòng thử lại.");
        }
    };

    const handleConfirmBooking = async (id) => {
        try {
            await apiClient.confirmBooking(id);
            alert("Xác nhận đơn hàng thành công");
            setOrders(orders.map(o => o.id === id ? { ...o, status: 'confirmed' } : o));
        } catch (err) {
            alert("Lỗi khi xác nhận đơn hàng: " + (err.response?.data?.Error || "Vui lòng thử lại."));
        }
    };

    const handleCompleteBooking = async (id) => {
        try {
            await apiClient.completeBooking(id);
            alert("Hoàn thành đơn hàng thành công");
            setOrders(orders.map(o => o.id === id ? { ...o, status: 'completed' } : o));
        } catch (err) {
            alert("Lỗi khi hoàn thành đơn hàng: " + (err.response?.data?.Error || "Vui lòng thử lại."));
        }
    };

    const getOrderActions = (booking) => {
        switch (booking.status) {
            case 'pending':
                return (
                    <div className="order-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => handleConfirmBooking(booking.id)}>
                            <CheckCircle size={14} /> Xác nhận
                        </button>
                        <button className="btn btn-ghost btn-sm order-cancel-btn" onClick={() => { setSelectedOrder(booking); setShowCancelModal(true); }}>
                            <XCircle size={14} /> Từ chối
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleViewBookingDetails(booking.id)}>
                            Chi tiết
                        </button>
                    </div>
                );
            case 'confirmed':
                return (
                    <div className="order-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => { 
                            setSelectedChatUser({ id: booking.customerId, fullName: booking.photographerName, avatarUrl: booking.photographerAvatar, role: 'Customer' });
                        }}>
                            <MessageCircle size={14} /> Liên hệ
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleViewBookingDetails(booking.id)}>
                            Chi tiết
                        </button>
                    </div>
                );
            case 'in_progress':
                return (
                    <div className="order-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => handleCompleteBooking(booking.id)}>
                            <CheckCircle size={14} /> Hoàn thành
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { 
                            setSelectedChatUser({ id: booking.customerId, fullName: booking.photographerName, avatarUrl: booking.photographerAvatar, role: 'Customer' });
                        }}>
                            <MessageCircle size={14} /> Liên hệ
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleViewBookingDetails(booking.id)}>
                            Chi tiết
                        </button>
                    </div>
                );
            case 'completed':
                return (
                    <div className="order-actions">
                        <span className="badge badge-success">✅ Đã hoàn thành</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleViewBookingDetails(booking.id)}>
                            Chi tiết
                        </button>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className="order-actions">
                        <span className="badge badge-danger">❌ Đã hủy</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleViewBookingDetails(booking.id)}>
                            Chi tiết
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-layout">
                    <aside className="dashboard-sidebar">
                        <div className="dashboard-profile">
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={user?.avatar || 'https://via.placeholder.com/200?text=Avatar'} alt={user?.name || 'Photographer'} className="avatar-lg" />
                                <button className="btn btn-icon btn-primary" style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderRadius: '50%', padding: 0 }} onClick={handleOpenProfileModal} title="Chỉnh sửa hồ sơ">
                                    <Edit size={16} />
                                </button>
                            </div>
                            <h3>{user?.name || 'Phone-Grapher'}</h3>
                            <span className="badge badge-info">📸 {getRoleLabel(user?.role)}</span>
                        </div>

                        <div className="online-toggle" id="online-toggle">
                            <button className={`online-btn ${isOnline ? 'active' : ''}`} onClick={() => setIsOnline(!isOnline)}>
                                {isOnline ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                <span>{isOnline ? 'Đang Online' : 'Offline'}</span>
                            </button>
                        </div>

                        <nav className="dashboard-nav">
                            {[
                                { key: 'overview', icon: <TrendingUp size={18} />, label: 'Tổng quan' },
                                { key: 'orders', icon: <Package size={18} />, label: 'Đơn hàng', badge: pendingCount },
                                { key: 'services', icon: <CreditCard size={18} />, label: 'Dịch vụ', badge: services.length },
                                { key: 'messages', icon: <MessageCircle size={18} />, label: 'Tin nhắn', badge: conversations.length },
                                { key: 'portfolio', icon: <Image size={18} />, label: 'Portfolio' },
                                { key: 'settings', icon: <Settings size={18} />, label: 'Cài đặt' },
                            ].map(item => (
                                <button
                                    key={item.key}
                                    className={`dashboard-nav-item ${activeTab === item.key ? 'active' : ''}`}
                                    onClick={() => setActiveTab(item.key)}
                                    id={`pg-nav-${item.key}`}
                                >
                                    {item.icon} {item.label}
                                    {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                                </button>
                            ))}
                            <button className="dashboard-nav-item dashboard-logout"><LogOut size={18} /> Đăng xuất</button>
                        </nav>
                    </aside>

                    <div className="dashboard-content">
                        {/* ===== OVERVIEW ===== */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Tổng quan</h2>
                                </div>

                                <div className="stats-grid">
                                    {stats.map((stat, i) => (
                                        <div key={i} className="stat-card">
                                            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                                                {stat.icon}
                                            </div>
                                            <div>
                                                <span className="stat-label">{stat.label}</span>
                                                <strong className="stat-value">{stat.value}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="chart-placeholder">
                                    <TrendingUp size={40} />
                                    <h3>Biểu đồ doanh thu</h3>
                                    <p>Doanh thu 30 ngày qua sẽ hiển thị tại đây.</p>
                                    <div className="chart-bars">
                                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                                            <div key={i} className="chart-bar" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Pending orders alert */}
                                {pendingCount > 0 && (
                                    <div className="pg-pending-alert" onClick={() => { setActiveTab('orders'); setOrderFilter('pending'); }}>
                                        <Package size={20} />
                                        <span>Bạn có <strong>{pendingCount} đơn hàng</strong> đang chờ xác nhận!</span>
                                        <button className="btn btn-primary btn-sm">Xem ngay →</button>
                                    </div>
                                )}

                                <h3 style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>Đơn hàng gần đây</h3>
                                <div className="orders-list">
                                    {orders.slice(0, 2).map(booking => (
                                        <div key={booking.id} className={`order-card order-status-${booking.status}`}>
                                            <div className="order-card-header">
                                                <div className="order-photographer">
                                                    <div>
                                                        <strong>Khách: {booking.photographerName}</strong>
                                                        <span>{booking.service}</span>
                                                    </div>
                                                </div>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <div className="order-card-details">
                                                <div className="order-detail"><Calendar size={14} /><span>{booking.date} – {booking.time}</span></div>
                                                <div className="order-detail"><MapPin size={14} /><span>{booking.location}</span></div>
                                            </div>
                                            <div className="order-card-footer">
                                                <span className="order-id">{booking.id}</span>
                                                <div className="order-footer-right">
                                                    <strong className="order-total">{formatPrice(booking.total)}</strong>
                                                    {getOrderActions(booking)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ===== ORDERS ===== */}
                        {activeTab === 'orders' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Đơn hàng</h2>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span className="badge badge-warning">⏳ Chờ: {pendingCount}</span>
                                        <span className="badge badge-info">✅ Đã nhận: {confirmedCount}</span>
                                    </div>
                                </div>

                                <div className="order-filter-tabs">
                                    {[
                                        { key: 'all', label: 'Tất cả' },
                                        { key: 'pending', label: `⏳ Chờ xác nhận (${pendingCount})` },
                                        { key: 'confirmed', label: 'Đã nhận' },
                                        { key: 'completed', label: 'Hoàn thành' },
                                        { key: 'cancelled', label: 'Đã hủy' },
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

                                <div className="orders-list">
                                    {filteredOrders.map(b => (
                                        <div key={b.id} className={`order-card order-status-${b.status}`}>
                                            <div className="order-card-header">
                                                <div className="order-photographer">
                                                    <img src={b.photographerAvatar} alt="" className="avatar" style={{ width: 36, height: 36 }} />
                                                    <div>
                                                        <strong>{b.service}</strong>
                                                        <span>Khách hàng đặt</span>
                                                    </div>
                                                </div>
                                                {getStatusBadge(b.status)}
                                            </div>
                                            <div className="order-card-details">
                                                <div className="order-detail"><Calendar size={14} /><span>{b.date} – {b.time}</span></div>
                                                <div className="order-detail"><MapPin size={14} /><span>{b.location}</span></div>
                                                <div className="order-detail"><DollarSign size={14} /><span>{formatPrice(b.total)}</span></div>
                                            </div>
                                            {b.note && <div className="order-note">📝 {b.note}</div>}
                                            <div className="order-card-footer">
                                                <span className="order-id">{b.id}</span>
                                                <div className="order-footer-right">
                                                    <strong className="order-total">{formatPrice(b.total)}</strong>
                                                    {getOrderActions(b)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ===== PORTFOLIO ===== */}
                        {activeTab === 'portfolio' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Portfolio của bạn</h2>
                                    <button className="btn btn-primary btn-sm" id="btn-upload-photo">
                                        <Plus size={16} /> Thêm ảnh
                                    </button>
                                </div>

                                {/* Upload Zone */}
                                <div className="portfolio-upload-zone" id="portfolio-upload" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                                    <Upload size={36} />
                                    <h4>Thêm ảnh mới vào Portfolio</h4>
                                    
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        <div style={{ position: 'relative' }}>
                                            <input 
                                                type="file" 
                                                accept="image/jpeg, image/png, image/webp"
                                                onChange={handleFileUpload}
                                                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
                                                disabled={isUploading}
                                            />
                                            <button className="btn btn-primary" disabled={isUploading}>
                                                {isUploading ? 'Đang tải...' : 'Tải ảnh từ máy tính'}
                                            </button>
                                        </div>
                                        <span>hoặc</span>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                placeholder="Dán link (URL) ảnh..." 
                                                value={newPortfolioUrl}
                                                onChange={(e) => setNewPortfolioUrl(e.target.value)}
                                                disabled={isUploading}
                                                style={{ width: '250px' }}
                                            />
                                            <button className="btn btn-ghost" onClick={handleAddPortfolio} disabled={!newPortfolioUrl || isUploading}>
                                                Thêm URL
                                            </button>
                                        </div>
                                    </div>
                                    <p>Hỗ trợ tải lên ảnh (JPG, PNG, WEBP) hoặc chèn Link URL trực tiếp</p>
                                </div>

                                {/* Category Filter */}
                                <div className="portfolio-filter">
                                    <Filter size={16} />
                                    <button className="order-filter-tab active">Tất cả</button>
                                    <span className="filter-count">{portfolio.length} ảnh</span>
                                </div>

                                {/* Photo Grid */}
                                <div className="portfolio-grid">
                                    {portfolio.map((photoUrl, index) => (
                                        <div key={index} className="portfolio-photo-card">
                                            <div className="portfolio-photo-img">
                                                <img src={photoUrl} alt={`Portfolio ${index}`} />
                                                <div className="portfolio-photo-overlay">
                                                    <button className="photo-overlay-btn" title="Xem phóng to" onClick={() => setViewPortfolioImage(photoUrl)}>
                                                        <Maximize2 size={16} />
                                                    </button>
                                                    <button className="photo-overlay-btn photo-delete-btn" title="Xóa ảnh" onClick={() => handleDeletePortfolio(index)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ===== MESSAGES ===== */}
                        {activeTab === 'messages' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Tin nhắn</h2>
                                </div>
                                <div className="messages-list">
                                    {conversations.length > 0 ? conversations.map(contact => (
                                        <div 
                                            key={contact.id} 
                                            className="message-item" 
                                            onClick={() => setSelectedChatUser(contact)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="message-avatar-wrap">
                                                <img src={contact.avatarUrl || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop'} alt={contact.fullName} className="avatar" />
                                            </div>
                                            <div className="message-content">
                                                <div className="message-top">
                                                    <strong>{contact.fullName}</strong>
                                                </div>
                                                <p className="message-preview">Nhấn để xem tin nhắn</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="dashboard-placeholder">
                                            <MessageCircle size={48} />
                                            <h3>Chưa có tin nhắn</h3>
                                            <p>Bạn chưa trò chuyện với khách hàng nào.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ===== SERVICES ===== */}
                        {activeTab === 'services' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Dịch vụ của bạn</h2>
                                    <button className="btn btn-primary btn-sm" onClick={handleOpenAddService}>
                                        <Plus size={16} /> Thêm dịch vụ
                                    </button>
                                </div>

                                {servicesLoading ? (
                                    <div className="dashboard-placeholder">
                                        <p>Đang tải dịch vụ...</p>
                                    </div>
                                ) : services.length > 0 ? (
                                    <div className="orders-list">
                                        {services.map(svc => (
                                            <div key={svc.id} className="order-card" style={{ borderLeftColor: 'var(--primary)' }}>
                                                <div className="order-card-header">
                                                    <div className="order-photographer">
                                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>
                                                            <Camera size={20} />
                                                        </div>
                                                        <div>
                                                            <strong>{svc.name}</strong>
                                                            <span>{svc.description}</span>
                                                        </div>
                                                    </div>
                                                    <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{formatPrice(svc.price)}</strong>
                                                </div>
                                                <div className="order-card-details">
                                                    <div className="order-detail"><Clock size={14} /><span>{svc.durationMinutes} phút</span></div>
                                                </div>
                                                <div className="order-card-footer">
                                                    <span className="order-id">{svc.id?.split('-')[0]}</span>
                                                    <div className="order-actions">
                                                        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditService(svc)}>
                                                            <Edit size={14} /> Sửa
                                                        </button>
                                                        <button className="btn btn-ghost btn-sm order-cancel-btn" onClick={() => handleDeleteService(svc.id)}>
                                                            <Trash2 size={14} /> Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="dashboard-placeholder">
                                        <Camera size={48} />
                                        <h3>Chưa có dịch vụ</h3>
                                        <p>Thêm dịch vụ để khách hàng có thể đặt lịch với bạn.</p>
                                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleOpenAddService}>
                                            <Plus size={16} /> Thêm dịch vụ đầu tiên
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ===== SETTINGS ===== */}
                        {activeTab === 'settings' && (
                            <div className="dashboard-placeholder">
                                <Settings size={48} />
                                <h3>Cài đặt</h3>
                                <p>Cập nhật giá, khu vực hoạt động, và thông tin cá nhân.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Real-time Chat Box Popup */}
            {selectedChatUser && (
                <ChatComponent 
                    otherUser={selectedChatUser} 
                    onClose={() => setSelectedChatUser(null)} 
                />
            )}

            {/* Order Detail Modal */}
            {showOrderDetail && selectedOrder && (
                <div className="lightbox" onClick={(e) => { if (e.target.className === 'lightbox') setShowOrderDetail(false); }}>
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Chi tiết đơn hàng {selectedOrder.id.split('-')[0]}</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowOrderDetail(false)}><XCircle size={20} /></button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Thợ chụp:</span>
                                <strong>{selectedOrder.grapherName}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Khách hàng:</span>
                                <strong>{selectedOrder.customerName}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Dịch vụ:</span>
                                <strong>{selectedOrder.serviceName}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Thời gian:</span>
                                <strong>{new Date(selectedOrder.scheduledAt).toLocaleString('vi-VN')} ({selectedOrder.durationMinutes} phút)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Địa điểm:</span>
                                <strong>{selectedOrder.location}</strong>
                            </div>
                            {selectedOrder.note && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Ghi chú:</span>
                                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-body)', borderRadius: '8px' }}>{selectedOrder.note}</div>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Trạng thái:</span>
                                {getStatusBadge(mapStatus(selectedOrder.status))}
                            </div>
                            {selectedOrder.status === 'Cancelled' && selectedOrder.cancellationReason && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '0.5rem', color: 'var(--accent-coral)' }}>
                                    <span>Lý do hủy:</span>
                                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{selectedOrder.cancellationReason}</div>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '1.2rem' }}>
                                <strong>Tổng tiền / Nhận về:</strong>
                                <span>
                                    <strong style={{ color: 'var(--text-secondary)', textDecoration: 'line-through', fontSize: '1rem', marginRight: '8px' }}>{formatPrice(selectedOrder.totalAmount)}</strong>
                                    <strong style={{ color: 'var(--primary)' }}>{formatPrice(selectedOrder.grapherPayoutAmount)}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && selectedOrder && (
                <div className="lightbox" onClick={(e) => { if (e.target.className === 'lightbox') setShowCancelModal(false); }}>
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Từ chối / Hủy đơn</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowCancelModal(false)}><XCircle size={20} /></button>
                        </div>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Bạn có chắc chắn muốn hủy đơn của <strong>{selectedOrder.photographerName || 'Khách hàng'}</strong> không?</p>
                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Lý do (không bắt buộc)</label>
                            <textarea 
                                className="input" 
                                rows={3} 
                                placeholder="Nhập lý do..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => setShowCancelModal(false)}>Quay lại</button>
                            <button className="btn btn-primary" style={{ backgroundColor: 'var(--accent-coral)' }} onClick={handleCancelBooking}>Xác nhận hủy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Add/Edit Modal */}
            {showServiceModal && (
                <div className="lightbox" onClick={(e) => { if (e.target.className === 'lightbox') setShowServiceModal(false); }}>
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>{editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowServiceModal(false)}><XCircle size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Tên dịch vụ</label>
                                <input className="input" placeholder="VD: Chụp ngoại cảnh" value={serviceForm.name} onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label>Mô tả</label>
                                <textarea className="input" rows={2} placeholder="Mô tả dịch vụ..." value={serviceForm.description} onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>Giá (VNĐ)</label>
                                    <input className="input" type="number" placeholder="150000" value={serviceForm.price} onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Thời lượng (phút)</label>
                                    <input className="input" type="number" placeholder="60" value={serviceForm.durationMinutes} onChange={(e) => setServiceForm({...serviceForm, durationMinutes: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button className="btn btn-ghost" onClick={() => setShowServiceModal(false)}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSaveService} disabled={!serviceForm.name || !serviceForm.price || !serviceForm.durationMinutes}>
                                {editingService ? 'Cập nhật' : 'Thêm dịch vụ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Edit Modal */}
            {showProfileModal && (
                <div className="lightbox" onClick={(e) => { if (e.target.className === 'lightbox') setShowProfileModal(false); }}>
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Chỉnh sửa thông tin</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowProfileModal(false)}><XCircle size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                                <img src={profileForm.avatarUrl || 'https://via.placeholder.com/200?text=Avatar'} alt="Avatar Preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)' }} />
                                <label className="btn btn-primary btn-icon" style={{ position: 'absolute', bottom: 0, right: 0, cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}>
                                    <Upload size={16} />
                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} disabled={isProfileUpdating} />
                                </label>
                            </div>
                            <div className="input-group" style={{ width: '100%' }}>
                                <label>Họ và tên</label>
                                <input className="input" value={profileForm.fullName} onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} disabled={isProfileUpdating} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button className="btn btn-ghost" onClick={() => setShowProfileModal(false)} disabled={isProfileUpdating}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isProfileUpdating || !profileForm.fullName}>
                                {isProfileUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Portfolio View Image Modal */}
            {viewPortfolioImage && (
                <div className="lightbox" onClick={() => setViewPortfolioImage(null)}>
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img 
                            src={viewPortfolioImage} 
                            alt="Phóng to" 
                            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} 
                            onClick={(e) => e.stopPropagation()} 
                        />
                        <button 
                            className="btn btn-icon btn-ghost" 
                            style={{ position: 'absolute', top: '-40px', right: '-40px', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}
                            onClick={() => setViewPortfolioImage(null)}
                        >
                            <XCircle size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
