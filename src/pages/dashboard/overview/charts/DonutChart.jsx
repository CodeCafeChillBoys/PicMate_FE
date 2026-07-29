/**
 * Biểu đồ tròn có lỗ giữa, kèm chú giải.
 *
 * Cung được tính từ `value` chứ không phải từ `percent` của backend:
 * percent đã làm tròn một chữ số nên ba phần bằng nhau chỉ cộng được 99,9
 * và vẽ theo đó sẽ hở một khe.
 */
export default function DonutChart({
    slices = [],
    colors = [],
    centerValue,
    centerLabel,
    formatValue = (v) => v,
}) {
    const size = 200;
    const radius = 72;
    const stroke = 28;
    const circumference = 2 * Math.PI * radius;

    const values = slices.map(s => Math.max(0, Number(s.value) || 0));
    const total = values.reduce((sum, v) => sum + v, 0);

    let offset = 0;
    const arcs = total > 0
        ? values.map((value, i) => {
            const length = (value / total) * circumference;
            const arc = {
                key: i,
                color: colors[i % colors.length],
                dashArray: `${length} ${circumference - length}`,
                dashOffset: -offset,
                visible: value > 0,
            };
            offset += length;
            return arc;
        })
        : [];

    return (
        <div className="donut">
            <div className="donut-figure">
                <svg viewBox={`0 0 ${size} ${size}`} role="img">
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="var(--border-color, #e5e7eb)" strokeWidth={stroke}
                    />
                    {arcs.filter(a => a.visible).map(a => (
                        <circle
                            key={a.key}
                            cx={size / 2} cy={size / 2} r={radius}
                            fill="none"
                            stroke={a.color}
                            strokeWidth={stroke}
                            strokeDasharray={a.dashArray}
                            strokeDashoffset={a.dashOffset}
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        />
                    ))}
                </svg>
                <div className="donut-center">
                    <strong>{centerValue}</strong>
                    <span>{centerLabel}</span>
                </div>
            </div>

            <ul className="donut-legend">
                {slices.map((s, i) => (
                    <li key={s.label}>
                        <span className="donut-legend-dot" style={{ background: colors[i % colors.length] }} />
                        <span className="donut-legend-label">{s.label}</span>
                        <strong className="donut-legend-value">{formatValue(s.value)}</strong>
                        <span className="donut-legend-percent">{Number(s.percent ?? 0).toFixed(1)}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
