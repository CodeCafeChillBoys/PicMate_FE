import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Home } from 'lucide-react';
import './PaymentResultPage.css';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    
    const paymentStatus = searchParams.get('payment');
    const bookingId = searchParams.get('bookingId');
    const message = searchParams.get('message');
    
    const isSuccess = paymentStatus === 'success';

    return (
        <div className="payment-result-page">
            <div className={`result-card ${isSuccess ? 'success' : 'failed'}`}>
                <div className="icon-container">
                    {isSuccess ? (
                        <CheckCircle2 size={80} className="status-icon success-icon pulse-animation" />
                    ) : (
                        <XCircle size={80} className="status-icon failed-icon shake-animation" />
                    )}
                </div>
                
                <h1 className="result-title">
                    {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                </h1>
                
                <p className="result-message">
                    {isSuccess 
                        ? 'Cảm ơn bạn đã sử dụng dịch vụ của PICMate. Đơn đặt lịch của bạn đã được xác nhận.' 
                        : (message || 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.')}
                </p>
                
                {isSuccess && bookingId && (
                    <div className="booking-reference">
                        <span>Mã đơn hàng:</span>
                        <strong>{bookingId.split('-')[0].toUpperCase()}</strong>
                    </div>
                )}
                
                <div className="action-buttons">
                    <Link to="/customer-dashboard" className="btn btn-primary btn-lg action-btn">
                        Về bảng điều khiển <ArrowRight size={18} />
                    </Link>
                    <Link to="/" className="btn btn-ghost btn-lg action-btn">
                        <Home size={18} /> Trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;
