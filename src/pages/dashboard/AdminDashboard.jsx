import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, Users, Camera, Package, DollarSign, Shield,
    Settings, LogOut, TrendingUp, AlertTriangle, CheckCircle, XCircle,
    Eye, UserCheck, UserX, Search, Filter, ChevronRight, BarChart3,
    Clock, Ban, RefreshCw, Bell, CreditCard, Globe, Zap,
    Star, MapPin, Calendar, ArrowUpRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react';
import { photographers, mockBookings, mockUsers, mockDisputes, mockActivities, bookingStatuses, formatPrice } from '../../data/data';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [userFilter, setUserFilter] = useState('all');
    const [userSearch, setUserSearch] = useState('');
    const [orderFilter, setOrderFilter] = useState('all');

    const adminStats = [
        { label: 'Tổng người dùng', value: '12,450', icon: <Users size={20} />, color: 'var(--primary)', change: '+12%', up: true },
        { label: 'Phone-Graphers', value: '2,500', icon: <Camera size={20} />, color: 'var(--accent-coral)', change: '+8%', up: true },
        { label: 'Đơn hàng tháng', value: '3,240', icon: <Package size={20} />, color: 'var(--accent-green)', change: '+23%', up: true },
        { label: 'Doanh thu tháng', value: '486M đ', icon: <DollarSign size={20} />, color: 'var(--accent-gold)', change: '+18%', up: true },
    ];

    const pendingPhotographers = [
        { id: 101, name: 'Trần Đình Hoàng', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', styles: ['Cá tính', 'Vintage'], portfolio: 8, location: 'Quận 1, TP.HCM', appliedDate: '2025-12-15' },
        { id: 102, name: 'Lê Thị Mai', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', styles: ['Hàn Quốc', 'Minimal'], portfolio: 12, location: 'Quận 3, TP.HCM', appliedDate: '2025-12-18' },
        { id: 103, name: 'Ngô Đức Thịnh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', styles: ['Lifestyle', 'Cá tính'], portfolio: 6, location: 'Quận 7, TP.HCM', appliedDate: '2025-12-20' },
    ];

    const revenueData = [40, 55, 45, 70, 65, 80, 60, 90, 75, 95, 85, 88];
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

    const filteredUsers = mockUsers.filter(u => {
        const matchesFilter = userFilter === 'all' || u.type === (userFilter === 'customer' ? 'Khách hàng' : 'Phone-Grapher');
        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filteredOrders = orderFilter === 'all'
        ? mockBookings
        : mockBookings.filter(b => b.status === orderFilter);

    const getStatusBadge = (status) => {
        const s = bookingStatuses.find(b => b.key === status);
        return <span className={`badge badge-${s?.color}`}>{s?.label}</span>;
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            urgent: { bg: 'rgba(255, 107, 107, 0.1)', color: 'var(--accent-coral)', label: '🔴 Khẩn cấp' },
            high: { bg: 'rgba(253, 203, 110, 0.15)', color: '#e17e00', label: '🟠 Cao' },
            medium: { bg: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary)', label: '🔵 Trung bình' },
        };
        const s = styles[priority];
        return <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
    };

    return (
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
                                { key: 'users', icon: <Users size={18} />, label: 'Người dùng', badge: 12 },
                                { key: 'photographers', icon: <Camera size={18} />, label: 'Phone-Graphers', badge: 3 },
                                { key: 'orders', icon: <Package size={18} />, label: 'Đơn hàng' },
                                { key: 'disputes', icon: <AlertTriangle size={18} />, label: 'Tranh chấp', badge: 2 },
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
                                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                                </button>
                            ))}
                            <button className="dashboard-nav-item dashboard-logout">
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
                                        <span>Tháng 12, 2025</span>
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
                                                <div className="stat-value-row">
                                                    <strong className="stat-value">{stat.value}</strong>
                                                    <span className={`stat-change ${stat.up ? 'positive' : 'negative'}`}>
                                                        {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                        {stat.change}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Revenue Chart */}
                                <div className="admin-chart-card" id="revenue-chart">
                                    <div className="chart-header">
                                        <div>
                                            <h3><BarChart3 size={18} /> Doanh thu 12 tháng</h3>
                                            <p>Tổng doanh thu bao gồm phí platform</p>
                                        </div>
                                        <div className="chart-summary">
                                            <span className="chart-total">5.8 tỷ đ</span>
                                            <span className="stat-change positive"><ArrowUpRight size={14} /> +18%</span>
                                        </div>
                                    </div>
                                    <div className="chart-bars-container">
                                        {revenueData.map((h, i) => (
                                            <div key={i} className="chart-bar-wrapper">
                                                <div className="chart-bar" style={{ height: `${h}%` }}>
                                                    <span className="chart-bar-tooltip">{Math.round(h * 5.8)}M đ</span>
                                                </div>
                                                <span className="chart-bar-label">{months[i]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Activity Feed & Quick Actions */}
                                <div className="admin-overview-grid">
                                    <div className="activity-feed-card">
                                        <div className="card-header-row">
                                            <h3>📊 Hoạt động gần đây</h3>
                                        </div>
                                        <div className="activity-list">
                                            {mockActivities.map(a => (
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
                                                <span className="qa-count">3</span>
                                            </button>
                                            <button className="quick-action-btn" onClick={() => setActiveTab('disputes')}>
                                                <div className="qa-icon" style={{ background: 'rgba(253, 203, 110, 0.15)', color: '#e17e00' }}>
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <span>Xử lý tranh chấp</span>
                                                <span className="qa-count">2</span>
                                            </button>
                                            <button className="quick-action-btn" onClick={() => setActiveTab('users')}>
                                                <div className="qa-icon" style={{ background: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary)' }}>
                                                    <Users size={20} />
                                                </div>
                                                <span>Quản lý người dùng</span>
                                                <span className="qa-count">12.4K</span>
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
                                        { key: 'customer', label: 'Khách hàng' },
                                        { key: 'photographer', label: 'Phone-Grapher' },
                                    ].map(f => (
                                        <button
                                            key={f.key}
                                            className={`order-filter-tab ${userFilter === f.key ? 'active' : ''}`}
                                            onClick={() => setUserFilter(f.key)}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                    <span className="filter-count">{filteredUsers.length} người dùng</span>
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
                                            {filteredUsers.map(u => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <div className="user-cell-avatar">{u.name.charAt(0)}</div>
                                                            <strong>{u.name}</strong>
                                                        </div>
                                                    </td>
                                                    <td className="td-email">{u.email}</td>
                                                    <td>
                                                        <span className={`badge ${u.type === 'Phone-Grapher' ? 'badge-info' : 'badge-success'}`}>
                                                            {u.type}
                                                        </span>
                                                    </td>
                                                    <td className="td-date">{u.joinDate}</td>
                                                    <td className="td-num">{u.totalBookings}</td>
                                                    <td>
                                                        <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                                                            {u.active ? '✅ Hoạt động' : '🔒 Bị khóa'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="table-actions">
                                                            <button className="table-action-btn" title="Xem chi tiết" id={`view-user-${u.id}`}>
                                                                <Eye size={15} />
                                                            </button>
                                                            <button
                                                                className={`table-action-btn ${u.active ? 'action-danger' : 'action-success'}`}
                                                                title={u.active ? 'Khóa tài khoản' : 'Mở khóa'}
                                                                id={`toggle-user-${u.id}`}
                                                            >
                                                                {u.active ? <Ban size={15} /> : <CheckCircle size={15} />}
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
                                    <h3>⏳ Hàng đợi duyệt ({pendingPhotographers.length})</h3>
                                    <div className="pending-list">
                                        {pendingPhotographers.map(p => (
                                            <div key={p.id} className="pending-card" id={`pending-${p.id}`}>
                                                <div className="pending-info">
                                                    <img src={p.avatar} alt={p.name} className="avatar" />
                                                    <div>
                                                        <strong>{p.name}</strong>
                                                        <span><MapPin size={12} /> {p.location}</span>
                                                        <span><Calendar size={12} /> Đăng ký: {p.appliedDate}</span>
                                                    </div>
                                                </div>
                                                <div className="pending-detail">
                                                    <div className="pending-tags">
                                                        {p.styles.map(s => <span key={s} className="tag tag-primary">{s}</span>)}
                                                    </div>
                                                    <span className="pending-portfolio">📷 {p.portfolio} ảnh portfolio</span>
                                                </div>
                                                <div className="pending-actions">
                                                    <button className="btn btn-ghost btn-sm" id={`view-portfolio-${p.id}`}>
                                                        <Eye size={14} /> Xem portfolio
                                                    </button>
                                                    <button className="btn btn-primary btn-sm" id={`approve-${p.id}`}>
                                                        <CheckCircle size={14} /> Duyệt
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm reject-btn" id={`reject-${p.id}`}>
                                                        <XCircle size={14} /> Từ chối
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Photographers */}
                                <div className="admin-section">
                                    <h3>✅ Phone-Graphers đang hoạt động ({photographers.length})</h3>
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
                                                {photographers.map(p => (
                                                    <tr key={p.id}>
                                                        <td>
                                                            <div className="user-cell">
                                                                <img src={p.avatar} alt={p.name} className="avatar" style={{ width: 32, height: 32 }} />
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
                                                            <span className={`badge ${p.isOnline ? 'badge-success' : 'badge-warning'}`}>
                                                                {p.isOnline ? '🟢 Online' : '⚫ Offline'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {p.isVerified
                                                                ? <span className="badge badge-info">✅ Verified</span>
                                                                : <span className="badge badge-warning">⏳ Chưa</span>
                                                            }
                                                        </td>
                                                        <td>
                                                            <div className="table-actions">
                                                                <button className="table-action-btn" title="Xem chi tiết">
                                                                    <Eye size={15} />
                                                                </button>
                                                                <button className="table-action-btn action-danger" title="Tạm khóa">
                                                                    <Ban size={15} />
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
                                            <Package size={14} /> Tổng: <strong>{mockBookings.length}</strong>
                                        </span>
                                        <span className="summary-badge revenue">
                                            <DollarSign size={14} /> Doanh thu: <strong>{formatPrice(mockBookings.reduce((s, b) => s + b.total, 0))}</strong>
                                        </span>
                                    </div>
                                </div>

                                <div className="admin-filter-row">
                                    {[
                                        { key: 'all', label: 'Tất cả' },
                                        { key: 'pending', label: 'Chờ xác nhận' },
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
                                            {filteredOrders.map(b => (
                                                <tr key={b.id}>
                                                    <td><code className="order-code">{b.id}</code></td>
                                                    <td>
                                                        <div className="user-cell">
                                                            <img src={b.photographerAvatar} alt={b.photographerName} className="avatar" style={{ width: 28, height: 28 }} />
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
                                                            <button className="table-action-btn" title="Xem chi tiết">
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
                                            <AlertTriangle size={14} /> Đang chờ: <strong>{mockDisputes.filter(d => d.status === 'pending').length}</strong>
                                        </span>
                                    </div>
                                </div>

                                <div className="disputes-list">
                                    {mockDisputes.map(d => (
                                        <div key={d.id} className={`dispute-card priority-${d.priority}`} id={`dispute-${d.id}`}>
                                            <div className="dispute-header">
                                                <div className="dispute-id-row">
                                                    <code className="order-code">{d.id}</code>
                                                    {getPriorityBadge(d.priority)}
                                                    {d.status === 'resolved'
                                                        ? <span className="badge badge-success">✅ Đã xử lý</span>
                                                        : <span className="badge badge-warning">⏳ Đang chờ</span>
                                                    }
                                                </div>
                                                <span className="dispute-date"><Calendar size={13} /> {d.date}</span>
                                            </div>

                                            <div className="dispute-parties">
                                                <div className="dispute-party">
                                                    <img src={d.reporterAvatar} alt={d.reporter} className="avatar" />
                                                    <div>
                                                        <span className="party-role">Người báo cáo</span>
                                                        <strong>{d.reporter}</strong>
                                                    </div>
                                                </div>
                                                <span className="dispute-vs">VS</span>
                                                <div className="dispute-party">
                                                    <img src={d.againstAvatar} alt={d.against} className="avatar" />
                                                    <div>
                                                        <span className="party-role">Bị báo cáo</span>
                                                        <strong>{d.against}</strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="dispute-reason">
                                                <p>📝 {d.reason}</p>
                                            </div>

                                            <div className="dispute-footer">
                                                <div className="dispute-amount">
                                                    <DollarSign size={14} /> Giá trị đơn: <strong>{formatPrice(d.amount)}</strong>
                                                </div>
                                                {d.status === 'pending' && (
                                                    <div className="dispute-actions">
                                                        <button className="btn btn-ghost btn-sm" id={`dispute-refund-${d.id}`}>
                                                            <RefreshCw size={14} /> Hoàn tiền
                                                        </button>
                                                        <button className="btn btn-ghost btn-sm" id={`dispute-warn-${d.id}`}>
                                                            <AlertTriangle size={14} /> Cảnh báo
                                                        </button>
                                                        <button className="btn btn-primary btn-sm" id={`dispute-resolve-${d.id}`}>
                                                            <CheckCircle size={14} /> Giải quyết
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ===== SETTINGS TAB ===== */}
                        {activeTab === 'settings' && (
                            <>
                                <div className="dashboard-content-header">
                                    <h2>Cài đặt hệ thống</h2>
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
                                                <input type="number" className="input setting-number-input" defaultValue="15" id="platform-fee" />
                                                <span className="input-suffix">%</span>
                                            </div>
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Phí rút tiền tối thiểu</strong>
                                                <span>Số tiền tối thiểu để Phone-Grapher rút</span>
                                            </div>
                                            <div className="setting-input-group">
                                                <input type="number" className="input setting-number-input" defaultValue="200000" id="min-withdrawal" />
                                                <span className="input-suffix">đ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3><CreditCard size={18} /> Thanh toán</h3>
                                    <div className="settings-group">
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>MoMo Payment</strong>
                                                <span>Thanh toán qua ví MoMo</span>
                                            </div>
                                            <button className="toggle-switch active" id="toggle-momo">
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>VNPay</strong>
                                                <span>Thanh toán qua VNPay (ATM, Visa, QR)</span>
                                            </div>
                                            <button className="toggle-switch active" id="toggle-vnpay">
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>ZaloPay</strong>
                                                <span>Thanh toán qua ZaloPay</span>
                                            </div>
                                            <button className="toggle-switch" id="toggle-zalopay">
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3><Bell size={18} /> Thông báo hệ thống</h3>
                                    <div className="settings-group">
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Email thông báo đơn mới</strong>
                                                <span>Gửi email cho admin khi có đơn hàng mới</span>
                                            </div>
                                            <button className="toggle-switch active" id="toggle-email-notif">
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <strong>Cảnh báo tranh chấp</strong>
                                                <span>Thông báo ngay khi có tranh chấp mới</span>
                                            </div>
                                            <button className="toggle-switch active" id="toggle-dispute-notif">
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
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
                                            <button className="toggle-switch" id="toggle-maintenance">
                                                <span className="toggle-knob" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-save-row">
                                    <button className="btn btn-primary" id="admin-save-settings">
                                        <CheckCircle size={16} /> Lưu cài đặt
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
