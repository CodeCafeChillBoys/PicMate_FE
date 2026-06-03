import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Zap, Clock, MapPin, Shield, Star, Search, Camera,
    CheckCircle, ArrowRight, Sparkles, Filter, ChevronDown,
    Phone, MessageCircle, Navigation, Timer, Users, CreditCard
} from 'lucide-react';
import { photographers, services, formatPrice } from '../data/data';
import './InstantPage.css';

export default function InstantPage() {
    const [selectedService, setSelectedService] = useState(null);
    const [selectedTime, setSelectedTime] = useState('now');
    const [note, setNote] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedPhotographer, setSelectedPhotographer] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update clock every second for live feel
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const instantPhotographers = photographers.filter(p => p.isOnline && p.instantBooking);
    const onlinePhotographers = photographers.filter(p => p.isOnline && !p.instantBooking);

    const timeOptions = [
        { value: 'now', label: 'Ngay bây giờ', icon: <Zap size={16} />, desc: 'Chụp trong 15 phút' },
        { value: '30min', label: '30 phút nữa', icon: <Timer size={16} />, desc: 'Chuẩn bị thêm chút' },
        { value: '1hour', label: '1 giờ nữa', icon: <Clock size={16} />, desc: 'Có thời gian di chuyển' },
    ];

    const handleQuickBook = (photographer) => {
        setSelectedPhotographer(photographer);
        setShowBookingForm(true);
        document.getElementById('quick-booking-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="instant-page">
            {/* ===== HERO ===== */}
            <section className="instant-hero" id="instant-hero">
                <div className="instant-hero-bg">
                    <div className="instant-hero-gradient" />
                    <div className="instant-hero-particles">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="instant-particle" style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${3 + Math.random() * 4}s`,
                            }} />
                        ))}
                    </div>
                    <div className="instant-hero-circles">
                        <div className="instant-hero-circle instant-hero-circle-1" />
                        <div className="instant-hero-circle instant-hero-circle-2" />
                    </div>
                </div>
                <div className="container instant-hero-content">
                    <div className="instant-hero-text animate-fade-in-up">
                        <div className="instant-hero-live-badge">
                            <span className="live-dot" />
                            LIVE • {formatTime(currentTime)}
                        </div>
                        <span className="instant-hero-badge">
                            <Zap size={16} />
                            Instant Booking
                        </span>
                        <h1>
                            Đặt gấp – <span className="gradient-text-instant">Chụp ngay</span>
                        </h1>
                        <p className="instant-hero-subtitle">
                            Như Uber nhưng cho chụp ảnh! Tìm Phone-Grapher đang rảnh gần bạn,
                            book ngay trong <strong>30 giây</strong>. Hoàn hảo cho phố đi bộ, event, cafe hot.
                        </p>
                        <div className="instant-hero-stats">
                            <div className="instant-hero-stat">
                                <div className="instant-stat-icon pulse-green">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <strong>{instantPhotographers.length}</strong>
                                    <span>Thợ sẵn sàng</span>
                                </div>
                            </div>
                            <div className="instant-hero-stat">
                                <div className="instant-stat-icon pulse-coral">
                                    <Timer size={20} />
                                </div>
                                <div>
                                    <strong>~15 phút</strong>
                                    <span>Thời gian phản hồi</span>
                                </div>
                            </div>
                            <div className="instant-hero-stat">
                                <div className="instant-stat-icon pulse-gold">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <strong>100%</strong>
                                    <span>An toàn</span>
                                </div>
                            </div>
                        </div>
                        <a href="#instant-photographers" className="btn btn-coral btn-lg instant-hero-cta">
                            <Zap size={18} /> Tìm thợ Online ngay
                        </a>
                    </div>
                    <div className="instant-hero-visual animate-fade-in">
                        <div className="instant-hero-phone">
                            <div className="instant-hero-phone-screen">
                                <div className="instant-phone-header">
                                    <Zap size={14} />
                                    <span>Thợ gần bạn</span>
                                    <span className="instant-phone-count">{instantPhotographers.length}</span>
                                </div>
                                {instantPhotographers.slice(0, 3).map((p, i) => (
                                    <div key={p.id} className="instant-phone-photographer" style={{ animationDelay: `${0.8 + i * 0.2}s` }}>
                                        <img src={p.avatar} alt={p.name} />
                                        <div className="instant-phone-photographer-info">
                                            <strong>{p.name}</strong>
                                            <span><MapPin size={10} /> {p.location}</span>
                                        </div>
                                        <div className="instant-phone-photographer-action">
                                            <span className="mini-online-dot" />
                                            <span className="instant-mini-price">{formatPrice(p.pricing.hourly)}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="instant-phone-btn">
                                    <Zap size={12} /> Đặt ngay
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="section instant-how-it-works" id="instant-how-it-works">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Cách hoạt động</span>
                        <h2>Book gấp trong <span className="gradient-text">3 bước</span></h2>
                        <p>Nhanh hơn gọi Grab – chỉ cần 30 giây để có thợ chụp chuyên nghiệp.</p>
                    </div>
                    <div className="instant-steps">
                        {[
                            {
                                step: '01',
                                icon: <Search size={28} />,
                                title: 'Tìm thợ Online',
                                desc: 'Xem danh sách Phone-Grapher đang online và sẵn sàng nhận booking ngay.',
                                color: 'var(--primary)',
                                highlight: 'Real-time',
                            },
                            {
                                step: '02',
                                icon: <Zap size={28} />,
                                title: 'Đặt trong 30 giây',
                                desc: 'Chọn dịch vụ, thời gian, gửi booking. Thợ xác nhận ngay lập tức.',
                                color: 'var(--accent-coral)',
                                highlight: 'Instant',
                            },
                            {
                                step: '03',
                                icon: <Camera size={28} />,
                                title: 'Gặp & Chụp',
                                desc: 'Gặp thợ tại địa điểm, chụp ảnh / quay content. Thanh toán an toàn qua escrow.',
                                color: 'var(--accent-green)',
                                highlight: 'Done!',
                            },
                        ].map((item, i) => (
                            <div key={i} className="instant-step-card animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="instant-step-number">{item.step}</div>
                                <div className="instant-step-icon" style={{ background: `${item.color}12`, color: item.color }}>
                                    {item.icon}
                                </div>
                                <span className="instant-step-highlight" style={{ background: `${item.color}18`, color: item.color }}>
                                    {item.highlight}
                                </span>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                                {i < 2 && <div className="instant-step-connector" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== INSTANT PHOTOGRAPHERS ===== */}
            <section className="section instant-photographers-section" id="instant-photographers">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">
                            <span className="live-dot" /> Đang online
                        </span>
                        <h2>Phone-Grapher <span className="gradient-text">sẵn sàng ngay</span></h2>
                        <p>Các thợ chụp đang online và hỗ trợ đặt booking tức thì.</p>
                    </div>

                    <div className="instant-filter-bar">
                        <div className="instant-search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, phong cách, địa điểm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                id="instant-search-input"
                            />
                        </div>
                    </div>

                    <div className="instant-photographers-grid">
                        {instantPhotographers
                            .filter(p =>
                                searchQuery === '' ||
                                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                p.styles.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                            )
                            .map((p, i) => (
                                <div key={p.id} className="instant-photographer-card" style={{ animationDelay: `${i * 0.1}s` }} id={`instant-card-${p.id}`}>
                                    <div className="instant-card-header">
                                        <div className="instant-card-avatar-wrap">
                                            <img src={p.avatar} alt={p.name} className="instant-card-avatar" />
                                            <span className="instant-online-indicator" />
                                        </div>
                                        <div className="instant-card-info">
                                            <div className="instant-card-name-row">
                                                <h4>{p.name}</h4>
                                                {p.isVerified && (
                                                    <CheckCircle size={16} className="instant-verified-icon" />
                                                )}
                                            </div>
                                            <span className="instant-card-location">
                                                <MapPin size={14} /> {p.location}
                                            </span>
                                        </div>
                                        <div className="instant-card-badge">
                                            <Zap size={14} />
                                            <span>Instant</span>
                                        </div>
                                    </div>

                                    <div className="instant-card-tags">
                                        {p.styles.map(s => (
                                            <span key={s} className="tag tag-primary">{s}</span>
                                        ))}
                                    </div>

                                    <p className="instant-card-bio">{p.bio}</p>

                                    <div className="instant-card-meta">
                                        <div className="instant-card-rating">
                                            <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                                            <strong>{p.rating}</strong>
                                            <span>({p.reviewCount})</span>
                                        </div>
                                        <div className="instant-card-price">
                                            từ <strong>{formatPrice(p.pricing.hourly)}</strong>/giờ
                                        </div>
                                    </div>

                                    <div className="instant-card-actions">
                                        <button
                                            className="btn btn-coral btn-sm instant-book-btn"
                                            onClick={() => handleQuickBook(p)}
                                            id={`instant-book-${p.id}`}
                                        >
                                            <Zap size={14} /> Đặt ngay
                                        </button>
                                        <Link to={`/photographer/${p.id}`} className="btn btn-ghost btn-sm" id={`instant-profile-${p.id}`}>
                                            Xem hồ sơ
                                        </Link>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {instantPhotographers.length === 0 && (
                        <div className="instant-empty-state">
                            <div className="instant-empty-icon">
                                <Clock size={48} />
                            </div>
                            <h3>Hiện tại chưa có thợ nào online</h3>
                            <p>Hãy quay lại sau hoặc <Link to="/explore">tìm thợ chụp</Link> để đặt lịch trước.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ===== QUICK BOOKING FORM ===== */}
            {showBookingForm && selectedPhotographer && (
                <section className="section instant-booking-section" id="quick-booking-form">
                    <div className="container">
                        <div className="instant-booking-card card-glass">
                            <div className="instant-booking-header">
                                <div className="instant-booking-photographer">
                                    <img src={selectedPhotographer.avatar} alt={selectedPhotographer.name} className="avatar" />
                                    <div>
                                        <h3>Đặt ngay với {selectedPhotographer.name}</h3>
                                        <span className="instant-booking-location">
                                            <MapPin size={14} /> {selectedPhotographer.location}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="instant-booking-close"
                                    onClick={() => setShowBookingForm(false)}
                                    id="close-booking-form"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="instant-booking-body">
                                {/* Service Selection */}
                                <div className="instant-form-group">
                                    <label>
                                        <Camera size={16} /> Chọn dịch vụ
                                    </label>
                                    <div className="instant-service-options">
                                        {services.map(s => (
                                            <button
                                                key={s.id}
                                                className={`instant-service-option ${selectedService === s.id ? 'active' : ''}`}
                                                onClick={() => setSelectedService(s.id)}
                                                id={`service-option-${s.id}`}
                                            >
                                                <span className="instant-service-icon">{s.icon}</span>
                                                <span className="instant-service-name">{s.name}</span>
                                                <span className="instant-service-desc">{s.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Time Selection */}
                                <div className="instant-form-group">
                                    <label>
                                        <Clock size={16} /> Khi nào bạn muốn chụp?
                                    </label>
                                    <div className="instant-time-options">
                                        {timeOptions.map(t => (
                                            <button
                                                key={t.value}
                                                className={`instant-time-option ${selectedTime === t.value ? 'active' : ''}`}
                                                onClick={() => setSelectedTime(t.value)}
                                                id={`time-option-${t.value}`}
                                            >
                                                <div className="instant-time-icon">{t.icon}</div>
                                                <strong>{t.label}</strong>
                                                <span>{t.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="instant-form-group">
                                    <label>
                                        <MessageCircle size={16} /> Ghi chú (không bắt buộc)
                                    </label>
                                    <textarea
                                        className="instant-note-input input"
                                        placeholder="Concept chụp, outfit, địa điểm mong muốn..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={3}
                                        id="instant-note-input"
                                    />
                                </div>

                                {/* Summary & Confirm */}
                                <div className="instant-booking-summary">
                                    <div className="instant-summary-row">
                                        <span>Dịch vụ</span>
                                        <strong>{selectedService ? services.find(s => s.id === selectedService)?.name : '—'}</strong>
                                    </div>
                                    <div className="instant-summary-row">
                                        <span>Thời gian</span>
                                        <strong>{timeOptions.find(t => t.value === selectedTime)?.label}</strong>
                                    </div>
                                    <div className="instant-summary-row">
                                        <span>Giá từ</span>
                                        <strong className="instant-summary-price">{formatPrice(selectedPhotographer.pricing.hourly)}/giờ</strong>
                                    </div>
                                    <div className="instant-summary-divider" />
                                    <div className="instant-summary-row instant-summary-note">
                                        <Shield size={14} />
                                        <span>Thanh toán an toàn qua hệ thống escrow PICMate</span>
                                    </div>
                                </div>

                                <Link
                                    to={`/booking/${selectedPhotographer.id}`}
                                    className="btn btn-coral btn-lg instant-confirm-btn"
                                    id="instant-confirm-btn"
                                >
                                    <Zap size={18} /> Xác nhận đặt ngay
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ===== ALL ONLINE PHOTOGRAPHERS ===== */}
            {onlinePhotographers.length > 0 && (
                <section className="section instant-all-online-section" id="all-online-photographers">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-label">Cũng đang online</span>
                            <h2>Phone-Grapher <span className="gradient-text">đang hoạt động</span></h2>
                            <p>Các thợ chụp đang online – đặt lịch thường (cần xác nhận từ thợ).</p>
                        </div>
                        <div className="instant-online-grid">
                            {onlinePhotographers.map((p, i) => (
                                <Link to={`/photographer/${p.id}`} key={p.id} className="instant-online-card" style={{ animationDelay: `${i * 0.1}s` }} id={`online-card-${p.id}`}>
                                    <div className="instant-online-card-left">
                                        <div className="instant-online-avatar-wrap">
                                            <img src={p.avatar} alt={p.name} />
                                            <span className="instant-online-indicator" />
                                        </div>
                                    </div>
                                    <div className="instant-online-card-body">
                                        <div className="instant-online-name-row">
                                            <h4>{p.name}</h4>
                                            {p.isVerified && <CheckCircle size={14} className="instant-verified-icon" />}
                                        </div>
                                        <span className="instant-online-location"><MapPin size={12} /> {p.location}</span>
                                        <div className="instant-online-tags">
                                            {p.styles.slice(0, 2).map(s => (
                                                <span key={s} className="tag tag-primary">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="instant-online-card-right">
                                        <div className="instant-online-rating">
                                            <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                                            <strong>{p.rating}</strong>
                                        </div>
                                        <div className="instant-online-price">{formatPrice(p.pricing.hourly)}/h</div>
                                        <span className="btn btn-primary btn-sm">Xem</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== CTA ===== */}
            <section className="section instant-cta-section" id="instant-cta">
                <div className="container">
                    <div className="instant-cta-card">
                        <div className="instant-cta-content">
                            <h2>Không tìm thấy thợ phù hợp? <span className="gradient-text">Đặt lịch trước</span></h2>
                            <p>Duyệt tất cả Phone-Grapher, chọn lịch và phong cách yêu thích của bạn.</p>
                            <div className="instant-cta-buttons">
                                <Link to="/explore" className="btn btn-primary btn-lg" id="instant-cta-explore">
                                    <Search size={18} /> Tìm tất cả thợ chụp
                                </Link>
                                <Link to="/auth?role=photographer" className="btn btn-secondary btn-lg" id="instant-cta-register">
                                    Trở thành Phone-Grapher
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
