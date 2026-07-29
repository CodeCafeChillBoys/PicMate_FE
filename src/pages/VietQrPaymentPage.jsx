import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Check, Clock, Loader2, AlertTriangle, Home } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { formatPrice } from '../data/data';
import toast from 'react-hot-toast';
import './VietQrPaymentPage.css';

const POLL_INTERVAL_MS = 5000;

// copyValue tách khỏi value vì số tiền hiển thị có dấu chấm và chữ "đ",
// nhưng thứ khách cần dán vào app ngân hàng là con số trần.
const CopyRow = ({ label, value, copyValue, copyable = true }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(copyValue ?? value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error('Trình duyệt không cho phép sao chép. Bạn hãy chép tay giúp nhé.');
        }
    };

    return (
        <div className="vietqr-row">
            <span className="vietqr-row-label">{label}</span>
            <span className="vietqr-row-value">{value}</span>
            {copyable && (
                <button type="button" className="vietqr-copy-btn" onClick={handleCopy} aria-label={`Sao chép ${label}`}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
            )}
        </div>
    );
};

const formatCountdown = (seconds) => {
    const safe = Math.max(0, seconds);
    const mm = String(Math.floor(safe / 60)).padStart(2, '0');
    const ss = String(safe % 60).padStart(2, '0');
    return `${mm}:${ss}`;
};

