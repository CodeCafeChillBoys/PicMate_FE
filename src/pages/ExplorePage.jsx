import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, SlidersHorizontal, X, Zap, CheckCircle, Filter } from 'lucide-react';
import { photographers, styles, formatPrice } from '../data/data';
import './ExplorePage.css';

export default function ExplorePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStyles, setSelectedStyles] = useState([]);
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('rating');
    const [showFilters, setShowFilters] = useState(false);
    const [instantOnly, setInstantOnly] = useState(false);

    const toggleStyle = (name) => {
        setSelectedStyles(prev =>
            prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
        );
    };

    const filtered = photographers.filter(p => {
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !p.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedStyles.length > 0 && !selectedStyles.some(s => p.styles.includes(s))) return false;
        if (instantOnly && !p.instantBooking) return false;
        if (priceRange === 'low' && p.pricing.hourly > 170000) return false;
        if (priceRange === 'mid' && (p.pricing.hourly < 170000 || p.pricing.hourly > 220000)) return false;
        if (priceRange === 'high' && p.pricing.hourly < 220000) return false;
        return true;
    }).sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price-low') return a.pricing.hourly - b.pricing.hourly;
        if (sortBy === 'price-high') return b.pricing.hourly - a.pricing.hourly;
        if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        return 0;
    });

    return (
        <div className="explore-page">
            {/* Search Header */}
            <div className="explore-header">
                <div className="container">
                    <h1>Tìm <span className="gradient-text">Phone-Grapher</span></h1>
                    <p>Khám phá hàng ngàn thợ chụp tài năng phù hợp với phong cách của bạn</p>
                    <div className="explore-search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, địa điểm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            id="explore-search"
                        />
                        <button className="btn btn-primary" id="explore-search-btn">Tìm kiếm</button>
                    </div>
                </div>
            </div>

            <div className="container explore-content">
                {/* Filter Toggle (Mobile) */}
                <button className="explore-filter-toggle btn btn-ghost" onClick={() => setShowFilters(!showFilters)} id="filter-toggle">
                    <Filter size={18} /> Bộ lọc {selectedStyles.length > 0 && `(${selectedStyles.length})`}
                </button>

                <div className="explore-layout">
                    {/* Sidebar Filters */}
                    <aside className={`explore-sidebar ${showFilters ? 'active' : ''}`} id="explore-filters">
                        <div className="explore-sidebar-header">
                            <h3><SlidersHorizontal size={18} /> Bộ lọc</h3>
                            <button className="explore-sidebar-close" onClick={() => setShowFilters(false)}><X size={20} /></button>
                        </div>

                        {/* Instant Booking */}
                        <div className="filter-group">
                            <label className="filter-checkbox" id="filter-instant">
                                <input type="checkbox" checked={instantOnly} onChange={(e) => setInstantOnly(e.target.checked)} />
                                <span className="filter-checkbox-custom"><Zap size={14} /></span>
                                <span>Chỉ hiện thợ Online (Đặt gấp)</span>
                            </label>
                        </div>

                        {/* Style Filter */}
                        <div className="filter-group">
                            <h4>Phong cách</h4>
                            <div className="filter-tags">
                                {styles.map(s => (
                                    <button
                                        key={s.id}
                                        className={`tag ${selectedStyles.includes(s.name) ? 'tag-active' : ''}`}
                                        onClick={() => toggleStyle(s.name)}
                                        id={`filter-style-${s.id}`}
                                    >
                                        {s.emoji} {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="filter-group">
                            <h4>Mức giá</h4>
                            <div className="filter-options">
                                {[
                                    { value: 'all', label: 'Tất cả' },
                                    { value: 'low', label: '< 170K/giờ' },
                                    { value: 'mid', label: '170K - 220K/giờ' },
                                    { value: 'high', label: '> 220K/giờ' },
                                ].map(opt => (
                                    <label key={opt.value} className="filter-radio" id={`filter-price-${opt.value}`}>
                                        <input type="radio" name="price" value={opt.value} checked={priceRange === opt.value} onChange={() => setPriceRange(opt.value)} />
                                        <span className="filter-radio-custom" />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="filter-group">
                            <h4>Sắp xếp theo</h4>
                            <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} id="filter-sort">
                                <option value="rating">Đánh giá cao nhất</option>
                                <option value="reviews">Nhiều review nhất</option>
                                <option value="price-low">Giá thấp → cao</option>
                                <option value="price-high">Giá cao → thấp</option>
                            </select>
                        </div>

                        {selectedStyles.length > 0 && (
                            <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedStyles([]); setPriceRange('all'); setInstantOnly(false); }} id="filter-clear">
                                Xóa bộ lọc
                            </button>
                        )}
                    </aside>

                    {/* Results */}
                    <div className="explore-results">
                        <div className="explore-results-header">
                            <span className="explore-count">{filtered.length} Phone-Graphers</span>
                        </div>
                        {filtered.length > 0 ? (
                            <div className="explore-grid">
                                {filtered.map((p, i) => (
                                    <Link to={`/photographer/${p.id}`} key={p.id} className="photographer-card" id={`explore-card-${p.id}`}>
                                        <div className="photographer-card-img">
                                            <img src={p.portfolio[0]} alt={p.name} />
                                            <div className="photographer-card-overlay">
                                                <span className="btn btn-sm btn-primary">Xem hồ sơ</span>
                                            </div>
                                            {p.isOnline && (
                                                <span className="photographer-online-badge"><span className="online-pulse" /> Online</span>
                                            )}
                                            {p.isVerified && (
                                                <span className="photographer-verified-badge"><CheckCircle size={14} /> Verified</span>
                                            )}
                                        </div>
                                        <div className="photographer-card-body">
                                            <div className="photographer-card-header">
                                                <img src={p.avatar} alt={p.name} className="avatar" />
                                                <div>
                                                    <h4>{p.name}</h4>
                                                    <span className="photographer-card-location"><MapPin size={14} /> {p.location}</span>
                                                </div>
                                            </div>
                                            <div className="photographer-card-tags">
                                                {p.styles.map(s => <span key={s} className="tag tag-primary">{s}</span>)}
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
                        ) : (
                            <div className="explore-empty">
                                <Search size={48} />
                                <h3>Không tìm thấy Phone-Grapher</h3>
                                <p>Thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
