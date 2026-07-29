import { useState, useEffect, useCallback } from 'react';
import {
    Download, Loader2, TrendingUp, TrendingDown, Minus, Clock, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { formatPrice } from '../../../data/data';
import Sparkline from './charts/Sparkline';
import TrendChart from './charts/TrendChart';
import DonutChart from './charts/DonutChart';
import ProgressBar from './charts/ProgressBar';
import { downloadDashboardCsv } from './exportCsv';
import toast from 'react-hot-toast';
import './AdminOverviewTab.css';

const RANGES = [
    { key: 'today', label: 'Hôm nay' },
    { key: '7d', label: '7 ngày' },
    { key: '30d', label: '30 ngày' },
    { key: 'quarter', label: 'Quý' },
];

const RANGE_CAPTION = {
    today: 'hôm nay',
    '7d': '7 ngày qua',
    '30d': '30 ngày qua',
    quarter: '90 ngày qua',
};

const COLOR_PRIMARY = '#6C5CE7';
const COLOR_GREEN = '#00B894';
const USER_COLORS = ['#6C5CE7', '#00B894', '#FDCB6E'];
const GATEWAY_COLORS = ['#00B894', '#6C5CE7', '#FD9644'];

const fmtInt = (v) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(v) || 0));
const fmtRate = (v) => `${(Number(v) || 0).toFixed(1)}%`;

