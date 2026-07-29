import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Package, DollarSign, Eye, MoreHorizontal, CheckCircle2, XCircle,
    RotateCcw, BadgeCheck, Loader2, RefreshCw, CalendarDays,
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { apiClient } from '../../../services/apiClient';
import { formatPrice, avatarFallback } from '../../../data/data';
import OrdersCharts from './OrdersCharts';
import toast from 'react-hot-toast';
import './AdminOrdersTab.css';

const STATUS_FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'PendingPayment', label: 'Chờ thanh toán' },
    { key: 'PendingConfirmation', label: 'Chờ xác nhận' },
    { key: 'Confirmed', label: 'Đã xác nhận' },
    { key: 'InProgress', label: 'Đang thực hiện' },
    { key: 'Completed', label: 'Hoàn thành' },
    { key: 'Cancelled', label: 'Đã huỷ' },
];

const STATUS_LABELS = {
    PendingPayment: { label: 'Chờ thanh toán', color: 'warning' },
    PendingConfirmation: { label: 'Chờ xác nhận', color: 'warning' },
    Confirmed: { label: 'Đã xác nhận', color: 'info' },
    InProgress: { label: 'Đang thực hiện', color: 'info' },
    Completed: { label: 'Hoàn thành', color: 'success' },
    Cancelled: { label: 'Đã huỷ', color: 'danger' },
};

const PAYMENT_LABELS = {
    Pending: { label: 'Chờ thanh toán', color: 'secondary' },
    AwaitingVerification: { label: 'Chờ đối soát', color: 'warning' },
    Succeeded: { label: 'Đã thanh toán', color: 'success' },
    Failed: { label: 'Thất bại', color: 'danger' },
    Refunded: { label: 'Đã hoàn tiền', color: 'secondary' },
};

const PROVIDER_LABELS = { VietQr: 'VietQR', VnPay: 'VNPay', Cod: 'Tiền mặt' };

const isClosed = (status) => status === 'Completed' || status === 'Cancelled';

/**
 * Thao tác hợp lệ với một đơn, suy từ trạng thái đơn và trạng thái thanh toán.
 * Giữ cùng luật với backend để giao diện không mời người dùng bấm thứ chắc chắn bị từ chối.
 */
function availableActions(order) {
    const actions = [];

    if (order.paymentStatus === 'AwaitingVerification' && order.paymentId) {
        actions.push('verify');
    }

    const canComplete = ['PendingConfirmation', 'Confirmed', 'InProgress'].includes(order.status)
        && (order.paymentProvider === 'Cod' || order.paymentStatus === 'Succeeded');
    if (canComplete) {
        actions.push('complete');
    }

    if (order.paymentStatus === 'Succeeded') {
        actions.push('refund');
    }

    if (!isClosed(order.status)) {
        actions.push('cancel');
    }

    return actions;
}

function StatusBadge({ status, map }) {
    const item = map[status];
    if (!item) return <span className="badge badge-secondary">{status || '—'}</span>;
    return <span className={`badge badge-${item.color}`}>{item.label}</span>;
}

/**
 * Menu thao tác, đóng khi bấm ra ngoài, nhấn Esc, hoặc khi trang cuộn.
 *
 * Menu định vị theo viewport chứ không theo ô chứa: bảng phải cuộn ngang nên
 * khung bảng có overflow, mà menu đặt tuyệt đối bên trong sẽ bị khung đó cắt mất.
 */