export default function VietQrPaymentPage() {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(null);
    const pollRef = useRef(null);

    // ── Tải thông tin QR lần đầu ──────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        apiClient.getVietQrPayment(bookingId)
            .then((data) => {
                if (!cancelled) setPayment(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || 'Không tải được thông tin thanh toán.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [bookingId]);

    // ── Đếm ngược, chỉ chạy khi còn đang chờ khách chuyển khoản ───────────────
    useEffect(() => {
        if (!payment?.expiresAt || payment.paymentStatus !== 'Pending') {
            setSecondsLeft(null);
            return undefined;
        }

        const tick = () => {
            const diff = Math.floor((new Date(payment.expiresAt).getTime() - Date.now()) / 1000);
            setSecondsLeft(diff);
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [payment?.expiresAt, payment?.paymentStatus]);

    // ── Poll trạng thái cho tới khi đạt trạng thái cuối ───────────────────────
    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    useEffect(() => {
        const status = payment?.paymentStatus;
        if (status !== 'Pending' && status !== 'AwaitingVerification') {
            stopPolling();
            return undefined;
        }

        pollRef.current = setInterval(async () => {
            try {
                const latest = await apiClient.getPaymentStatus(bookingId);
                setPayment((prev) => (prev ? { ...prev, ...latest } : prev));
            } catch {
                // Mạng chập chờn thì bỏ qua nhịp này, nhịp sau thử lại.
            }
        }, POLL_INTERVAL_MS);

        return stopPolling;
    }, [bookingId, payment?.paymentStatus, stopPolling]);

    // ── Thành công thì sang trang kết quả có sẵn ──────────────────────────────
    useEffect(() => {
        if (payment?.paymentStatus === 'Succeeded') {
            stopPolling();
            navigate(`/payment-result?payment=success&bookingId=${bookingId}`, { replace: true });
        }
    }, [payment?.paymentStatus, bookingId, navigate, stopPolling]);

    const handleClaim = async () => {
        setClaiming(true);
        try {
            const latest = await apiClient.claimTransferred(bookingId);
            setPayment((prev) => ({ ...prev, ...latest }));
            toast.success('Đã ghi nhận. PICMate đang đối soát giao dịch của bạn.');
        } catch (err) {
            toast.error(err.message || 'Không ghi nhận được. Bạn thử lại giúp nhé.');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return (
            <div className="vietqr-page">
                <div className="vietqr-card vietqr-card-center">
                    <Loader2 size={32} className="vietqr-spin" />
                    <p>Đang tạo mã thanh toán...</p>
                </div>
            </div>
        );
    }

    if (error || !payment) {
        return (
            <div className="vietqr-page">
                <div className="vietqr-card vietqr-card-center">
                    <AlertTriangle size={40} className="vietqr-icon-danger" />
                    <h2>Không tải được thông tin thanh toán</h2>
                    <p>{error}</p>
                    <Link to="/customer-dashboard" className="btn btn-primary">Về bảng điều khiển</Link>
                </div>
            </div>
        );
    }

    if (payment.paymentStatus === 'Failed' || payment.bookingStatus === 'Cancelled') {
        return (
            <div className="vietqr-page">
                <div className="vietqr-card vietqr-card-center">
                    <AlertTriangle size={40} className="vietqr-icon-danger" />
                    <h2>Thanh toán không thành công</h2>
                    <p>{payment.verificationNote || 'Đơn đã hết hạn thanh toán hoặc bị huỷ.'}</p>
                    <p className="vietqr-support-note">
                        Nếu bạn đã chuyển tiền, vui lòng liên hệ PICMate kèm mã <strong>{payment.memo}</strong> để được hỗ trợ.
                    </p>
                    <Link to="/customer-dashboard" className="btn btn-primary">Về bảng điều khiển</Link>
                </div>
            </div>
        );
    }

    if (payment.paymentStatus === 'AwaitingVerification') {
        return (
            <div className="vietqr-page">
                <div className="vietqr-card vietqr-card-center">
                    <Loader2 size={40} className="vietqr-spin" />
                    <h2>Đang chờ đối soát</h2>
                    <p>PICMate đang kiểm tra giao dịch của bạn, thường mất vài phút.</p>
                    <p className="vietqr-support-note">
                        Mã giao dịch: <strong>{payment.memo}</strong>
                    </p>
                    <p className="vietqr-support-note">
                        Bạn có thể đóng trang này. Chúng tôi sẽ gửi email và thông báo khi đơn được xác nhận.
                    </p>
                    <Link to="/customer-dashboard" className="btn btn-ghost">Về bảng điều khiển</Link>
                </div>
            </div>
        );
    }

    const expired = secondsLeft !== null && secondsLeft <= 0;

    return (
        <div className="vietqr-page">
            <div className="vietqr-card">
                <div className="vietqr-header">
                    <h2>Quét mã để thanh toán</h2>
                    {secondsLeft !== null && (
                        <span className={`vietqr-countdown ${expired ? 'expired' : ''}`}>
                            <Clock size={16} /> {formatCountdown(secondsLeft)}
                        </span>
                    )}
                </div>

                <div className="vietqr-qr-wrapper">
                    <QRCodeCanvas value={payment.qrPayload} size={260} level="M" marginSize={2} />
                </div>

                <div className="vietqr-rows">
                    <CopyRow label="Ngân hàng" value={payment.bankName} copyable={false} />
                    <CopyRow label="Số tài khoản" value={payment.accountNumber} />
                    {payment.accountName && <CopyRow label="Chủ tài khoản" value={payment.accountName} copyable={false} />}
                    <CopyRow label="Số tiền" value={formatPrice(payment.amount)} copyValue={String(Math.round(payment.amount))} />
                    <CopyRow label="Nội dung chuyển khoản" value={payment.memo} />
                </div>

                <div className="vietqr-warning">
                    <AlertTriangle size={18} />
                    <p>Chuyển khoản xong hãy bấm nút bên dưới ngay. Nếu không, đơn sẽ tự huỷ khi hết giờ.</p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary btn-lg vietqr-claim-btn"
                    onClick={handleClaim}
                    disabled={claiming}
                >
                    {claiming ? 'Đang ghi nhận...' : 'Tôi đã chuyển khoản'}
                </button>

                <Link to="/customer-dashboard" className="vietqr-back-link">
                    <Home size={16} /> Để sau, về bảng điều khiển
                </Link>
            </div>
        </div>
    );
}
