/**
 * Thanh tiến độ cho khối "Mục tiêu quý".
 * Phần trăm do backend tính; ở đây chỉ chặn tràn khi vượt chỉ tiêu.
 */
export default function ProgressBar({ label, current, target, percent, formatValue = (v) => v }) {
    const safePercent = Math.max(0, Number(percent) || 0);
    const width = Math.min(safePercent, 100);

    return (
        <div className="goal-row">
            <div className="goal-row-head">
                <span className="goal-label">{label}</span>
                <span className="goal-numbers">
                    <strong>{formatValue(current)}</strong>
                    <span className="goal-sep">/</span>
                    <span>{formatValue(target)}</span>
                </span>
            </div>
            <div className="goal-track">
                <div
                    className={`goal-fill ${safePercent >= 100 ? 'goal-fill-done' : ''}`}
                    style={{ width: `${width}%` }}
                />
            </div>
            <span className="goal-percent">{safePercent.toFixed(1)}%</span>
        </div>
    );
}
