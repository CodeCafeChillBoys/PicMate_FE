/**
 * Đường xu hướng thu nhỏ nằm trong thẻ KPI.
 * Hàm thuần: nhận mảng số, trả SVG. Không gọi API, không state.
 */
export default function Sparkline({ values = [], color = 'var(--primary)', height = 40 }) {
    const width = 240;

    // Dưới 2 điểm thì không vẽ được đường, kẻ một vạch phẳng cho khỏi trống.
    if (!Array.isArray(values) || values.length < 2) {
        return (
            <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
                <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke={color} strokeWidth="1.5" opacity="0.35" />
            </svg>
        );
    }

    const nums = values.map(v => Number(v) || 0);
    const max = Math.max(...nums);
    const min = Math.min(...nums);
    const span = max - min;
    const stepX = width / (nums.length - 1);

    // Mọi giá trị bằng nhau thì vẽ đường nằm giữa thay vì chia cho 0.
    const toY = (v) => {
        if (span === 0) return height / 2;
        return height - 2 - ((v - min) / span) * (height - 4);
    };

    const points = nums.map((v, i) => `${(i * stepX).toFixed(2)},${toY(v).toFixed(2)}`);
    const areaPath = `M0,${height} L${points.join(' L')} L${width},${height} Z`;

    return (
        <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
            <path d={areaPath} fill={color} opacity="0.12" />
            <polyline
                points={points.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}
