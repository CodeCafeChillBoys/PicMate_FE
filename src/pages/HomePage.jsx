import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Camera, Star, MapPin, Clock, Zap, Shield, CreditCard,
    ChevronRight, ArrowRight, Sparkles, Users, TrendingUp, Play,
    CheckCircle, Crown, Heart, Download, Eye
} from 'lucide-react';
import { photographers, styles, testimonials, presets, membershipPlans, formatPrice } from '../data/data';
import './HomePage.css';

export default function HomePage() {
    const [activeStyle, setActiveStyle] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="home-page">
            {/* ===== HERO ===== */}
            <section className="hero" id="hero-section">
                <div className="hero-bg">
                    <div className="hero-gradient" />
                    <div className="hero-circles">
                        <div className="hero-circle hero-circle-1" />
                        <div className="hero-circle hero-circle-2" />
                        <div className="hero-circle hero-circle-3" />
                    </div>
                </div>
                <div className="container hero-content">
                    <div className="hero-text animate-fade-in-up">
                        <span className="hero-badge">
                            <Sparkles size={14} />
                            #1 Phone-Grapher Platform in Vietnam
                        </span>
                        <h1>
                            Biến khoảnh khắc thành <span className="gradient-text">tác phẩm nghệ thuật</span>
                        </h1>
                        <p className="hero-subtitle">
                            Kết nối với hàng ngàn Phone-Grapher tài năng. Đặt lịch chụp ảnh, quay TikTok, edit ảnh chỉ trong vài giây.
                        </p>
                        <div className="hero-search">
                            <div className="hero-search-input">
                                <Search size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm theo phong cách, địa điểm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    id="hero-search-input"
                                />
                            </div>
                            <Link to={`/explore?q=${searchQuery}`} className="btn btn-primary btn-lg" id="hero-search-btn">
                                Tìm thợ chụp
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <strong>2,500+</strong>
                                <span>Phone-Graphers</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <strong>50,000+</strong>
                                <span>Ảnh đã chụp</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <strong>4.9 ⭐</strong>
                                <span>Đánh giá TB</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual animate-fade-in">
                        <div className="hero-cards">
                            {photographers.slice(0, 3).map((p, i) => (
                                <div key={p.id} className={`hero-photographer-card hero-card-${i + 1}`}>
                                    <img src={p.avatar} alt={p.name} />
                                    <div className="hero-card-info">
                                        <strong>{p.name}</strong>
                                        <span><Star size={12} fill="currentColor" /> {p.rating}</span>
                                    </div>
                                    {p.isOnline && <span className="online-dot" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="section how-it-works" id="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Cách hoạt động</span>
                        <h2>Đặt lịch chụp ảnh trong <span className="gradient-text">3 bước</span></h2>
                        <p>Quy trình đơn giản, nhanh chóng, an toàn với hệ thống escrow bảo vệ cả hai bên.</p>
                    </div>
                    <div className="steps-grid">
                        {[
                            { icon: <Search size={32} />, title: "Tìm & Chọn", desc: "Tìm Phone-Grapher theo phong cách, địa điểm, giá. Xem portfolio và review thực tế.", color: "var(--primary)" },
                            { icon: <CreditCard size={32} />, title: "Đặt lịch & Thanh toán", desc: "Chọn ngày giờ, dịch vụ. Thanh toán an toàn – tiền được giữ escrow cho đến khi hoàn thành.", color: "var(--accent-coral)" },
                            { icon: <Camera size={32} />, title: "Chụp & Nhận ảnh", desc: "Gặp thợ, chụp ảnh / quay content. Nhận ảnh đẹp lung linh và bấm \"Hoàn thành\"!", color: "var(--accent-green)" },
                        ].map((step, i) => (
                            <div key={i} className="step-card animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
                                <div className="step-icon" style={{ background: `${step.color}15`, color: step.color }}>
                                    {step.icon}
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURED PHONE-GRAPHERS ===== */}
            <section className="section featured-section" id="featured-photographers">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Phone-Graphers nổi bật</span>
                        <h2>Thợ chụp <span className="gradient-text">hàng đầu</span></h2>
                        <p>Được yêu thích và đánh giá cao nhất bởi cộng đồng PICMate.</p>
                    </div>
                    <div className="featured-grid">
                        {photographers.slice(0, 4).map((p, i) => (
                            <Link to={`/photographer/${p.id}`} key={p.id} className="photographer-card" id={`photographer-card-${p.id}`} style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="photographer-card-img">
                                    <img src={p.portfolio[0]} alt={p.name} />
                                    <div className="photographer-card-overlay">
                                        <span className="btn btn-sm btn-primary">Xem hồ sơ</span>
                                    </div>
                                    {p.isOnline && (
                                        <span className="photographer-online-badge">
                                            <span className="online-pulse" /> Online
                                        </span>
                                    )}
                                    {p.isVerified && (
                                        <span className="photographer-verified-badge">
                                            <CheckCircle size={14} /> Verified
                                        </span>
                                    )}
                                </div>
                                <div className="photographer-card-body">
                                    <div className="photographer-card-header">
                                        <img src={p.avatar} alt={p.name} className="avatar" />
                                        <div>
                                            <h4>{p.name}</h4>
                                            <span className="photographer-card-location">
                                                <MapPin size={14} /> {p.location}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="photographer-card-tags">
                                        {p.styles.map(s => (
                                            <span key={s} className="tag tag-primary">{s}</span>
                                        ))}
                                    </div>
                                    <div className="photographer-card-footer">
                                        <span className="photographer-card-rating">
                                            <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                                            <strong>{p.rating}</strong>
                                            <span>({p.reviewCount})</span>
                                        </span>
                                        <span className="photographer-card-price">
                                            từ <strong>{formatPrice(p.pricing.hourly)}</strong>/giờ
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="section-cta">
                        <Link to="/explore" className="btn btn-secondary btn-lg" id="view-all-photographers">
                            Xem tất cả Phone-Graphers <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== STYLE TAGS ===== */}
            <section className="section styles-section" id="style-tags">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Phong cách</span>
                        <h2>Chọn phong cách <span className="gradient-text">yêu thích</span></h2>
                        <p>Từ Hàn Quốc minimal đến vintage cá tính – tìm Phone-Grapher phù hợp với gu của bạn.</p>
                    </div>
                    <div className="styles-grid">
                        {styles.map((style, i) => (
                            <Link
                                to={`/explore?style=${style.name}`}
                                key={style.id}
                                className={`style-card ${activeStyle === style.id ? 'active' : ''}`}
                                id={`style-card-${style.id}`}
                                onMouseEnter={() => setActiveStyle(style.id)}
                                onMouseLeave={() => setActiveStyle(null)}
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <span className="style-emoji">{style.emoji}</span>
                                <h3>{style.name}</h3>
                                <span className="style-count">{photographers.filter(p => p.styles.includes(style.name)).length}+ thợ</span>
                                <div className="style-card-glow" style={{ background: style.color }} />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== INSTANT BOOKING ===== */}
            <section className="section instant-section" id="instant-booking">
                <div className="container">
                    <div className="instant-card">
                        <div className="instant-content">
                            <span className="instant-badge">
                                <Zap size={16} /> Tính năng mới
                            </span>
                            <h2>Đặt gấp – <span className="gradient-text">Chụp ngay</span></h2>
                            <p>
                                Như Uber nhưng cho chụp ảnh! Thợ rảnh gần đó bật trạng thái "Online" –
                                bạn book ngay trong 30 phút. Hoàn hảo cho phố đi bộ, event, cafe hot.
                            </p>
                            <div className="instant-features">
                                <div className="instant-feature">
                                    <Clock size={20} />
                                    <span>Book trong 30 giây</span>
                                </div>
                                <div className="instant-feature">
                                    <MapPin size={20} />
                                    <span>Thợ gần bạn nhất</span>
                                </div>
                                <div className="instant-feature">
                                    <Shield size={20} />
                                    <span>Thanh toán an toàn</span>
                                </div>
                            </div>
                            <Link to="/explore?instant=true" className="btn btn-coral btn-lg" id="instant-booking-btn">
                                <Zap size={18} /> Tìm thợ Online ngay
                            </Link>
                        </div>
                        <div className="instant-visual">
                            <div className="instant-map-preview">
                                <div className="instant-pin instant-pin-1">
                                    <img src={photographers[0].avatar} alt="" />
                                    <span className="online-pulse" />
                                </div>
                                <div className="instant-pin instant-pin-2">
                                    <img src={photographers[2].avatar} alt="" />
                                    <span className="online-pulse" />
                                </div>
                                <div className="instant-pin instant-pin-3">
                                    <img src={photographers[5].avatar} alt="" />
                                    <span className="online-pulse" />
                                </div>
                                <div className="instant-center-dot" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== PRESET SHOP TEASER ===== */}
            <section className="section preset-section" id="preset-teaser">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Preset Shop</span>
                        <h2>Bộ lọc ảnh <span className="gradient-text">cực đỉnh</span></h2>
                        <p>Tự chỉnh ảnh với preset chuyên nghiệp. Mua một lần – dùng mãi mãi.</p>
                    </div>
                    <div className="preset-grid">
                        {presets.slice(0, 4).map((preset, i) => (
                            <div key={preset.id} className="preset-card" id={`preset-card-${preset.id}`} style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="preset-card-img">
                                    <img src={preset.image} alt={preset.name} />
                                    <div className="preset-card-overlay">
                                        <Eye size={20} />
                                        <span>Xem trước</span>
                                    </div>
                                </div>
                                <div className="preset-card-body">
                                    <span className="tag tag-primary">{preset.category}</span>
                                    <h4>{preset.name}</h4>
                                    <div className="preset-card-meta">
                                        <span className="preset-card-rating">
                                            <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                                            {preset.rating}
                                        </span>
                                        <span className="preset-card-downloads">
                                            <Download size={14} /> {preset.downloads}
                                        </span>
                                    </div>
                                    <div className="preset-card-footer">
                                        <strong className="preset-price">{formatPrice(preset.price)}</strong>
                                        <button className="btn btn-primary btn-sm">Mua ngay</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="section-cta">
                        <Link to="/presets" className="btn btn-secondary btn-lg" id="view-all-presets">
                            Khám phá Preset Shop <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="section testimonials-section" id="testimonials">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Đánh giá</span>
                        <h2>Khách hàng <span className="gradient-text">nói gì?</span></h2>
                        <p>Hàng ngàn review thật từ cộng đồng PICMate.</p>
                    </div>
                    <div className="testimonials-grid">
                        {testimonials.map((t, i) => (
                            <div key={t.id} className="testimonial-card card-glass" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="testimonial-stars">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                                    ))}
                                </div>
                                <p className="testimonial-text">"{t.text}"</p>
                                <div className="testimonial-author">
                                    <img src={t.avatar} alt={t.name} className="avatar" />
                                    <div>
                                        <strong>{t.name}</strong>
                                        <span>{t.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== MEMBERSHIP ===== */}
            <section className="section membership-section" id="membership">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Membership</span>
                        <h2>Gói hội viên <span className="gradient-text">đặc quyền</span></h2>
                        <p>Nâng cấp trải nghiệm với ưu đãi độc quyền cho thành viên PICMate.</p>
                    </div>
                    <div className="membership-grid">
                        {membershipPlans.map((plan, i) => (
                            <div key={plan.id} className={`membership-card ${plan.popular ? 'membership-popular' : ''}`} id={`membership-${plan.id}`}>
                                {plan.popular && <span className="membership-badge"><Crown size={14} /> Phổ biến nhất</span>}
                                <h3>{plan.name}</h3>
                                <div className="membership-price">
                                    {plan.price === 0 ? (
                                        <span className="membership-free">Miễn phí</span>
                                    ) : (
                                        <>
                                            <strong>{formatPrice(plan.price)}</strong>
                                            <span>/tháng</span>
                                        </>
                                    )}
                                </div>
                                <ul className="membership-features">
                                    {plan.features.map((f, j) => (
                                        <li key={j}>
                                            <CheckCircle size={16} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`btn btn-lg ${plan.popular ? 'btn-primary' : 'btn-ghost'}`}>
                                    {plan.price === 0 ? 'Bắt đầu miễn phí' : 'Đăng ký ngay'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FINAL CTA ===== */}
            <section className="section final-cta" id="final-cta">
                <div className="container">
                    <div className="final-cta-card">
                        <h2>Sẵn sàng có những bức ảnh <span className="gradient-text">đẹp nhất</span>?</h2>
                        <p>Tham gia PICMate ngay hôm nay – hoàn toàn miễn phí.</p>
                        <div className="final-cta-buttons">
                            <Link to="/explore" className="btn btn-primary btn-lg" id="final-cta-explore">
                                <Camera size={18} /> Tìm Phone-Grapher
                            </Link>
                            <Link to="/auth?role=photographer" className="btn btn-secondary btn-lg" id="final-cta-register">
                                Trở thành Phone-Grapher
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
