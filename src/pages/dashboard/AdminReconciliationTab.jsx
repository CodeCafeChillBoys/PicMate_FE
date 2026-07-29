import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Inbox } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatPrice } from '../../data/data';
import toast from 'react-hot-toast';

const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export default function AdminReconciliationTab({ active, onPendingCountChange }) {
    const [pending, setPending] = useState([]);
    const [expired, setExpired] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [pendingList, expiredList] = await Promise.all([
                adminService.getPendingPayments(),
                adminService.getRecentlyExpiredPayments(),
            ]);
            setPending(pendingList);
            setExpired(expiredList);
            onPendingCountChange?.(pendingList.length);
        } catch (err) {
            toast.error(err.message || 'Không tải được danh sách đối soát.');
        } finally {
            setLoading(false);
        }
    }, [onPendingCountChange]);

    useEffect(() => {
        if (active) load();
    }, [active, load]);

    const handleVerify = async (payment, approved) => {
        let note = null;

        if (!approved) {
            note = window.prompt(`Lý do từ chối giao dịch ${payment.transactionCode}:`);
            if (note === null) return;
            if (!note.trim()) {
                toast.error('Phải nhập lý do khi từ chối.');
                return;
            }
        }

        setBusyId(payment.paymentId);
        try {
            await adminService.verifyPayment(payment.paymentId, approved, note);
            toast.success(approved ? 'Đã xác nhận nhận được tiền.' : 'Đã từ chối giao dịch.');
            await load();
        } catch (err) {
            toast.error(err.message || 'Không xử lý được giao dịch.');
        } finally {
            setBusyId(null);
        }
    };

    if (!active) return null;

    return (
        <div className="admin-reconciliation">
            <div className="admin-reconciliation-header">
                <div>
                    <h2>Đối soát chuyển khoản VietQR</h2>
                    <p className="admin-reconciliation-hint">
                        Mở app Agribank, tìm giao dịch có <strong>nội dung chuyển khoản</strong> trùng cột &quot;Mã giao dịch&quot;.
                        Đối chiếu theo mã, không đối chiếu theo số tiền — nhiều đơn có thể cùng giá.
                    </p>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
                    <RefreshCw size={16} /> Tải lại
                </button>
            </div>

            <h3 className="admin-reconciliation-section">Chờ đối soát ({pending.length})</h3>
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã giao dịch</th>
                            <th>Số tiền</th>
                            <th>Khách hàng</th>
                            <th>Thợ chụp</th>
                            <th>Gói dịch vụ</th>
                            <th>Khách báo lúc</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center' }}>Đang tải...</td></tr>
                        ) : pending.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center' }}><Inbox size={18} /> Không có giao dịch nào chờ đối soát</td></tr>
                        ) : pending.map((p) => (
                            <tr key={p.paymentId}>
                                <td><code className="order-code">{p.transactionCode}</code></td>
                                <td><strong>{formatPrice(p.amount)}</strong></td>
                                <td>{p.customerName}<br /><small>{p.customerEmail}</small></td>
                                <td>{p.grapherName}</td>
                                <td>{p.serviceName}</td>
                                <td>{formatDateTime(p.customerClaimedAt)}</td>
                                <td>
                                    {p.paymentStatus === 'AwaitingVerification'
                                        ? <span className="badge badge-warning">Khách đã báo chuyển</span>
                                        : <span className="badge badge-secondary">Chưa báo</span>}
                                </td>
                                <td>
                                    <div className="admin-reconciliation-actions">
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm"
                                            disabled={busyId === p.paymentId}
                                            onClick={() => handleVerify(p, true)}
                                        >
                                            <CheckCircle2 size={14} /> Duyệt
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            disabled={busyId === p.paymentId}
                                            onClick={() => handleVerify(p, false)}
                                        >
                                            <XCircle size={14} /> Từ chối
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h3 className="admin-reconciliation-section">Đã tự huỷ trong 24 giờ qua ({expired.length})</h3>
            <p className="admin-reconciliation-hint">
                Nếu sao kê có giao dịch lạ không khớp đơn nào đang chờ, tìm mã ở bảng này — nhiều khả năng khách đã
                chuyển tiền nhưng quên bấm nút xác nhận. Xử lý bằng tay: hoàn tiền hoặc liên hệ khách đặt lại đơn.
            </p>
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã giao dịch</th>
                            <th>Số tiền</th>
                            <th>Khách hàng</th>
                            <th>Gói dịch vụ</th>
                            <th>Tạo lúc</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expired.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center' }}>Không có đơn nào bị tự huỷ</td></tr>
                        ) : expired.map((p) => (
                            <tr key={p.paymentId}>
                                <td><code className="order-code">{p.transactionCode}</code></td>
                                <td>{formatPrice(p.amount)}</td>
                                <td>{p.customerName}<br /><small>{p.customerEmail}</small></td>
                                <td>{p.serviceName}</td>
                                <td>{formatDateTime(p.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
