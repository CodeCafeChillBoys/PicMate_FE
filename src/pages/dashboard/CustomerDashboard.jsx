import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    User, Clock, Camera, Settings, LogOut, Star, MapPin,
    MessageCircle, Calendar, Package, CreditCard, ChevronRight,
    Heart, Bell, Shield, Lock, Crown, Zap, Eye, Search,
    Phone, Mail, Edit3, Upload, Check, X, Send
} from 'lucide-react';
import { mockBookings, bookingStatuses, formatPrice, photographers, favoritePhotographerIds, mockMessages } from '../../data/data';
import './CustomerDashboard.css';

export default function CustomerDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [orderFilter, setOrderFilter] = useState('all');
    const [notifBooking, setNotifBooking] = useState(true);
    const [notifMessage, setNotifMessage] = useState(true);
    const [notifPromo, setNotifPromo] = useState(false);

    const getStatusBadge = (status) => {
        const s = bookingStatuses.find(b => b.key === status);
        return <span className={`badge badge-${s?.color}`}>{s?.label}</span>;
    };

    const filteredBookings = orderFilter === 'all'
        ? mockBookings
        : mockBookings.filter(b => b.status === orderFilter);

    const favoritePhotographers = photographers.filter(p => favoritePhotographerIds.includes(p.id));

    const userStats = [
        { label: 'Tổng đơn hàng', value: '12', icon: <Package size={20} />, color: 'var(--primary)' },
        { label: 'Đã chi tiêu', value: '2,400,000đ', icon: <CreditCard size={20} />, color: 'var(--accent-coral)' },
        { label: 'Thợ yêu thích', value: '3', icon: <Heart size={20} />, color: '#e84393' },
        { label: 'Đánh giá đã gửi', value: '8', icon: <Star size={20} />, color: 'var(--accent-gold)' },
    ];

    const orderFilterTabs = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ xác nhận' },
        { key: 'confirmed', label: 'Đã nhận' },
        { key: 'completed', label: 'Hoàn thành' },
        { key: 'cancelled', label: 'Đã hủy' },
    ];

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-layout">
                    {/* Sidebar */}
                    <aside className="dashboard-sidebar">
                        <div className="dashboard-profile">
                            <div className="profile-avatar-wrapper">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" alt="User" className="avatar-lg" />
                                <span className="profile-online-dot"></span>
                            </div>
                            <h3>Nguyễn Văn Khách</h3>
                            <span className="badge badge-info">👤 Khách hàng</span>
                            <div className="profile-membership">
                                <Crown size={14} />
                                <span>Premium Member</span>
                            </div>
                        </div>
                        <nav className="dashboard-nav">
                            {[
                                { key: 'overview', icon: <Eye size={18} />, label: 'Tổng quan' },
                                { key: 'orders', icon: <Package size={18} />, label: 'Đơn hàng', badge: 3 },
                                { key: 'favorites', icon: <Heart size={18} />, label: 'Yêu thích' },
                                { key: 'messages', icon: <MessageCircle size={18} />, label: 'Tin nhắn', badge: 3 },
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
                                    {item.badge && <span className="nav-badge">{item.badge}</span>}
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
                                        <h2>Chào mừng trở lại, <span className="gradient-text">Khách</span>! 👋</h2>
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
                                        {mockBookings.slice(0, 2).map(booking => (
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
                                                        {booking.status === 'completed' && (
                                                            <button className="btn btn-ghost btn-sm" id={`review-${booking.id}`}>
                                                                <Star size={14} /> Đánh giá
                                                            </button>
                                                        )}
                                                        {booking.status === 'pending' && (
                                                            <button className="btn btn-ghost btn-sm order-cancel-btn" id={`cancel-${booking.id}`}>
                                                                <X size={14} /> Hủy
                                                            </button>
                                                        )}
                                                        <button className="btn btn-ghost btn-sm" id={`view-${booking.id}`}>
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
                                            <div className="favorite-cover" style={{ backgroundImage: `url(${p.coverPhoto})` }}>
                                                <button className="favorite-heart-btn active">
                                                    <Heart size={18} fill="currentColor" />
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
                                                    <Link to={`/booking/${p.id}`} className="btn btn-primary btn-sm">
                                                        <Camera size={14} /> Đặt lịch
                                                    </Link>
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
                                    {mockMessages.map(msg => (
                                        <div key={msg.id} className={`message-item ${msg.unread > 0 ? 'unread' : ''}`} id={`msg-${msg.id}`}>
                                            <div className="message-avatar-wrap">
                                                {msg.avatar ? (
                                                    <img src={msg.avatar} alt={msg.name} className="avatar" />
                                                ) : (
                                                    <div className="avatar message-system-avatar">
                                                        <MessageCircle size={20} />
                                                    </div>
                                                )}
                                                {msg.online && <span className="msg-online-dot"></span>}
                                            </div>
                                            <div className="message-content">
                                                <div className="message-top">
                                                    <strong>{msg.name}</strong>
                                                    <span className="message-time">{msg.time}</span>
                                                </div>
                                                <p className="message-preview">{msg.lastMessage}</p>
                                            </div>
                                            {msg.unread > 0 && (
                                                <span className="message-unread-badge">{msg.unread}</span>
                                            )}
                                        </div>
                                    ))}
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
                                        <div className="profile-avatar-large">
                                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face" alt="Avatar" />
                                            <button className="profile-avatar-edit" id="profile-change-avatar">
                                                <Upload size={16} />
                                            </button>
                                        </div>
                                        <div className="profile-avatar-info">
                                            <h3>Nguyễn Văn Khách</h3>
                                            <span className="badge badge-info">Premium Member</span>
                                            <p>Thành viên từ tháng 01/2025</p>
                                        </div>
                                    </div>

                                    <div className="profile-form">
                                        <div className="profile-form-row">
                                            <div className="input-group">
                                                <label><User size={14} /> Họ tên</label>
                                                <input className="input" defaultValue="Nguyễn Văn Khách" id="profile-fullname" />
                                            </div>
                                            <div className="input-group">
                                                <label><Mail size={14} /> Email</label>
                                                <input className="input" defaultValue="khach@email.com" id="profile-email" />
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
                                        <button className="btn btn-primary" id="dash-save-profile">
                                            <Check size={16} /> Lưu thay đổi
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
        </div>
    );
}
