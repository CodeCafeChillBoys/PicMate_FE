/**
 * Biểu đồ miền cho xu hướng theo thời gian.
 * Nhận mảng { label, value } và một hàm định dạng số để hiện trong tooltip.
 */
export default function TrendChart({ points = [], color = 'var(--primary)', formatValue = (v) => v }) {
    const width = 720;
    const height = 240;
    const padLeft = 8;
    const padRight = 8;
    const padTop = 12;
    const padBottom = 28;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const nums = points.map(p => Number(p.value) || 0);
    const max = nums.length ? Math.max(...nums) : 0;

    // Không có dữ liệu hoặc toàn số 0 thì vẫn phải vẽ lưới và trục, chỉ là đường nằm đáy.
    const safeMax = max > 0 ? max : 1;
    const stepX = points.length > 1 ? plotW / (points.length - 1) : 0;

    const toX = (i) => padLeft + i * stepX;
    const toY = (v) => padTop + plotH - (v / safeMax) * plotH;

    const coords = points.map((p, i) => ({
        x: toX(i),
        y: toY(Number(p.value) || 0),
        label: p.label,
        value: Number(p.value) || 0,
    }));

    const line = coords.map(c => `${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' L');
    const area = coords.length
        ? `M${padLeft},${padTop + plotH} L${line} L${(padLeft + plotW).toFixed(2)},${padTop + plotH} Z`
        : '';

    // Chỉ hiện vài nhãn trục để không chồng chữ lên nhau.
    const labelEvery = Math.max(1, Math.ceil(points.length / 5));

    return (
        <div className="trend-chart">
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img">
                {[0, 0.25, 0.5, 0.75, 1].map(t => {
                    const y = padTop + plotH * t;
                    return (
                        <line
                            key={t}
                            x1={padLeft} y1={y} x2={padLeft + plotW} y2={y}
                            stroke="currentColor" strokeWidth="1" opacity="0.08"
                        />
                    );
                })}

                {coords.length > 1 && <path d={area} fill={color} opacity="0.12" />}
                {coords.length > 1 && (
                    <polyline
                        points={coords.map(c => `${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ')}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                    />
                )}
            </svg>

            {/* Nhãn trục và điểm chạm nằm ngoài SVG để chữ không bị kéo méo bởi preserveAspectRatio="none". */}
            <div className="trend-chart-hotspots">
                {coords.map((c, i) => (
                    <div
                        key={i}
                        className="trend-chart-hotspot"
                        style={{ left: `${(c.x / width) * 100}%` }}
                        title={`${c.label}: ${formatValue(c.value)}`}
                    />
                ))}
            </div>

            <div className="trend-chart-axis">
                {points.map((p, i) => (
                    <span
                        key={i}
                        className="trend-chart-axis-label"
                        style={{ left: `${(toX(i) / width) * 100}%` }}
                    >
                        {i % labelEvery === 0 || i === points.length - 1 ? p.label : ''}
                    </span>
                ))}
            </div>
        </div>
    );
}