/** Ô chỉ số: giá trị lớn, so sánh kỳ trước, đường xu hướng thu nhỏ. */
function KpiCard({ label, metric, caption, format, color }) {
    const change = metric?.changePercent;
    const hasChange = change !== null && change !== undefined;
    // Bằng đúng kỳ trước thì không phải tăng cũng không phải giảm — đừng vẽ mũi tên lên.
    const isFlat = hasChange && Number(change) === 0;
    const isUp = hasChange && change > 0;

    return (
        <div className="kpi-card">
            <span className="kpi-label">{label}</span>
            <strong className="kpi-value">{format(metric?.current ?? 0)}</strong>
            <div className="kpi-meta">
                {hasChange ? (
                    <span className={`kpi-delta ${isFlat ? 'flat' : isUp ? 'up' : 'down'}`}>
                        {isFlat ? <Minus size={13} /> : isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {Math.abs(change).toFixed(1)}%
                    </span>
                ) : (
                    // Kỳ trước bằng 0 thì không có mẫu số để so sánh — nói thẳng thay vì hiện số bịa.
                    <span className="kpi-delta none" title="Kỳ trước không có dữ liệu để so sánh">—</span>
                )}
                <span className="kpi-caption">{caption}</span>
            </div>
            <Sparkline values={metric?.sparkline ?? []} color={color} />
        </div>
    );
}

export default function AdminOverviewTab({ active, activities = [], activitiesLoading = false }) {
    const [range, setRange] = useState('30d');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async (nextRange) => {
        setLoading(true);
        setError(null);
        try {
            setData(await adminService.getAnalytics(nextRange));
        } catch (err) {
            setError(err.message || 'Không tải được dữ liệu tổng quan.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (active) load(range);
    }, [active, range, load]);

    if (!active) return null;

    const handleExport = () => {
        if (!data) return;
        try {
            downloadDashboardCsv(data);
            toast.success('Đã xuất báo cáo CSV.');
        } catch (err) {
            toast.error(err.message || 'Không xuất được báo cáo.');
        }
    };

    const caption = RANGE_CAPTION[range];
    const totalUsers = data ? data.userComposition.reduce((s, x) => s + Number(x.value || 0), 0) : 0;
    const totalGatewayRevenue = data ? data.revenueByGateway.reduce((s, x) => s + Number(x.value || 0), 0) : 0;

    return (
        <div className="admin-overview">
            {/* ── Thanh điều khiển ─────────────────────────────────────────── */}
            <div className="overview-toolbar">
                <div className="range-tabs" role="tablist">
                    {RANGES.map(r => (
                        <button
                            key={r.key}
                            role="tab"
                            aria-selected={range === r.key}
                            className={`range-tab ${range === r.key ? 'active' : ''}`}
                            onClick={() => setRange(r.key)}
                        >
                            {r.label}
                        </button>
                    ))}
                    <span className="overview-status">
                        {loading ? <><Loader2 size={14} className="spin-icon" /> Đang tải…</> : 'Cập nhật vừa xong'}
                    </span>
                </div>
                <div className="overview-toolbar-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => load(range)} disabled={loading}>
                        <RefreshCw size={16} /> Tải lại
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={!data || loading}>
                        <Download size={16} /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {error && (
                <div className="overview-error">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {!data && loading && (
                <div className="overview-loading"><Loader2 size={28} className="spin-icon" /></div>
            )}

            {data && (
                <>
                    {/* ── 5 ô chỉ số ───────────────────────────────────────── */}
                    <div className="kpi-grid">
                        <KpiCard label="Người dùng hoạt động" metric={data.kpis.activeUsers}
                            caption={caption} format={fmtInt} color={COLOR_PRIMARY} />
                        <KpiCard label="Tổng phút chụp" metric={data.kpis.shootMinutes}
                            caption="vs kỳ trước" format={fmtInt} color={COLOR_PRIMARY} />
                        <KpiCard label="Doanh thu" metric={data.kpis.revenue}
                            caption="vs kỳ trước" format={formatPrice} color={COLOR_PRIMARY} />
                        <KpiCard label="Thợ đã duyệt" metric={data.kpis.verifiedGraphers}
                            caption="tổng hiện tại" format={fmtInt} color={COLOR_GREEN} />
                        <KpiCard label="Tỉ lệ hoàn thành đơn" metric={data.kpis.completionRate}
                            caption="vs kỳ trước" format={fmtRate} color={COLOR_GREEN} />
                    </div>

                    {/* ── 2 biểu đồ xu hướng ───────────────────────────────── */}
                    <div className="overview-two-col">
                        <section className="overview-card">
                            <header className="overview-card-head">
                                <h3>Xu hướng doanh thu</h3>
                                <p>{caption} · gom theo 12 đoạn</p>
                            </header>
                            <div className="overview-card-body">
                                <span className="chart-legend"><i style={{ background: COLOR_PRIMARY }} /> Kỳ này</span>
                                <TrendChart points={data.revenueTrend} color={COLOR_PRIMARY} formatValue={formatPrice} />
                            </div>
                        </section>

                        <section className="overview-card">
                            <header className="overview-card-head">
                                <h3>Xu hướng người dùng hoạt động</h3>
                                <p>{caption} · gom theo 12 đoạn</p>
                            </header>
                            <div className="overview-card-body">
                                <span className="chart-legend"><i style={{ background: COLOR_GREEN }} /> Kỳ này</span>
                                <TrendChart points={data.activeUserTrend} color={COLOR_GREEN} formatValue={fmtInt} />
                            </div>
                        </section>
                    </div>

                    {/* ── 2 biểu đồ tròn ───────────────────────────────────── */}
                    <div className="overview-two-col">
                        <section className="overview-card">
                            <header className="overview-card-head">
                                <h3>Cơ cấu người dùng</h3>
                                <p>Theo vai trò · tổng hiện tại</p>
                            </header>
                            <div className="overview-card-body">
                                <DonutChart
                                    slices={data.userComposition}
                                    colors={USER_COLORS}
                                    centerValue={fmtInt(totalUsers)}
                                    centerLabel="người dùng"
                                    formatValue={fmtInt}
                                />
                            </div>
                        </section>

                        <section className="overview-card">
                            <header className="overview-card-head">
                                <h3>Doanh thu theo cổng thanh toán</h3>
                                <p>{caption} · đơn đã thanh toán</p>
                            </header>
                            <div className="overview-card-body">
                                <DonutChart
                                    slices={data.revenueByGateway}
                                    colors={GATEWAY_COLORS}
                                    centerValue={formatPrice(totalGatewayRevenue)}
                                    centerLabel="doanh thu"
                                    formatValue={formatPrice}
                                />
                            </div>
                        </section>
                    </div>

                    {/* ── Hoạt động gần đây + Tình trạng hệ thống + Mục tiêu ─ */}
                    <div className="overview-split">
                        <section className="overview-card">
                            <header className="overview-card-head">
                                <h3>Hoạt động gần đây</h3>
                                <p>Toàn hệ thống · mới nhất trước</p>
                            </header>
                            <div className="overview-card-body">
                                {activitiesLoading ? (
                                    <div className="overview-loading"><Loader2 size={20} className="spin-icon" /></div>
                                ) : activities.length === 0 ? (
                                    <p className="overview-empty">Chưa có hoạt động nào</p>
                                ) : (
                                    <ul className="activity-log">
                                        {activities.map(a => (
                                            <li key={a.id}>
                                                <span className="activity-log-icon">{a.icon}</span>
                                                <p className="activity-log-text">{a.text}</p>
                                                <span className="activity-log-time">{a.time}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>

                        <div className="overview-side">
                        <section className="overview-card">
                            <header className="overview-card-head">
                                <h3>Tình trạng hệ thống</h3>
                                <p>Đọc theo cấu hình thực tế</p>
                            </header>
                            <div className="overview-card-body">
                                <ul className="health-list">
                                    {data.health.items.map(item => (
                                        <li key={item.name}>
                                            <span className="health-name">{item.name}</span>
                                            <span className={`health-pill ${item.isHealthy ? 'ok' : 'off'}`}>
                                                <i /> {item.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="health-note">
                                    <Clock size={13} /> Thời gian dựng báo cáo <code>{data.health.apiLatencyMs} ms</code>
                                </p>
                            </div>
                        </section>

                        <section className="overview-card">
                            <header className="overview-card-head">
                                <h3>Mục tiêu quý</h3>
                                <p>Tiến độ so với chỉ tiêu · sửa ở tab Cài đặt</p>
                            </header>
                            <div className="overview-card-body">
                                {data.goals.map(goal => (
                                    <ProgressBar
                                        key={goal.label}
                                        label={goal.label}
                                        current={goal.current}
                                        target={goal.target}
                                        percent={goal.percent}
                                        formatValue={goal.label === 'Doanh thu quý' ? formatPrice : fmtInt}
                                    />
                                ))}
                            </div>
                        </section>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
