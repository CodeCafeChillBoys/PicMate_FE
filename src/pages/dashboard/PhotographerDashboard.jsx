import { useState, useEffect } from 'react';
import {
    Camera, DollarSign, TrendingUp, Clock, Package, Users, Settings, LogOut,
    Eye, ToggleLeft, ToggleRight, Star, MapPin, Calendar, CheckCircle, Zap, Image,
    XCircle, MessageCircle, Upload, Heart, Trash2, Filter, Plus, Maximize2
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient, formatPrice } from '../../services/apiClient';
import { API_BASE_URL } from '../../services/http';
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
    const { user } = useAuth();
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

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

        fetchConversations();
        return () => { cancelled = true; };
    }, [user]);

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

    const getOrderActions = (booking) => {
        switch (booking.status) {
            case 'pending':
                return (
                    <div className="order-actions">
                        <button className="btn btn-primary btn-sm">
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
                        <button className="btn btn-primary btn-sm">
                            <CheckCircle size={14} /> Hoàn thành
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedChatUser({ id: '22222222-2222-2222-2222-222222222222', fullName: 'Khách hàng', role: 'Customer' })}>
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
                        <button className="btn btn-primary btn-sm">
                            <CheckCircle size={14} /> Hoàn thành
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
                            <img src={user?.avatar || 'https://via.placeholder.com/200?text=Avatar'} alt={user?.name || 'Photographer'} className="avatar-lg" />
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
                                <div className="portfolio-upload-zone" id="portfolio-upload">
                                    <Upload size={36} />
                                    <h4>Kéo thả ảnh vào đây hoặc nhấn để chọn</h4>
                                    <p>Hỗ trợ JPG, PNG, WEBP — Tối đa 10MB mỗi ảnh</p>
                                    <button className="btn btn-ghost btn-sm">Chọn từ máy tính</button>
                                </div>

                                {/* Category Filter */}
                                <div className="portfolio-filter">
                                    <Filter size={16} />
                                    {['Tất cả', 'Chân dung', 'Phong cảnh', 'Sự kiện', 'Sản phẩm'].map((cat, i) => (
                                        <button key={i} className={`order-filter-tab ${i === 0 ? 'active' : ''}`}>{cat}</button>
                                    ))}
                                    <span className="filter-count">12 ảnh</span>
                                </div>

                                {/* Photo Grid */}
                                <div className="portfolio-grid">
                                    {[
                                        { id: 1, src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=300&fit=crop', cat: 'Chân dung', likes: 128, views: 1240, isCover: true },
                                        { id: 2, src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop', cat: 'Phong cảnh', likes: 87, views: 920, isCover: false },
                                        { id: 3, src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop', cat: 'Sự kiện', likes: 56, views: 680, isCover: false },
                                        { id: 4, src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop', cat: 'Chân dung', likes: 203, views: 2100, isCover: false },
                                        { id: 5, src: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop', cat: 'Sản phẩm', likes: 41, views: 540, isCover: false },
                                        { id: 6, src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop', cat: 'Chân dung', likes: 165, views: 1800, isCover: false },
                                        { id: 7, src: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=400&h=300&fit=crop', cat: 'Phong cảnh', likes: 92, views: 1050, isCover: false },
                                        { id: 8, src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop', cat: 'Sự kiện', likes: 74, views: 830, isCover: false },
                                        { id: 9, src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop', cat: 'Chân dung', likes: 189, views: 1950, isCover: false },
                                        { id: 10, src: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&h=300&fit=crop', cat: 'Phong cảnh', likes: 113, views: 1320, isCover: false },
                                        { id: 11, src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', cat: 'Sản phẩm', likes: 67, views: 710, isCover: false },
                                        { id: 12, src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', cat: 'Sự kiện', likes: 95, views: 1100, isCover: false },
                                    ].map(photo => (
                                        <div key={photo.id} className={`portfolio-photo-card ${photo.isCover ? 'is-cover' : ''}`}>
                                            <div className="portfolio-photo-img">
                                                <img src={photo.src} alt={`Portfolio ${photo.id}`} />
                                                <div className="portfolio-photo-overlay">
                                                    <button className="photo-overlay-btn" title="Xem phóng to"><Maximize2 size={16} /></button>
                                                    <button className="photo-overlay-btn photo-delete-btn" title="Xóa ảnh"><Trash2 size={16} /></button>
                                                </div>
                                                {photo.isCover && <span className="portfolio-cover-badge">⭐ Ảnh bìa</span>}
                                            </div>
                                            <div className="portfolio-photo-info">
                                                <span className="tag tag-primary">{photo.cat}</span>
                                                <div className="portfolio-photo-stats">
                                                    <span><Heart size={12} /> {photo.likes}</span>
                                                    <span><Eye size={12} /> {photo.views}</span>
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
                    <div className="modal-content" style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
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
                    <div className="modal-content" style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
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
        </div>
    );
}
