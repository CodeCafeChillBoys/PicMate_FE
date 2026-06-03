import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Calendar, Clock, MapPin, Camera, FileText, ChevronLeft, ChevronRight,
    CheckCircle, CreditCard, Shield, Zap, Award, Star
} from 'lucide-react';
import { photographers, services, formatPrice } from '../data/data';
import './BookingPage.css';

export default function BookingPage() {
    const { id } = useParams();
    const photographer = photographers.find(p => p.id === Number(id)) || photographers[0];
    const [step, setStep] = useState(1);
    const [booking, setBooking] = useState({
        service: '',
        date: '',
        time: '',
        location: '',
        note: '',
    });

    const totalSteps = 4;

    const updateBooking = (key, value) => {
        setBooking(prev => ({ ...prev, [key]: value }));
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
                                            {booking.service === s.name && <CheckCircle size={20} className="service-check" />}
                                        </div>
                                    ))}
                                </div>
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
                                        <strong>{formatPrice(photographer.pricing.hourly)}</strong>
                                    </div>
                                </div>
                                <div className="escrow-notice">
                                    <Shield size={18} />
                                    <p>Số tiền sẽ được giữ an toàn (Escrow). Sau khi bạn bấm "Hoàn thành", PICMate trừ 15% phí dịch vụ và giải ngân cho thợ.</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="booking-nav">
                            {step > 1 && (
                                <button className="btn btn-ghost btn-lg" onClick={() => setStep(step - 1)} id="booking-prev">
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
                                <button className="btn btn-primary btn-lg" id="booking-confirm">
                                    <CreditCard size={18} /> Xác nhận & Thanh toán
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
