export const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(price || 0)}đ`;