function ActionMenu({ order, busy, onAction }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(null);
    const wrapRef = useRef(null);
    const btnRef = useRef(null);
    const actions = availableActions(order);

    const MENU_WIDTH = 232;

    const openMenu = () => {
        const r = btnRef.current.getBoundingClientRect();
        // Canh mép phải của menu theo mép phải của nút, không để tràn ra ngoài màn hình.
        const left = Math.max(8, Math.min(r.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
        setPos({ top: r.bottom + 6, left });
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return undefined;

        const onPointerDown = (e) => {
            const insideTrigger = wrapRef.current?.contains(e.target);
            const insideMenu = e.target.closest?.('.order-menu');
            if (!insideTrigger && !insideMenu) setOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        // Menu neo theo viewport nên phải đóng khi cuộn, nếu không nó sẽ lơ lửng sai chỗ.
        const onScrollOrResize = () => setOpen(false);

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        window.addEventListener('scroll', onScrollOrResize, true);
        window.addEventListener('resize', onScrollOrResize);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('scroll', onScrollOrResize, true);
            window.removeEventListener('resize', onScrollOrResize);
        };
    }, [open]);

    if (actions.length === 0) {
        return (
            <button className="table-action-btn" disabled title="Đơn đã kết thúc, không còn thao tác nào">
                <MoreHorizontal size={15} />
            </button>
        );
    }

    const run = (action) => {
        setOpen(false);
        onAction(action, order);
    };

    return (
        <div className="order-menu-wrap" ref={wrapRef}>
            <button
                ref={btnRef}
                className="table-action-btn"
                title="Thao tác"
                aria-haspopup="menu"
                aria-expanded={open}
                disabled={busy}
                onClick={() => (open ? setOpen(false) : openMenu())}
            >
                {busy ? <Loader2 size={15} className="spin-icon" /> : <MoreHorizontal size={15} />}
            </button>

            {/* Đưa ra ngoài body: các ô sticky của những dòng phía dưới tạo ngữ cảnh
                xếp lớp riêng và sẽ vẽ đè lên menu nếu để nó nằm trong bảng. */}
            {open && pos && createPortal(
                <div className="order-menu" role="menu" style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}>
                    {actions.includes('verify') && (
                        <button role="menuitem" onClick={() => run('verify')}>
                            <BadgeCheck size={15} /> Xác nhận đã nhận tiền
                        </button>
                    )}
                    {actions.includes('complete') && (
                        <button role="menuitem" onClick={() => run('complete')}>
                            <CheckCircle2 size={15} /> Đánh dấu hoàn thành
                        </button>
                    )}
                    {actions.includes('refund') && (
                        <button role="menuitem" onClick={() => run('refund')}>
                            <RotateCcw size={15} /> Đánh dấu đã hoàn tiền
                        </button>
                    )}
                    {actions.includes('cancel') && (
                        <button role="menuitem" className="danger" onClick={() => run('cancel')}>
                            <XCircle size={15} /> Huỷ đơn
                        </button>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}

export default function AdminOrdersTab({ active, onViewDetail }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setOrders(await adminService.getAllBookings(statusFilter, fromDate, toDate));
        } catch (err) {
            toast.error(err.message || 'Không tải được danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, fromDate, toDate]);

    useEffect(() => {
        if (active) load();
    }, [active, load]);

    const handleAction = async (action, order) => {
        const code = order.id.substring(0, 8);
        let note = null;

        if (action === 'cancel') {
            note = window.prompt(`Lý do huỷ đơn ${code}:`);
            if (note === null) return;
            if (!note.trim()) {
                toast.error('Phải nhập lý do huỷ đơn.');
                return;
            }
        }

        if (action === 'refund') {
            note = window.prompt(
                `Lý do hoàn tiền đơn ${code}:\n\n`
                + 'Lưu ý: thao tác này chỉ ghi nhận trong hệ thống. '
                + 'Tiền thật bạn phải tự chuyển khoản trả khách.'
            );
            if (note === null) return;
            if (!note.trim()) {
                toast.error('Phải nhập lý do hoàn tiền.');
                return;
            }
        }

        if (action === 'complete'
            && !window.confirm(`Đánh dấu đơn ${code} là đã hoàn thành và giải ngân cho thợ?`)) {
            return;
        }

        if (action === 'verify'
            && !window.confirm(`Xác nhận đã nhận được tiền của đơn ${code}?`)) {
            return;
        }

        setBusyId(order.id);
        try {
            if (action === 'cancel') {
                await apiClient.cancelBooking(order.id, `Admin huỷ: ${note.trim()}`);
                toast.success('Đã huỷ đơn.');
            } else if (action === 'refund') {
                await adminService.refundBooking(order.id, note.trim());
                toast.success('Đã đánh dấu hoàn tiền.');
            } else if (action === 'complete') {
                await adminService.forceCompleteBooking(order.id);
                toast.success('Đã đánh dấu hoàn thành.');
            } else if (action === 'verify') {
                await adminService.verifyPayment(order.paymentId, true, null);
                toast.success('Đã xác nhận thanh toán.');
            }
            await load();
        } catch (err) {
            toast.error(err.message || 'Không thực hiện được thao tác.');
        } finally {
            setBusyId(null);
        }
    };

    if (!active) return null;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const hasDateFilter = Boolean(fromDate || toDate);

    return (
        <div className="admin-orders">
            <div className="dashboard-content-header">
                <h2>Quản lý đơn hàng</h2>
                <div className="order-summary-badges">
                    <span className="summary-badge">
                        <Package size={14} /> Tổng: <strong>{loading ? '…' : orders.length}</strong>
                    </span>
                    <span className="summary-badge revenue">
                        <DollarSign size={14} /> Giá trị: <strong>{loading ? '…' : formatPrice(totalRevenue)}</strong>
                    </span>
                </div>
            </div>

            <div className="orders-toolbar">
                <div className="admin-filter-row">
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.key}
                            className={`order-filter-tab ${statusFilter === f.key ? 'active' : ''}`}
                            onClick={() => setStatusFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="orders-date-filter">
                    <CalendarDays size={16} />
                    {/* Nói rõ lọc theo mốc nào: cột trong bảng là ngày chụp, còn đây là ngày tạo đơn. */}
                    <span className="orders-date-caption">Ngày tạo đơn</span>
                    <label className="sr-only" htmlFor="orders-from">Từ ngày</label>
                    <input
                        id="orders-from"
                        type="date"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                    <span className="orders-date-sep">đến</span>
                    <label className="sr-only" htmlFor="orders-to">Đến ngày</label>
                    <input
                        id="orders-to"
                        type="date"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                    {hasDateFilter && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { setFromDate(''); setToDate(''); }}
                        >
                            Xoá lọc
                        </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
                        <RefreshCw size={15} /> Tải lại
                    </button>
                </div>
            </div>

            {!loading && <OrdersCharts orders={orders} />}

            <div className="admin-table-wrapper">
                <table className="admin-table orders-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Thợ chụp</th>
                            <th>Dịch vụ</th>
                            <th>Ngày chụp</th>
                            <th>Tổng tiền</th>
                            <th>Thanh toán</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className="orders-cell-center"><Loader2 size={18} className="spin-icon" /></td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={9} className="orders-cell-center">Không có đơn hàng nào khớp bộ lọc</td></tr>
                        ) : orders.map(o => (
                            <tr key={o.id}>
                                <td><code className="order-code">{o.id.substring(0, 8)}</code></td>
                                <td>{o.customerName}</td>
                                <td>
                                    <div className="user-cell">
                                        <img
                                            src={o.photographerAvatar || avatarFallback(o.photographerName)}
                                            alt={o.photographerName}
                                            className="avatar"
                                            style={{ width: 28, height: 28 }}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = avatarFallback(o.photographerName);
                                            }}
                                        />
                                        <span>{o.photographerName}</span>
                                    </div>
                                </td>
                                <td>{o.service}</td>
                                <td className="td-date">{o.date}</td>
                                <td><strong className="td-price">{formatPrice(o.total)}</strong></td>
                                <td>
                                    <div className="orders-payment-cell">
                                        <StatusBadge status={o.paymentStatus} map={PAYMENT_LABELS} />
                                        <span className="orders-provider">
                                            {PROVIDER_LABELS[o.paymentProvider] || '—'}
                                        </span>
                                    </div>
                                </td>
                                <td><StatusBadge status={o.status} map={STATUS_LABELS} /></td>
                                <td>
                                    <div className="table-actions">
                                        <button
                                            className="table-action-btn"
                                            title="Xem chi tiết"
                                            onClick={() => onViewDetail(o.id)}
                                        >
                                            <Eye size={15} />
                                        </button>
                                        <ActionMenu
                                            order={o}
                                            busy={busyId === o.id}
                                            onAction={handleAction}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
