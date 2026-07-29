import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Star, MapPin, CheckCircle, Camera, Clock, CreditCard, MessageCircle,
    Calendar, ChevronLeft, Heart, Share2, Shield, Zap, X, Award
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

import { formatPrice, avatarFallback } from '../data/data';


import { API_BASE_URL } from '../services/http';
import ChatComponent from '../components/chat/ChatComponent';
import toast from 'react-hot-toast';
import './PhotographerProfile.css';

export default function PhotographerProfile() {
    const { id } = useParams();
    const [photographer, setPhotographer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('portfolio');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const { data, toggleFavoriteId } = useAppData();
    const { user } = useAuth();
    
    const favoriteIds = data.favoritePhotographerIds || [];
    const isFavorited = favoriteIds.includes(id);

    const handleToggleFavorite = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để yêu thích thợ chụp!');
            return;
        }
        try {
            await apiClient.toggleFavorite(id);
            toggleFavoriteId(id);
            toast.success(isFavorited ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích!');
        } catch (err) {
            toast.error('Lỗi: ' + (err.message || 'Vui lòng thử lại'));
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/graphers/${id}`);
                if (!response.ok) {
                    throw new Error('Không tìm thấy nhiếp ảnh gia');
                }
                const data = await response.json();
                setPhotographer(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) return (
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <p>Đang tải hồ sơ...</p>
        </div>
    );

    if (error || !photographer) return (
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <p>{error || 'Không tìm thấy nhiếp ảnh gia.'}</p>
        </div>
    );

    return (
        <div className="profile-page">
            {/* Cover */}
            <div className="profile-cover">
                <img src={photographer.coverPhoto || "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=400&fit=crop"} alt="cover" />
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
                                        {photographer.isOnline && (
                                            <span className="badge badge-success"><span className="online-pulse" /> Online</span>
                                        )}
                                    </div>
                                    <div className="profile-meta">
                                        {photographer.location ? (
                                            <span><MapPin size={16} /> {photographer.location}</span>
                                        ) : (
                                            <span><MapPin size={16} /> Chưa cập nhật vị trí</span>
                                        )}
                                        <span>
                                            <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />{' '}
                                            {photographer.reviewCount > 0 ? (
                                                `${Number(photographer.rating || 0).toFixed(1)} (${photographer.reviewCount} đánh giá)`
                                            ) : (
                                                'Chưa có đánh giá'
                                            )}
                                        </span>
                                    </div>
                                    <div className="profile-tags">
                                        {(photographer.styles || []).map(s => (
                                            <span key={s} className="tag tag-primary">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="profile-actions-top">
                                <button className={`btn btn-icon btn-ghost ${isFavorited ? 'active' : ''}`} id="profile-like" onClick={handleToggleFavorite} title={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}>
                                    <Heart size={20} fill={isFavorited ? "var(--accent-red)" : "transparent"} color={isFavorited ? "var(--accent-red)" : "currentColor"} />
                                </button>
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
                                { key: 'reviews', label: `Đánh giá (${photographer.reviewCount || photographer.reviews?.length || 0})`, icon: <Star size={16} /> },
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
                                    {(photographer.portfolio || []).map((img, i) => (
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
                                {(photographer.reviews?.length || 0) > 0 ? photographer.reviews.map(review => (
                                    <div key={review.id} className="review-card">
                                        <div className="review-header">

                                            <img src={review.avatar || avatarFallback(review.user)} alt={review.user} className="avatar" />
                                            <div>
                                                <strong>{review.user}</strong>
                                                <span className="review-date">
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                                    })}
                                                </span>

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
                                {photographer.packages && photographer.packages.length > 0 ? photographer.packages.map(pkg => (
                                    <div key={pkg.id} className="pricing-item">
                                        <div className="pricing-item-info">
                                            <Camera size={18} />
                                            <div>
                                                <strong>{pkg.name}</strong>
                                                <span>{pkg.description}</span>
                                            </div>
                                        </div>
                                        <strong className="pricing-value">{formatPrice(pkg.price)}</strong>
                                    </div>
                                )) : (
                                    <div className="pricing-item">
                                        <div className="pricing-item-info">
                                            <Camera size={18} />
                                            <div>
                                                <strong>Chưa có dịch vụ</strong>
                                                <span>Thợ chưa cập nhật giá</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link to={`/booking/${photographer.id}`} className="btn btn-primary btn-lg profile-book-btn" id="profile-book-btn">
                                <Calendar size={18} /> Đặt lịch ngay
                            </Link>

                            <button className="btn btn-ghost btn-lg profile-chat-btn" id="profile-chat-btn" onClick={() => setShowChat(true)}>
                                <MessageCircle size={18} /> Nhắn tin
                            </button>

                            <div className="profile-trust">
                                <div className="trust-item">
                                    <Shield size={16} />
                                    <span>Thanh toán được đảm bảo an toàn</span>
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

            {/* Chat Box */}
            {showChat && (
                <ChatComponent 
                    otherUser={{
                        id: photographer.userId || '11111111-1111-1111-1111-111111111111', 
                        fullName: photographer.name, 
                        avatarUrl: photographer.avatar, 
                        role: 'Photographer'
                    }}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    );
}
