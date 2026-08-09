import { useState } from 'react';
import { Star, Download, Eye, ShoppingCart, Filter } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { formatPrice } from '../data/data';
import './PresetShop.css';

export default function PresetShop() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { data } = useAppData();
    const presets = data.presets || [];
    const categories = ['all', 'Cafe', 'Ngoài trời', 'Da sáng Hàn'];

    const filtered = selectedCategory === 'all'
        ? presets
        : presets.filter(p => p.category === selectedCategory);

    return (
        <div className="preset-shop-page">
            <div className="preset-shop-header">
                <div className="container">
                    <span className="section-label">Preset Shop</span>
                    <h1>Bộ lọc ảnh <span className="gradient-text">cực đỉnh</span></h1>
                    <p>Preset chuyên nghiệp – mua một lần, dùng mãi mãi. Biến ảnh thường thành tuyệt phẩm.</p>
                </div>
            </div>

            <div className="container">
                <div className="preset-shop-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`tag ${selectedCategory === cat ? 'tag-active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                            id={`preset-filter-${cat}`}
                        >
                            {cat === 'all' ? '🎨 Tất cả' : cat}
                        </button>
                    ))}
                </div>

                <div className="preset-shop-grid">
                    {filtered.map((preset, i) => {
                        const imgSrc = preset.image || preset.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80';
                        return (
                            <div key={preset.id || i} className="preset-shop-card" id={`preset-shop-${preset.id || i}`}>
                                <div className="preset-shop-card-img">
                                    <img
                                        src={imgSrc || undefined}
                                        alt={preset.name}
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80';
                                        }}
                                    />
                                    <div className="preset-shop-card-overlay">
                                        <button className="btn btn-primary btn-sm">
                                            <Eye size={16} /> Xem trước
                                        </button>
                                    </div>
                                    <span className="preset-shop-category tag tag-primary">{preset.category}</span>
                                </div>
                                <div className="preset-shop-card-body">
                                    <h3>{preset.name}</h3>
                                    <div className="preset-shop-meta">
                                        <span className="preset-shop-rating">
                                            <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                                            {preset.rating}
                                        </span>
                                        <span className="preset-shop-downloads">
                                            <Download size={14} /> {typeof preset.downloads === 'number' ? preset.downloads.toLocaleString() : (preset.downloads || '1.2K')}
                                        </span>
                                    </div>
                                    <div className="preset-shop-card-footer">
                                        <strong className="preset-shop-price">{formatPrice(preset.price)}</strong>
                                        <button className="btn btn-primary btn-sm" id={`buy-preset-${preset.id || i}`}>
                                            <ShoppingCart size={14} /> Mua ngay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
