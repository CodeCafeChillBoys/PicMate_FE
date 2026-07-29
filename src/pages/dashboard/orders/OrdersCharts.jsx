import { BarChart3, PieChart } from 'lucide-react';
import DonutChart from '../overview/charts/DonutChart';

const STATUS_ORDER = [
    { key: 'PendingPayment', label: 'Chờ thanh toán', color: '#FDCB6E' },
    { key: 'PendingConfirmation', label: 'Chờ xác nhận', color: '#FD9644' },
    { key: 'Confirmed', label: 'Đã xác nhận', color: '#6C5CE7' },
    { key: 'InProgress', label: 'Đang thực hiện', color: '#0984E3' },
    { key: 'Completed', label: 'Hoàn thành', color: '#00B894' },
    { key: 'Cancelled', label: 'Đã huỷ', color: '#E17076' },
];

// 10 mốc là mức nhãn ngày còn đọc ngang được, không phải xoay chéo.
const MAX_BARS = 10;
const DAY_MS = 86_400_000;

const startOfDay = (value) => {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d;
};

const formatDay = (date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

/**
 * Gom số đơn theo ngày tạo.
 * Khoảng dài hơn MAX_BARS ngày thì gộp thành các đoạn đều nhau để cột không bị vụn.
 * Trả về mảng { label, value, hint }.
 */
function buildDailyCounts(orders, maxBars = MAX_BARS) {
    const times = orders
        .map(o => new Date(o.createdAt).getTime())
        .filter(t => Number.isFinite(t));

    if (times.length === 0) return [];

    const first = startOfDay(Math.min(...times));
    const last = startOfDay(Math.max(...times));
    const dayCount = Math.round((last - first) / DAY_MS) + 1;

    // Mỗi cột một ngày khi khoảng đủ ngắn.
    if (dayCount <= maxBars) {
        return Array.from({ length: dayCount }, (_, i) => {
            const dayStart = new Date(first.getTime() + i * DAY_MS);
            const dayEnd = dayStart.getTime() + DAY_MS;
            const value = times.filter(t => t >= dayStart.getTime() && t < dayEnd).length;
            return { label: formatDay(dayStart), value, hint: `${formatDay(dayStart)}: ${value} đơn` };
        });
    }

    const bucketMs = Math.ceil((dayCount * DAY_MS) / maxBars);
    return Array.from({ length: maxBars }, (_, i) => {
        const start = first.getTime() + i * bucketMs;
        const end = i === maxBars - 1 ? last.getTime() + DAY_MS : start + bucketMs;
        const value = times.filter(t => t >= start && t < end).length;
        const from = formatDay(new Date(start));
        const to = formatDay(new Date(end - DAY_MS));
        return { label: from, value, hint: `${from}–${to}: ${value} đơn` };
    });
}

/** Biểu đồ cột đơn giản, không dùng thư viện ngoài. */
function BarChart({ bars }) {
    const max = Math.max(...bars.map(b => b.value), 1);

    return (
        <div className="orders-bars" role="img" aria-label="Số đơn theo ngày tạo">
            {bars.map((b, i) => (
                <div className="orders-bar-col" key={i} title={b.hint}>
                    <span className="orders-bar-value">{b.value > 0 ? b.value : ''}</span>
                    <div className="orders-bar-track">
                        {/* Đơn bằng 0 vẫn chừa một vạch mảnh để thấy ngày đó có tồn tại. */}
                        <div
                            className={`orders-bar-fill ${b.value === 0 ? 'is-empty' : ''}`}
                            style={{ height: b.value === 0 ? '2px' : `${(b.value / max) * 100}%` }}
                        />
                    </div>
                    <span className="orders-bar-label">{b.label}</span>
                </div>
            ))}
        </div>
    );
}

/**
 * Hai biểu đồ tóm tắt nằm trên bảng đơn hàng.
 * Tính ngay từ danh sách đang hiển thị nên luôn khớp bộ lọc trạng thái và khoảng ngày.
 */
export default function OrdersCharts({ orders }) {
    if (!orders || orders.length === 0) return null;

    const total = orders.length;

    const statusSlices = STATUS_ORDER
        .map(s => {
            const value = orders.filter(o => o.status === s.key).length;
            return {
                label: s.label,
                value,
                percent: total === 0 ? 0 : Number(((value / total) * 100).toFixed(1)),
                color: s.color,
            };
        })
        .filter(s => s.value > 0);

    const bars = buildDailyCounts(orders);

    return (
        <div className="orders-charts">
            <section className="orders-chart-card">
                <header className="orders-chart-head">
                    <h3><PieChart size={16} /> Đơn theo trạng thái</h3>
                    <p>Trong phần đang lọc · cho thấy đơn đang ứ ở khâu nào</p>
                </header>
                <div className="orders-chart-body">
                    <DonutChart
                        slices={statusSlices}
                        colors={statusSlices.map(s => s.color)}
                        centerValue={total}
                        centerLabel="đơn"
                        formatValue={(v) => `${v}`}
                    />
                </div>
            </section>

            <section className="orders-chart-card">
                <header className="orders-chart-head">
                    <h3><BarChart3 size={16} /> Số đơn theo ngày tạo</h3>
                    <p>
                        {bars.length > 0
                            ? `${bars.length} mốc · từ ${bars[0].label} đến ${bars[bars.length - 1].label}`
                            : 'Chưa có dữ liệu'}
                    </p>
                </header>
                <div className="orders-chart-body">
                    <BarChart bars={bars} />
                </div>
            </section>
        </div>
    );
}
