/**
 * Sinh CSV ngay tại trình duyệt từ dữ liệu dashboard đã tải.
 * Không cần endpoint riêng và không cần thư viện.
 */

const RANGE_LABELS = {
    today: 'Hôm nay',
    '7d': '7 ngày qua',
    '30d': '30 ngày qua',
    quarter: 'Quý gần nhất',
};

/** Bọc ô có dấu phẩy, nháy kép hoặc xuống dòng theo đúng quy ước CSV. */
function escapeCell(value) {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows) {
    return rows.map(row => row.map(escapeCell).join(',')).join('\r\n');
}

export function buildDashboardCsv(data) {
    const rows = [];
    const push = (...cells) => rows.push(cells);

    push('BÁO CÁO TỔNG QUAN PICMATE');
    push('Khoảng thời gian', RANGE_LABELS[data.range] || data.range);
    push('Từ', new Date(data.fromUtc).toLocaleString('vi-VN'));
    push('Đến', new Date(data.toUtc).toLocaleString('vi-VN'));
    push('Xuất lúc', new Date().toLocaleString('vi-VN'));
    push();

    push('CHỈ SỐ CHÍNH');
    push('Chỉ số', 'Kỳ này', 'Kỳ trước', 'Thay đổi (%)');
    const kpiRows = [
        ['Người dùng hoạt động', data.kpis.activeUsers],
        ['Tổng phút chụp', data.kpis.shootMinutes],
        ['Doanh thu', data.kpis.revenue],
        ['Thợ đã duyệt', data.kpis.verifiedGraphers],
        ['Tỉ lệ hoàn thành đơn (%)', data.kpis.completionRate],
    ];
    kpiRows.forEach(([label, metric]) => {
        push(label, metric.current, metric.previous,
            metric.changePercent === null || metric.changePercent === undefined ? 'không so sánh được' : metric.changePercent);
    });
    push();

    push('XU HƯỚNG DOANH THU');
    push('Mốc', 'Doanh thu');
    data.revenueTrend.forEach(p => push(p.label, p.value));
    push();

    push('XU HƯỚNG NGƯỜI DÙNG HOẠT ĐỘNG');
    push('Mốc', 'Số người');
    data.activeUserTrend.forEach(p => push(p.label, p.value));
    push();

    push('CƠ CẤU NGƯỜI DÙNG');
    push('Nhóm', 'Số lượng', 'Tỉ lệ (%)');
    data.userComposition.forEach(s => push(s.label, s.value, s.percent));
    push();

    push('DOANH THU THEO CỔNG THANH TOÁN');
    push('Cổng', 'Doanh thu', 'Tỉ lệ (%)');
    data.revenueByGateway.forEach(s => push(s.label, s.value, s.percent));
    push();

    push('MỤC TIÊU QUÝ');
    push('Mục tiêu', 'Hiện tại', 'Chỉ tiêu', 'Tiến độ (%)');
    data.goals.forEach(g => push(g.label, g.current, g.target, g.percent));

    return toCsv(rows);
}

export function downloadDashboardCsv(data) {
    // BOM UTF-8 để Excel trên Windows không hiển thị tiếng Việt thành ký tự lạ.
    const blob = new Blob(['﻿' + buildDashboardCsv(data)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 10);

    const link = document.createElement('a');
    link.href = url;
    link.download = `picmate-tong-quan-${data.range}-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
