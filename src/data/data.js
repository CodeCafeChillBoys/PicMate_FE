export const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(price || 0)}đ`;

// Ảnh đại diện dự phòng dạng SVG inline (chữ cái đầu của tên) — không phụ thuộc dịch vụ ngoài,
// nên không bao giờ bị vỡ ảnh khi avatar trống hoặc URL hỏng.
export const avatarFallback = (name) => {
  const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" rx="100" fill="#6C5CE7"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="96" fill="#ffffff">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};


