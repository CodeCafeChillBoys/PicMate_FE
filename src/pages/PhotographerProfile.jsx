import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Star, MapPin, CheckCircle, Camera, Clock, CreditCard, MessageCircle,
    Calendar, ChevronLeft, Heart, Share2, Shield, Zap, X, Award
} from 'lucide-react';
import { photographers, formatPrice } from '../data/data';
import './PhotographerProfile.css';

export default function PhotographerProfile() {
    const { id } = useParams();
    const photographer = photographers.find(p => p.id === Number(id)) || photographers[0];
    const [activeTab, setActiveTab] = useState('portfolio');
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="profile-page">
            {/* Cover */}
            <div className="profile-cover">
                <img src={photographer.coverPhoto} alt="cover" />
                <div className="profile-cover-overlay" />
                <div className="container profile-cover-content">
                    <Link to="/explore" className="btn btn-ghost btn-sm profile-back" id="profile-back">
                        <ChevronLeft size={18} /> Quay lại
                    </Link>
                </div>
            </div>

            <div className="container">
                <div className="profile-layout">
                    {/* Main Content */}
                    <div className="profile-main">
                        {/* Header */}
                        <div className="profile-header">
                            <div className="profile-avatar-section">
                                <img src={photographer.avatar} alt={photographer.name} className="profile-avatar" />
                                <div className="profile-info">
                                    <div className="profile-name-row">
                                        <h1>{photographer.name}</h1>
                                        {photographer.isVerified && (
                                            <span className="badge badge-info"><CheckCircle size={14} /> Verified</span>
                                        )}
                                        {photographer.isOnline && (
                                            <span className="badge badge-success"><span className="online-pulse" /> Online</span>
                                        )}
                                    </div>
                                    <div className="profile-meta">
                                        <span><MapPin size={16} /> {photographer.location}</span>
                                        <span><Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" /> {photographer.rating} ({photographer.reviewCount} đánh giá)</span>
                                    </div>
                                    <div className="profile-tags">
                                        {photographer.styles.map(s => (
                                            <span key={s} className="tag tag-primary">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="profile-actions-top">
                                <button className="btn btn-icon btn-ghost" id="profile-like"><Heart size={20} /></button>
                                <button className="btn btn-icon btn-ghost" id="profile-share"><Share2 size={20} /></button>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="profile-bio">
                            <p>{photographer.bio}</p>
                        </div>

                        {/* Tabs */}
                        <div className="profile-tabs">
                            {[
                                { key: 'portfolio', label: 'Portfolio', icon: <Camera size={16} /> },
                                { key: 'reviews', label: `Đánh giá (${photographer.reviews.length})`, icon: <Star size={16} /> },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.key)}
                                    id={`profile-tab-${tab.key}`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Portfolio */}
                        {activeTab === 'portfolio' && (
                            <div className="profile-portfolio">
                                <div className="portfolio-grid">
                                    {photographer.portfolio.map((img, i) => (
                                        <div key={i} className="portfolio-item" onClick={() => setSelectedImage(img)} id={`portfolio-${i}`}>
                                            <img src={img} alt={`Portfolio ${i + 1}`} />
                                            <div className="portfolio-overlay">
                                                <Camera size={24} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        {activeTab === 'reviews' && (
                            <div className="profile-reviews">
                                {photographer.reviews.length > 0 ? photographer.reviews.map(review => (
                                    <div key={review.id} className="review-card">
                                        <div className="review-header">
                                            <img src={review.avatar} alt={review.user} className="avatar" />
                                            <div>
                                                <strong>{review.user}</strong>
                                                <span className="review-date">{review.date}</span>
                                            </div>
                                            <div className="review-stars">
                                                {Array.from({ length: review.rating }).map((_, j) => (
                                                    <Star key={j} size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                                                ))}
                                            </div>
                                        </div>
                                        <p>{review.text}</p>
                                    </div>
                                )) : (
                                    <div className="profile-empty">
                                        <Star size={40} />
                                        <p>Chưa có đánh giá nào</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Booking */}
                    <aside className="profile-sidebar">
                        <div className="profile-booking-card">
                            <h3>Bảng giá dịch vụ</h3>

                            <div className="pricing-list">
                                <div className="pricing-item">
                                    <div className="pricing-item-info">
                                        <Camera size={18} />
                                        <div>
                                            <strong>Chụp ảnh theo giờ</strong>
                                            <span>Chụp chân dung, sống ảo, couple</span>
                                        </div>
                                    </div>
                                    <strong className="pricing-value">{formatPrice(photographer.pricing.hourly)}/giờ</strong>
                                </div>
                                <div className="pricing-item">
                                    <div className="pricing-item-info">
                                        <Award size={18} />
                                        <div>
                                            <strong>Chỉnh ảnh</strong>
                                            <span>Edit màu, retouch da mịn</span>
                                        </div>
                                    </div>
                                    <strong className="pricing-value">{formatPrice(photographer.pricing.perPhoto)}/ảnh</strong>
                                </div>
                                <div className="pricing-item">
                                    <div className="pricing-item-info">
                                        <Zap size={18} />
                                        <div>
                                            <strong>Gói TikTok Content</strong>
                                            <span>Quay, edit, chọn nhạc</span>
                                        </div>
                                    </div>
                                    <strong className="pricing-value">{formatPrice(photographer.pricing.tiktokPackage)}</strong>
                                </div>
                            </div>

                            <Link to={`/booking/${photographer.id}`} className="btn btn-primary btn-lg profile-book-btn" id="profile-book-btn">
                                <Calendar size={18} /> Đặt lịch ngay
                            </Link>

                            <button className="btn btn-ghost btn-lg profile-chat-btn" id="profile-chat-btn">
                                <MessageCircle size={18} /> Nhắn tin
                            </button>

                            <div className="profile-trust">
                                <div className="trust-item">
                                    <Shield size={16} />
                                    <span>Thanh toán an toàn (Escrow)</span>
                                </div>
                                <div className="trust-item">
                                    <CheckCircle size={16} />
                                    <span>Bảo vệ quyền lợi 2 bên</span>
                                </div>
                                <div className="trust-item">
                                    <Clock size={16} />
                                    <span>Phản hồi trong 15 phút</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div className="lightbox" onClick={() => setSelectedImage(null)} id="lightbox">
                    <button className="lightbox-close" onClick={() => setSelectedImage(null)}><X size={24} /></button>
                    <img src={selectedImage} alt="Portfolio" />
                </div>
            )}
        </div>
    );
}
