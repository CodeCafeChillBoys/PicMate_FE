import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User, Clock, Camera, Settings, LogOut, Star, MapPin,
    MessageCircle, Calendar, Package, CreditCard, ChevronRight,
    Heart, Bell, Shield, Lock, Crown, Zap, Eye, Search,
    Phone, Mail, Edit3, Upload, Check, X, Send, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/http';
import { apiClient } from '../../services/apiClient';
import { formatPrice, avatarFallback } from '../../data/data';
import ChatComponent from '../../components/chat/ChatComponent';
import toast from 'react-hot-toast';
import './CustomerDashboard.css';

export default function CustomerDashboard() {
    const { data, toggleFavoriteId } = useAppData();
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [orderFilter, setOrderFilter] = useState('all');
    const [notifBooking, setNotifBooking] = useState(true);
    const [notifMessage, setNotifMessage] = useState(true);
    const [notifPromo, setNotifPromo] = useState(false);
    
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // Review state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewOrder, setReviewOrder] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Dispute (khiếu nại) state
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [disputeOrder, setDisputeOrder] = useState(null);
    const [disputeReason, setDisputeReason] = useState('');
    const [disputePriority, setDisputePriority] = useState('Medium');
    const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

    // Profile Edit State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileForm, setProfileForm] = useState({ fullName: '', avatarUrl: '' });
    const [isProfileUpdating, setIsProfileUpdating] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.name || '',
                avatarUrl: user.avatar || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || !user.id) return;
            try {
                setLoadingOrders(true);
                const apiData = await apiClient.getCustomerOrders(user.id);
                const mapped = apiData.map(b => {
                    const statusMap = {
                        'PendingConfirmation': 'pending',
                        'PendingPayment': 'pending',
                        'Confirmed': 'confirmed',
                        'InProgress': 'confirmed',
                        'Completed': 'completed',
                        'Cancelled': 'cancelled'
                    };
                    return {
                        id: b.id,
                        grapherId: b.grapherUserId,
                        photographerName: b.grapherName,
                        photographerAvatar: b.grapherAvatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
                        service: b.serviceName,
                        date: new Date(b.scheduledAt).toLocaleDateString('vi-VN'),
                        time: new Date(b.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                        location: b.location,
                        total: b.totalAmount,
                        status: statusMap[b.status] || 'pending',
                        rawStatus: b.status,
                        note: b.note,
                        hasReview: b.hasReview
                    };
                });
                setOrders(mapped);
            } catch (err) {
                console.error('Failed to fetch customer orders:', err);
            } finally {
                setLoadingOrders(false);
            }
        };

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

        fetchOrders();
        fetchConversations();
    }, [user]);

    const bookingStatuses = data.bookingStatuses || [];
    const photographers = data.photographers || [];
    const favoritePhotographerIds = data.favoritePhotographerIds || [];
    const mockMessages = data.mockMessages || [];

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

    const filteredBookings = orderFilter === 'all'
        ? orders
        : orders.filter(b => b.status === orderFilter);

    const favoritePhotographers = photographers.filter(p => favoritePhotographerIds.includes(p.id));

    // Chỉ tính tiền các đơn đã thanh toán (PendingPayment chưa trả, Cancelled được hoàn)
    const totalSpent = orders
        .filter(o => !['PendingPayment', 'Cancelled'].includes(o.rawStatus))
        .reduce((sum, o) => sum + (o.total || 0), 0);
    const completedOrdersCount = orders.filter(o => o.rawStatus === 'Completed').length;

    const userStats = [
        { label: 'Tổng đơn hàng', value: String(orders.length), icon: <Package size={20} />, color: 'var(--primary)' },
        { label: 'Đã chi tiêu', value: formatPrice(totalSpent), icon: <CreditCard size={20} />, color: 'var(--accent-coral)' },
        { label: 'Thợ yêu thích', value: String(favoritePhotographers.length), icon: <Heart size={20} />, color: '#e84393' },
        { label: 'Đơn hoàn thành', value: String(completedOrdersCount), icon: <CheckCircle size={20} />, color: 'var(--accent-gold)' },
    ];

    const activeOrdersCount = orders.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status?.toLowerCase())).length;
    const messagesCount = conversations.length;

    const orderFilterTabs = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ xác nhận' },
        { key: 'confirmed', label: 'Đã nhận' },
        { key: 'completed', label: 'Hoàn thành' },
        { key: 'cancelled', label: 'Đã hủy' },
    ];

    const handleViewBookingDetails = async (id) => {
        try {
            const detail = await apiClient.getBookingDetail(id);
            setSelectedOrder(detail);
            setShowOrderDetail(true);
        } catch (err) {
            toast.error("Lỗi khi tải chi tiết đơn hàng");
        }
    };

    const handleCancelBooking = async () => {
        try {
            await apiClient.cancelBooking(selectedOrder.id, cancelReason);
            toast.success("Hủy đơn hàng thành công");
            setShowCancelModal(false);
            setCancelReason('');
            // Update local state to reflect change without re-fetching everything
            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'cancelled', rawStatus: 'Cancelled' } : o));
        } catch (err) {
            toast.error("Lỗi khi hủy đơn hàng. Vui lòng thử lại.");
        }
    };

    const handleOpenReview = (order) => {
        setReviewOrder(order);
        setReviewRating(5);
        setReviewComment('');
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewOrder) return;
        try {
            setIsSubmittingReview(true);
            await apiClient.createReview(reviewOrder.id, { rating: reviewRating, comment: reviewComment });
            setOrders(prev => prev.map(o => o.id === reviewOrder.id ? { ...o, hasReview: true } : o));
            toast.success('Cảm ơn bạn đã đánh giá!');
            setShowReviewModal(false);
        } catch (err) {
            toast.error('Lỗi khi gửi đánh giá: ' + (err.response?.data?.title || err.message));
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleOpenDispute = (order) => {
        setDisputeOrder(order);
        setDisputeReason('');
        setDisputePriority('Medium');
        setShowDisputeModal(true);
    };

    const handleSubmitDispute = async () => {
        if (!disputeOrder || !disputeReason.trim()) return;
        try {
            setIsSubmittingDispute(true);
            await apiClient.createDispute({ bookingId: disputeOrder.id, reason: disputeReason.trim(), priority: disputePriority });
            toast.success('Đã gửi khiếu nại. Admin sẽ xử lý sớm.');
            setShowDisputeModal(false);
        } catch (err) {
            toast.error('Lỗi khi gửi khiếu nại: ' + (err.response?.data?.title || err.message));
        } finally {
            setIsSubmittingDispute(false);
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
            toast.success('Tải ảnh đại diện thành công!');
        } catch (err) {
            toast.error('Lỗi khi tải ảnh lên: ' + (err.response?.data?.Error || err.message));
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
            toast.success('Cập nhật hồ sơ thành công!');
            setShowProfileModal(false);
        } catch (err) {
            toast.error('Lỗi khi cập nhật hồ sơ: ' + (err.response?.data?.Error || err.message));
        } finally {
            setIsProfileUpdating(false);
        }
    };

    const handleStartBooking = async (orderId) => {
        try {
            await apiClient.startBooking(orderId);
            toast.success("Xác nhận bắt đầu chụp thành công!");
            setOrders(orders.map(o => o.id === orderId ? { ...o, rawStatus: 'InProgress' } : o));
        } catch (err) {
            toast.error("Lỗi khi bắt đầu đơn hàng. Vui lòng thử lại.");
        }
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-layout">
                    {/* Sidebar */}
                    <aside className="dashboard-sidebar">
                        <div className="dashboard-profile">
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={user?.avatar || avatarFallback(user?.name)} alt={user?.name || "User"} className="avatar-lg" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback(user?.name); }} />
                                <button className="btn btn-icon btn-primary" style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderRadius: '50%', padding: 0 }} onClick={handleOpenProfileModal} title="Chỉnh sửa hồ sơ">
                                    <Edit3 size={16} />
                                </button>
                            </div>
                            <h3>{user?.name || 'Nguyễn Văn Khách'}</h3>
                            <span className="badge badge-info">👤 Khách hàng</span>
                            <div className="profile-membership">
                                <Crown size={14} />
                                <span>Premium Member</span>
                            </div>
                        </div>
                        <nav className="dashboard-nav">
                            {[
                                { key: 'overview', icon: <Eye size={18} />, label: 'Tổng quan' },
                                { key: 'orders', icon: <Package size={18} />, label: 'Đơn hàng', badge: activeOrdersCount },
                                { key: 'favorites', icon: <Heart size={18} />, label: 'Yêu thích' },
                                { key: 'messages', icon: <MessageCircle size={18} />, label: 'Tin nhắn', badge: messagesCount },
                                { key: 'profile', icon: <User size={18} />, label: 'Hồ sơ' },
                                { key: 'settings', icon: <Settings size={18} />, label: 'Cài đặt' },
                            ].map(item => (
                                <button
                                    key={item.key}
                                    className={`dashboard-nav-item ${activeTab === item.key ? 'active' : ''}`}
                                    onClick={() => setActiveTab(item.key)}
                                    id={`dash-nav-${item.key}`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                    {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                                </button>
                            ))}
                            <button className="dashboard-nav-item dashboard-logout" id="dash-logout">
                                <LogOut size={18} /> <span>Đăng xuất</span>
                            </button>
                        </nav>
                    </aside>

                    {/* Content */}
                    <div className="dashboard-content">
                        {/* ===== OVERVIEW TAB ===== */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="welcome-banner" id="welcome-banner">
                                    <div className="welcome-text">
                                        <h2>Xin chào, <span className="gradient-text">{user?.name ? user.name.split(' ').pop() : 'Khách'}</span>! 👋</h2>
                                        <p>Quản lý đơn hàng, theo dõi thợ yêu thích và trải nghiệm dịch vụ chụp ảnh Phone-Graphy tốt nhất.</p>
                                        <div className="welcome-actions">
                                            <Link to="/explore" className="btn btn-primary btn-sm" id="dash-explore">
                                                <Camera size={16} /> Đặt lịch ngay
                                            </Link>
                                            <Link to="/instant" className="btn btn-coral btn-sm" id="dash-instant">
                                                <Zap size={16} /> Chụp ngay
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="welcome-illustration">📸</div>
                                </div>

                                <div className="stats-grid">
                                    {userStats.map((stat, i) => (
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

                                <div className="overview-section">
                                    <div className="overview-section-header">
                                        <h3>📦 Đơn hàng gần đây</h3>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('orders')}>
                                            Xem tất cả <ChevronRight size={14} />
                                        </button>
                                    </div>
                                    <div className="orders-list">
                                        {orders.slice(0, 2).map(booking => (
                                            <div key={booking.id} className={`order-card order-status-${booking.status}`} id={`order-${booking.id}`}>
                                                <div className="order-card-header">
                                                    <div className="order-photographer">
                                                        <img src={booking.photographerAvatar} alt={booking.photographerName} className="avatar" />
                                                        <div>
                                                            <strong>{booking.photographerName}</strong>
                                                            <span>{booking.service}</span>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(booking.status)}
                                                </div>
                                                <div className="order-card-details">
                                                    <div className="order-detail">
                                                        <Calendar size={14} />
                                                        <span>{booking.date} – {booking.time}</span>
                                                    </div>
                                                    <div className="order-detail">
                                                        <MapPin size={14} />
                                                        <span>{booking.location}</span>
                                                    </div>
                                                </div>
                                                <div className="order-card-footer">
                                                    <span className="order-id">{booking.id}</span>
                                                    <strong className="order-total">{formatPrice(booking.total)}</strong>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="overview-section">
                                    <div className="overview-section-header">
                                        <h3>💜 Thợ yêu thích</h3>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('favorites')}>
                                            Xem tất cả <ChevronRight size={14} />
                                        </button>
                                    </div>
                                    <div className="fav-mini-grid">
                                        {favoritePhotographers.slice(0, 3).map(p => (
                                            <Link to={`/photographer/${p.id}`} key={p.id} className="fav-mini-card" id={`fav-mini-${p.id}`}>
                                                <img src={p.avatar} alt={p.name} className="avatar" />
                                                <div>
                                                    <strong>{p.name}</strong>
                                                    <span>{p.location}</span>
                                                </div>
                                                {p.isOnline && <span className="online-indicator">🟢</span>}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ===== ORDERS TAB ===== */}
                        {activeTab === 'orders' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Đơn hàng của tôi</h2>
                                    <Link to="/explore" className="btn btn-primary btn-sm" id="dash-new-booking">
                                        <Camera size={16} /> Đặt lịch mới
                                    </Link>
                                </div>

                                <div className="order-filter-tabs" id="order-filters">
                                    {orderFilterTabs.map(tab => (
                                        <button
                                            key={tab.key}
                                            className={`order-filter-tab ${orderFilter === tab.key ? 'active' : ''}`}
                                            onClick={() => setOrderFilter(tab.key)}
                                            id={`filter-${tab.key}`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="orders-list">
                                    {filteredBookings.length > 0 ? filteredBookings.map(booking => (
                                        <div key={booking.id} className={`order-card order-status-${booking.status}`} id={`order-${booking.id}`}>
                                            <div className="order-card-header">
                                                <div className="order-photographer">
                                                    <img src={booking.photographerAvatar} alt={booking.photographerName} className="avatar" />
                                                    <div>
                                                        <strong>{booking.photographerName}</strong>
                                                        <span>{booking.service}</span>
                                                    </div>
                                                </div>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <div className="order-card-details">
                                                <div className="order-detail">
                                                    <Calendar size={14} />
                                                    <span>{booking.date} – {booking.time}</span>
                                                </div>
                                                <div className="order-detail">
                                                    <MapPin size={14} />
                                                    <span>{booking.location}</span>
                                                </div>
                                            </div>
                                            {booking.note && (
                                                <div className="order-note">
                                                    <span>📝 {booking.note}</span>
                                                </div>
                                            )}
                                            <div className="order-card-footer">
                                                <span className="order-id">{booking.id}</span>
                                                <div className="order-footer-right">
                                                    <strong className="order-total">{formatPrice(booking.total)}</strong>
                                                    <div className="order-actions">
                                                        <button className="btn btn-ghost btn-sm" onClick={() => {
                                                            setSelectedChatUser({ id: booking.grapherId, fullName: booking.photographerName, avatarUrl: booking.photographerAvatar, role: 'Photographer' });
                                                        }}>
                                                            <MessageCircle size={14} /> Liên hệ
                                                        </button>
                                                        {booking.rawStatus === 'Confirmed' && (
                                                            <button className="btn btn-primary btn-sm" onClick={() => handleStartBooking(booking.id)}>
                                                                <CheckCircle size={14} /> Xác nhận đã hoàn tất 
                                                            </button>
                                                        )}
                                                        {booking.status === 'completed' && (
                                                            booking.hasReview ? (
                                                                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                                    <Star size={12} fill="currentColor" /> Đã đánh giá
                                                                </span>
                                                            ) : (
                                                                <button className="btn btn-ghost btn-sm" id={`review-${booking.id}`} onClick={() => handleOpenReview(booking)}>
                                                                    <Star size={14} /> Đánh giá
                                                                </button>
                                                            )
                                                        )}
                                                        {(booking.status === 'confirmed' || booking.status === 'completed') && (
                                                            <button className="btn btn-ghost btn-sm" id={`dispute-${booking.id}`} onClick={() => handleOpenDispute(booking)}>
                                                                <AlertTriangle size={14} /> Khiếu nại
                                                            </button>
                                                        )}
                                                        {booking.status === 'pending' && (
                                                            <button className="btn btn-ghost btn-sm order-cancel-btn" id={`cancel-${booking.id}`} onClick={() => { setSelectedOrder(booking); setShowCancelModal(true); }}>
                                                                <X size={14} /> Hủy
                                                            </button>
                                                        )}
                                                        <button className="btn btn-ghost btn-sm" id={`view-${booking.id}`} onClick={() => handleViewBookingDetails(booking.id)}>
                                                            Chi tiết <ChevronRight size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="dashboard-placeholder">
                                            <Package size={48} />
                                            <h3>Không có đơn hàng</h3>
                                            <p>Không tìm thấy đơn hàng nào với bộ lọc này.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ===== FAVORITES TAB ===== */}
                        {activeTab === 'favorites' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Thợ chụp yêu thích</h2>
                                    <Link to="/explore" className="btn btn-secondary btn-sm" id="dash-find-more">
                                        <Search size={16} /> Tìm thêm
                                    </Link>
                                </div>

                                <div className="favorites-grid" id="favorites-grid">
                                    {favoritePhotographers.map(p => (
                                        <div key={p.id} className="favorite-card" id={`fav-${p.id}`}>
                                            <div className="favorite-cover" style={{ backgroundImage: `url(${p.coverPhoto || 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=400&fit=crop'})` }}>
                                                <button className="favorite-heart-btn active" onClick={async () => {
                                                    try {
                                                        await apiClient.toggleFavorite(p.id);
                                                        toggleFavoriteId(p.id);
                                                        toast.success('Đã bỏ yêu thích');
                                                    } catch (err) {
                                                        toast.error('Lỗi: ' + (err.message || 'Vui lòng thử lại'));
                                                    }
                                                }}>
                                                    <Heart size={18} fill="var(--accent-red)" color="var(--accent-red)" />
                                                </button>
                                                {p.isOnline && <span className="favorite-online">🟢 Online</span>}
                                            </div>
                                            <div className="favorite-info">
                                                <div className="favorite-header">
                                                    <img src={p.avatar} alt={p.name} className="avatar" />
                                                    <div>
                                                        <strong>{p.name}</strong>
                                                        <div className="favorite-meta">
                                                            <Star size={13} fill="var(--accent-gold)" color="var(--accent-gold)" />
                                                            <span>{p.rating}</span>
                                                            <span className="dot">·</span>
                                                            <span>{p.reviewCount} đánh giá</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="favorite-location">
                                                    <MapPin size={13} /> {p.location}
                                                </div>
                                                <div className="favorite-styles">
                                                    {p.styles.map(s => <span key={s} className="tag tag-primary">{s}</span>)}
                                                </div>
                                                <div className="favorite-pricing">
                                                    <span>Từ <strong>{formatPrice(p.pricing.hourly)}</strong>/giờ</span>
                                                </div>
                                                <div className="favorite-actions">
                                                    <Link to={`/photographer/${p.id}`} className="btn btn-secondary btn-sm">
                                                        Xem hồ sơ
                                                    </Link>
                                                    <button onClick={() => {
                                                        setSelectedChatUser({ id: p.userId || '11111111-1111-1111-1111-111111111111', fullName: p.name, avatarUrl: p.avatar, role: 'Photographer' });
                                                    }} className="btn btn-primary btn-sm">
                                                        <MessageCircle size={14} /> Chat
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ===== MESSAGES TAB ===== */}
                        {activeTab === 'messages' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Tin nhắn</h2>
                                </div>

                                <div className="messages-list" id="messages-list">
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
                                            <p>Bạn chưa trò chuyện với thợ chụp ảnh nào.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ===== PROFILE TAB ===== */}
                        {activeTab === 'profile' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Hồ sơ cá nhân</h2>
                                </div>

                                <div className="profile-section">
                                    <div className="profile-avatar-section">
                                        <div className="profile-avatar-large" style={{ position: 'relative' }}>
                                            <img src={profileForm.avatarUrl || user?.avatar || avatarFallback(user?.name)} alt="Avatar" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback(profileForm.fullName || user?.name); }} />
                                            <label className="profile-avatar-edit" style={{ cursor: 'pointer' }}>
                                                <Upload size={16} />
                                                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={isProfileUpdating} />
                                            </label>
                                        </div>
                                        <div className="profile-avatar-info">
                                            <h3>{user?.name || 'Nguyễn Văn Khách'}</h3>
                                            <span className="badge badge-info">Premium Member</span>
                                            <p>Thành viên từ tháng 01/2025</p>
                                        </div>
                                    </div>

                                    <div className="profile-form">
                                        <div className="input-group">
                                            <label><Edit3 size={14} /> Link ảnh đại diện (URL)</label>
                                            <input className="input" type="url" placeholder="Dán link ảnh, hoặc bấm icon tải ảnh ở avatar" value={profileForm.avatarUrl || ''} onChange={(e) => setProfileForm({...profileForm, avatarUrl: e.target.value})} disabled={isProfileUpdating} />
                                        </div>
                                        <div className="profile-form-row">
                                            <div className="input-group">
                                                <label><User size={14} /> Họ tên</label>
                                                <input className="input" value={profileForm.fullName} onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} id="profile-fullname" disabled={isProfileUpdating} />
                                            </div>
                                            <div className="input-group">
                                                <label><Mail size={14} /> Email</label>
                                                <input className="input" defaultValue={user?.email || 'khach@email.com'} id="profile-email" readOnly />
                                            </div>
                                        </div>
                                        <div className="profile-form-row">
                                            <div className="input-group">
                                                <label><Phone size={14} /> Số điện thoại</label>
                                                <input className="input" defaultValue="0909 123 456" id="profile-phone" />
                                            </div>
                                            <div className="input-group">
                                                <label><MapPin size={14} /> Địa chỉ</label>
                                                <input className="input" defaultValue="Quận 1, TP.HCM" id="profile-location" />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label><Edit3 size={14} /> Giới thiệu</label>
                                            <textarea className="input profile-bio" defaultValue="Mình yêu thích chụp ảnh phong cách Hàn Quốc và thường xuyên sử dụng dịch vụ của PICMate." id="profile-bio" rows={4} />
                                        </div>
                                        <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isProfileUpdating || !profileForm.fullName}>
                                            <Check size={16} /> {isProfileUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </div>

                                <div className="membership-card" id="membership-card">
                                    <div className="membership-info">
                                        <div className="membership-icon">
                                            <Crown size={28} />
                                        </div>
                                        <div>
                                            <h3>Premium Member</h3>
                                            <p>Ưu tiên đặt thợ, giảm 10%, book nhanh không chờ duyệt</p>
                                        </div>
                                    </div>
                                    <div className="membership-price">
                                        <span className="membership-cost">99,000đ</span>
                                        <span className="membership-period">/tháng</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ===== SETTINGS TAB ===== */}
                        {activeTab === 'settings' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Cài đặt</h2>
                                </div>

                                <div className="settings-section">
                                    <h3><Bell size={18} /> Thông báo</h3>
                                    <div className="settings-group">
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Cập nhật đơn hàng</strong>
                                                <span>Nhận thông báo khi đơn hàng thay đổi trạng thái</span>
                                            </div>
                                            <button
                                                className={`toggle-switch ${notifBooking ? 'active' : ''}`}
                                                onClick={() => setNotifBooking(!notifBooking)}
                                                id="toggle-booking-notif"
                                            >
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Tin nhắn mới</strong>
                                                <span>Nhận thông báo khi có tin nhắn từ Phone-Grapher</span>
                                            </div>
                                            <button
                                                className={`toggle-switch ${notifMessage ? 'active' : ''}`}
                                                onClick={() => setNotifMessage(!notifMessage)}
                                                id="toggle-message-notif"
                                            >
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Khuyến mãi</strong>
                                                <span>Nhận thông báo về ưu đãi và khuyến mãi đặc biệt</span>
                                            </div>
                                            <button
                                                className={`toggle-switch ${notifPromo ? 'active' : ''}`}
                                                onClick={() => setNotifPromo(!notifPromo)}
                                                id="toggle-promo-notif"
                                            >
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3><Lock size={18} /> Bảo mật</h3>
                                    <div className="settings-group">
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Đổi mật khẩu</strong>
                                                <span>Cập nhật mật khẩu để bảo vệ tài khoản</span>
                                            </div>
                                            <button className="btn btn-ghost btn-sm" id="change-password">
                                                Thay đổi <ChevronRight size={14} />
                                            </button>
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Xác thực 2 bước</strong>
                                                <span>Bảo vệ tài khoản bằng mã OTP qua SMS</span>
                                            </div>
                                            <span className="badge badge-success">Đã bật</span>
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Phiên đăng nhập</strong>
                                                <span>Quản lý các thiết bị đang đăng nhập</span>
                                            </div>
                                            <button className="btn btn-ghost btn-sm" id="manage-sessions">
                                                Quản lý <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3><Shield size={18} /> Quyền riêng tư</h3>
                                    <div className="settings-group">
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Hiển thị hồ sơ công khai</strong>
                                                <span>Cho phép Phone-Grapher xem thông tin của bạn</span>
                                            </div>
                                            <button className="toggle-switch active" id="toggle-public-profile">
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-danger-zone">
                                    <h3>⚠️ Vùng nguy hiểm</h3>
                                    <p>Xóa tài khoản sẽ xóa tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.</p>
                                    <button className="btn btn-ghost btn-sm danger-btn" id="delete-account">
                                        Xóa tài khoản
                                    </button>
                                </div>
                            </>
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
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowOrderDetail(false)}><X size={20} /></button>
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
                                {getStatusBadge(selectedOrder.status)}
                            </div>
                            {selectedOrder.status === 'Cancelled' && selectedOrder.cancellationReason && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '0.5rem', color: 'var(--accent-coral)' }}>
                                    <span>Lý do hủy:</span>
                                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{selectedOrder.cancellationReason}</div>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '1.2rem' }}>
                                <strong>Tổng tiền:</strong>
                                <strong style={{ color: 'var(--primary)' }}>{formatPrice(selectedOrder.totalAmount)}</strong>
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
                            <h3 style={{ margin: 0 }}>Hủy đơn hàng</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowCancelModal(false)}><X size={20} /></button>
                        </div>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Bạn có chắc chắn muốn hủy đơn đặt lịch với <strong>{selectedOrder.photographerName}</strong> không?</p>
                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Lý do hủy (không bắt buộc)</label>
                            <textarea 
                                className="input" 
                                rows={3} 
                                placeholder="Nhập lý do hủy..."
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

            {/* Review Modal */}
            {showReviewModal && reviewOrder && (
                <div className="lightbox" onClick={(e) => { if (e.target.className === 'lightbox') setShowReviewModal(false); }}>
                    <div className="modal-content" style={{ maxWidth: '420px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0 }}>Đánh giá buổi chụp</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowReviewModal(false)}><X size={20} /></button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                            Thợ: <strong>{reviewOrder.photographerName}</strong> · {reviewOrder.service}
                        </p>
                        <div className="review-stars">
                            {[1, 2, 3, 4, 5].map(s => (
                                <button key={s} type="button" className="review-star" onClick={() => setReviewRating(s)} aria-label={`${s} sao`}>
                                    <Star size={32} fill={s <= reviewRating ? 'var(--accent-gold)' : 'none'} color="var(--accent-gold)" />
                                </button>
                            ))}
                        </div>
                        <div className="input-group" style={{ marginTop: '1rem' }}>
                            <label>Nhận xét (không bắt buộc)</label>
                            <textarea
                                className="input"
                                rows={4}
                                placeholder="Chia sẻ cảm nhận của bạn về buổi chụp..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                disabled={isSubmittingReview}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button className="btn btn-ghost" onClick={() => setShowReviewModal(false)} disabled={isSubmittingReview}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSubmitReview} disabled={isSubmittingReview || reviewRating < 1}>
                                {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dispute (Khiếu nại) Modal */}
            {showDisputeModal && disputeOrder && (
                <div className="lightbox" onClick={(e) => { if (e.target.className === 'lightbox') setShowDisputeModal(false); }}>
                    <div className="modal-content" style={{ maxWidth: '440px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0 }}>Gửi khiếu nại</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowDisputeModal(false)}><X size={20} /></button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                            Về đơn với <strong>{disputeOrder.photographerName}</strong> · {disputeOrder.service}
                        </p>
                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label>Mức độ</label>
                            <select className="input" value={disputePriority} onChange={(e) => setDisputePriority(e.target.value)} disabled={isSubmittingDispute}>
                                <option value="Medium">Bình thường</option>
                                <option value="High">Nghiêm trọng</option>
                                <option value="Urgent">Khẩn cấp</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Lý do khiếu nại</label>
                            <textarea
                                className="input"
                                rows={4}
                                placeholder="Mô tả vấn đề bạn gặp phải..."
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                disabled={isSubmittingDispute}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button className="btn btn-ghost" onClick={() => setShowDisputeModal(false)} disabled={isSubmittingDispute}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSubmitDispute} disabled={isSubmittingDispute || !disputeReason.trim()}>
                                {isSubmittingDispute ? 'Đang gửi...' : 'Gửi khiếu nại'}
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
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowProfileModal(false)}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                                <img src={profileForm.avatarUrl || avatarFallback(profileForm.fullName)} alt="Avatar Preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback(profileForm.fullName); }} />
                                <label className="btn btn-primary btn-icon" style={{ position: 'absolute', bottom: 0, right: 0, cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}>
                                    <Upload size={16} />
                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} disabled={isProfileUpdating} />
                                </label>
                            </div>
                            <div className="input-group" style={{ width: '100%' }}>
                                <label>Họ và tên</label>
                                <input className="input" value={profileForm.fullName} onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} disabled={isProfileUpdating} />
                            </div>
                            <div className="input-group" style={{ width: '100%' }}>
                                <label>Hoặc dán link ảnh (URL)</label>
                                <input className="input" type="url" placeholder="https://..." value={profileForm.avatarUrl || ''} onChange={(e) => setProfileForm({...profileForm, avatarUrl: e.target.value})} disabled={isProfileUpdating} />
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
        </div>
    );
}
