import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, MapPin, Camera, FileText, ChevronLeft, ChevronRight,
    CheckCircle, CreditCard, Shield, Zap, Award, Star, Wallet, QrCode
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { formatPrice } from '../data/data';
import { apiClient } from '../services/apiClient';
import { API_BASE_URL } from '../services/http';
import toast from 'react-hot-toast';
import './BookingPage.css';

export default function BookingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [photographer, setPhotographer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1);
    const [booking, setBooking] = useState({
        service: '',
        date: '',
        time: '',
        location: '',
        note: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('vietqr');

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
            <p>Đang tải thông tin đặt lịch...</p>
        </div>
    );

    if (error || !photographer) return (
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <p>{error || 'Không tìm thấy nhiếp ảnh gia để đặt lịch.'}</p>
        </div>
    );



    // Use the packages from the API response
    const services = photographer.packages && photographer.packages.length > 0 
        ? photographer.packages.map((pkg, i) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            icon: i === 0 ? '🌳' : (i === 1 ? '📸' : '🎉'),
            price: pkg.price
        }))
        : [];

    const totalSteps = 4;

    const updateBooking = (key, value) => {
        setBooking(prev => ({ ...prev, [key]: value }));
    };

    const handleConfirmBooking = async () => {
        setIsSubmitting(true);
        try {
            const servicePackage = services.find(s => s.name === booking.service);
            if (!servicePackage) throw new Error("Vui lòng chọn dịch vụ.");
            
            // Send the real grapherProfileId and servicePackageId
            const payload = {
                grapherProfileId: photographer.id,
                servicePackageId: servicePackage.id,
                scheduledAt: new Date(`${booking.date}T${booking.time}:00+07:00`).toISOString(),
                location: booking.location,
                note: booking.note,
                paymentMethod,
            };

            const response = await apiClient.createBooking(payload);

            if (paymentMethod === 'vietqr') {
                navigate(`/payment/vietqr/${response.booking.id}`);
            } else if (response.paymentUrl) {
                window.location.href = response.paymentUrl;
            } else {
                toast.success('Đặt lịch thành công! Bạn sẽ trả tiền mặt khi gặp thợ.');
                window.location.href = '/customer-dashboard';
            }
        } catch (err) {
            console.error(err);
            const errorTitle = err.response?.data?.title || err.response?.data?.detail || err.response?.data?.message || err.message;
            toast.error('Lỗi: ' + errorTitle);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return booking.service !== '';
            case 2: return booking.date !== '' && booking.time !== '';
            case 3: return booking.location !== '';
            case 4: return true;
            default: return false;
        }
    };

    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return (
        <div className="booking-page">
            <div className="container">
                <Link to={`/photographer/${photographer.id}`} className="btn btn-ghost btn-sm booking-back" id="booking-back">
                    <ChevronLeft size={18} /> Quay lại hồ sơ
                </Link>

                <div className="booking-layout">
                    {/* Main Form */}
                    <div className="booking-main">
                        <div className="booking-header">
                            <h1>Đặt lịch chụp</h1>
                            <p>Hoàn tất đặt lịch với <strong>{photographer.name}</strong></p>
                        </div>

                        {/* Progress Stepper */}
                        <div className="booking-stepper">
                            {['Dịch vụ', 'Thời gian', 'Địa điểm', 'Xác nhận'].map((label, i) => (
                                <div key={i} className={`stepper-step ${step > i + 1 ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
                                    <div className="stepper-circle">
                                        {step > i + 1 ? <CheckCircle size={18} /> : <span>{i + 1}</span>}
                                    </div>
                                    <span className="stepper-label">{label}</span>
                                    {i < 3 && <div className="stepper-line" />}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Service */}
                        {step === 1 && (
                            <div className="booking-step animate-fade-in-up">
                                <h2>Chọn dịch vụ</h2>
                                {services.length > 0 ? (
                                    <div className="service-grid">
                                        {services.map(s => (
                                            <div
                                                key={s.id}
                                                className={`service-card ${booking.service === s.name ? 'active' : ''}`}
                                                onClick={() => updateBooking('service', s.name)}
                                                id={`service-${s.id}`}
                                            >
                                                <span className="service-icon">{s.icon}</span>
                                                <h3>{s.name}</h3>
                                                <p>{s.description}</p>
                                                <strong style={{ color: 'var(--primary)', marginTop: '0.5rem', display: 'block' }}>{formatPrice(s.price)}</strong>
                                                {booking.service === s.name && <CheckCircle size={20} className="service-check" />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        <Camera size={40} />
                                        <p style={{ marginTop: '1rem' }}>Thợ chưa cập nhật dịch vụ. Vui lòng quay lại sau.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Date & Time */}
                        {step === 2 && (
                            <div className="booking-step animate-fade-in-up">
                                <h2>Chọn ngày & giờ</h2>
                                <div className="input-group">
                                    <label>📅 Ngày chụp</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={booking.date}
                                        onChange={(e) => updateBooking('date', e.target.value)}
                                        id="booking-date"
                                    />
                                </div>
                                <div className="input-group" style={{ marginTop: 'var(--space-lg)' }}>
                                    <label>⏰ Giờ chụp</label>
                                    <div className="time-grid">
                                        {timeSlots.map(t => (
                                            <button
                                                key={t}
                                                className={`time-slot ${booking.time === t ? 'active' : ''}`}
                                                onClick={() => updateBooking('time', t)}
                                                id={`time-${t.replace(':', '')}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Location */}
                        {step === 3 && (
                            <div className="booking-step animate-fade-in-up">
                                <h2>Địa điểm & Ghi chú</h2>
                                <div className="input-group">
                                    <label><MapPin size={16} /> Địa điểm chụp</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="VD: Cafe The Coffee House, Q.1"
                                        value={booking.location}
                                        onChange={(e) => updateBooking('location', e.target.value)}
                                        id="booking-location"
                                    />
                                </div>
                                <div className="input-group" style={{ marginTop: 'var(--space-lg)' }}>
                                    <label><FileText size={16} /> Ghi chú cho thợ (concept, outfit, vibe)</label>
                                    <textarea
                                        className="input booking-textarea"
                                        placeholder="VD: Concept Hàn Quốc, outfit pastel, chụp ngoài trời..."
                                        value={booking.note}
                                        onChange={(e) => updateBooking('note', e.target.value)}
                                        rows={4}
                                        id="booking-note"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirm */}
                        {step === 4 && (
                            <div className="booking-step animate-fade-in-up">
                                <h2>Xác nhận đặt lịch</h2>
                                <div className="confirm-card">
                                    <div className="confirm-row">
                                        <span>📸 Dịch vụ</span>
                                        <strong>{booking.service}</strong>
                                    </div>
                                    <div className="confirm-row">
                                        <span>📅 Ngày</span>
                                        <strong>{booking.date}</strong>
                                    </div>
                                    <div className="confirm-row">
                                        <span>⏰ Giờ</span>
                                        <strong>{booking.time}</strong>
                                    </div>
                                    <div className="confirm-row">
                                        <span>📍 Địa điểm</span>
                                        <strong>{booking.location}</strong>
                                    </div>
                                    {booking.note && (
                                        <div className="confirm-row">
                                            <span>📝 Ghi chú</span>
                                            <strong>{booking.note}</strong>
                                        </div>
                                    )}
                                    <div className="confirm-divider" />
                                    <div className="confirm-row confirm-total">
                                        <span>💰 Tổng đặt cọc</span>
                                        <strong>{formatPrice(services.find(s => s.name === booking.service)?.price || 0)}</strong>
                                    </div>
                                </div>
                                <div className="payment-methods">
                                    <button type="button" className={`payment-method-card ${paymentMethod === 'vietqr' ? 'active' : ''}`} onClick={() => setPaymentMethod('vietqr')}>
                                        <QrCode size={22} />
                                        <div className="payment-method-text">
                                            <strong>Chuyển khoản ngân hàng (VietQR)</strong>
                                            <span>Quét mã bằng app ngân hàng bất kỳ</span>
                                        </div>
                                    </button>
                                    <button type="button" className={`payment-method-card ${paymentMethod === 'vnpay' ? 'active' : ''}`} onClick={() => setPaymentMethod('vnpay')}>
                                        <CreditCard size={22} />
                                        <div className="payment-method-text">
                                            <strong>Thanh toán online (VNPay)</strong>
                                            <span>Thanh toán ngay qua thẻ / ngân hàng</span>
                                        </div>
                                    </button>
                                    <button type="button" className={`payment-method-card ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                                        <Wallet size={22} />
                                        <div className="payment-method-text">
                                            <strong>Trả sau (tiền mặt)</strong>
                                            <span>Trả trực tiếp cho thợ khi gặp</span>
                                        </div>
                                    </button>
                                </div>
                                <div className="escrow-notice">
                                    <Shield size={18} />
                                    <p>{paymentMethod === 'cod'
                                        ? 'Bạn sẽ trả tiền mặt trực tiếp cho thợ khi buổi chụp diễn ra. Đơn sẽ chờ thợ xác nhận sau khi đặt.'
                                        : paymentMethod === 'vietqr'
                                            ? 'Bạn sẽ chuyển khoản qua mã VietQR. PICMate giữ tiền cho tới khi buổi chụp hoàn tất. Đơn được xác nhận sau khi PICMate đối soát giao dịch.'
                                            : 'Số tiền của bạn được PICMate đảm bảo an toàn cho đến khi buổi chụp hoàn tất.'}</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="booking-nav">
                            {step > 1 && (
                                <button className="btn btn-ghost btn-lg" onClick={() => setStep(step - 1)} id="booking-prev" disabled={isSubmitting}>
                                    <ChevronLeft size={18} /> Quay lại
                                </button>
                            )}
                            <div style={{ flex: 1 }} />
                            {step < totalSteps ? (
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => setStep(step + 1)}
                                    disabled={!canProceed()}
                                    id="booking-next"
                                >
                                    Tiếp theo <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button 
                                    className="btn btn-primary btn-lg" 
                                    id="booking-confirm"
                                    onClick={handleConfirmBooking}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        'Đang xử lý...'
                                    ) : paymentMethod === 'cod' ? (
                                        <><Wallet size={18} /> Đặt lịch (trả sau)</>
                                    ) : paymentMethod === 'vietqr' ? (
                                        <><QrCode size={18} /> Xác nhận & Lấy mã QR</>
                                    ) : (
                                        <><CreditCard size={18} /> Xác nhận & Thanh toán</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="booking-sidebar">
                        <div className="booking-sidebar-card">
                            <div className="booking-photographer-info">
                                <img src={photographer.avatar} alt={photographer.name} className="avatar-lg" />
                                <div>
                                    <h3>{photographer.name}</h3>
                                    <span className="photographer-card-location"><MapPin size={14} /> {photographer.location}</span>
                                    <span className="photographer-card-rating">
                                        <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                                        {photographer.rating} ({photographer.reviewCount})
                                    </span>
                                </div>
                            </div>
                            <div className="booking-sidebar-tags">
                                {photographer.styles.map(s => <span key={s} className="tag tag-primary">{s}</span>)}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
