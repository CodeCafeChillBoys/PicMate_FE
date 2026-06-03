const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5274';

let bootstrap = {};
try {
  const res = await fetch(`${API_BASE_URL}/api/bootstrap`);
  if (res.ok) {
    bootstrap = await res.json();
  }
} catch {
  bootstrap = {};
}

// Mock data for development
const mockPhotographers = [
  {
    id: 1,
    name: 'Nguyễn Anh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop',
    location: 'TP.HCM',
    rating: 4.9,
    reviewCount: 234,
    isOnline: true,
    isVerified: true,
    styles: ['Vintage', 'Hàn Quốc'],
    portfolio: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1502781252888-8f5a9c37d215?w=400&h=400&fit=crop'
    ],
    pricing: { hourly: 150000, daily: 500000 }
  },
  {
    id: 2,
    name: 'Trần Minh',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop',
    location: 'Hà Nội',
    rating: 4.8,
    reviewCount: 189,
    isOnline: true,
    isVerified: true,
    styles: ['Minimal', 'Street'],
    portfolio: [
      'https://images.unsplash.com/photo-1505105794635-ff659b6c4e31?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1514306688989-e1b5d3cfcc74?w=400&h=400&fit=crop'
    ],
    pricing: { hourly: 120000, daily: 400000 }
  },
  {
    id: 3,
    name: 'Lê Hương',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop',
    location: 'Đà Nẵng',
    rating: 4.7,
    reviewCount: 156,
    isOnline: false,
    isVerified: true,
    styles: ['Thiên nhiên', 'Nghệ thuật'],
    portfolio: [
      'https://images.unsplash.com/photo-1495934558409-384de541e183?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'
    ],
    pricing: { hourly: 100000, daily: 350000 }
  },
  {
    id: 4,
    name: 'Phạm Quân',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop',
    location: 'TP.HCM',
    rating: 4.9,
    reviewCount: 312,
    isOnline: true,
    isVerified: true,
    styles: ['Fashion', 'Lifestyle'],
    portfolio: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
    ],
    pricing: { hourly: 200000, daily: 600000 }
  },
  {
    id: 5,
    name: 'Vũ Thảo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop',
    location: 'Cần Thơ',
    rating: 4.6,
    reviewCount: 98,
    isOnline: true,
    isVerified: false,
    styles: ['Hàn Quốc', 'Minimal'],
    portfolio: [
      'https://images.unsplash.com/photo-1505105794635-ff659b6c4e31?w=400&h=400&fit=crop'
    ],
    pricing: { hourly: 80000, daily: 280000 }
  },
  {
    id: 6,
    name: 'Đặng Nam',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop',
    location: 'Biên Hòa',
    rating: 4.8,
    reviewCount: 267,
    isOnline: false,
    isVerified: true,
    styles: ['Sự kiện', 'Thiên nhiên'],
    portfolio: [
      'https://images.unsplash.com/photo-1495934558409-384de541e183?w=400&h=400&fit=crop'
    ],
    pricing: { hourly: 180000, daily: 550000 }
  }
];

const mockStyles = [
  { id: 1, name: 'Hàn Quốc', emoji: '🎌', color: '#FF6B9D' },
  { id: 2, name: 'Vintage', emoji: '📸', color: '#C44569' },
  { id: 3, name: 'Minimal', emoji: '⚪', color: '#4A90E2' },
  { id: 4, name: 'Street', emoji: '🏙️', color: '#F5A623' },
  { id: 5, name: 'Fashion', emoji: '👗', color: '#9013FE' },
  { id: 6, name: 'Lifestyle', emoji: '🌿', color: '#7ED321' }
];

const mockPresets = [
  {
    id: 1,
    name: 'Golden Hour',
    category: 'Warm',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    rating: 4.9,
    downloads: '12.5K',
    price: 49000
  },
  {
    id: 2,
    name: 'Cool Blue',
    category: 'Cool',
    image: 'https://images.unsplash.com/photo-1505105794635-ff659b6c4e31?w=300&h=300&fit=crop',
    rating: 4.8,
    downloads: '8.3K',
    price: 39000
  },
  {
    id: 3,
    name: 'B&W Film',
    category: 'B&W',
    image: 'https://images.unsplash.com/photo-1514306688989-e1b5d3cfcc74?w=300&h=300&fit=crop',
    rating: 4.7,
    downloads: '15.2K',
    price: 29000
  },
  {
    id: 4,
    name: 'Vibrant',
    category: 'Saturated',
    image: 'https://images.unsplash.com/photo-1495934558409-384de541e183?w=300&h=300&fit=crop',
    rating: 4.9,
    downloads: '20.1K',
    price: 59000
  }
];

const mockTestimonials = [
  {
    id: 1,
    name: 'Linh Nguyễn',
    role: 'Content Creator',
    text: 'PICMate đã giúp tôi tìm được những thợ chụp tài năng. Chất lượng ảnh tuyệt vời và dịch vụ rất chuyên nghiệp!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop',
    rating: 5
  },
  {
    id: 2,
    name: 'Huy Trần',
    role: 'Marketing Manager',
    text: 'Cực kỳ thuận tiện. Đặt lịch chỉ trong vài phút, thợ chụp đến đúng giờ và kết quả vượt mong đợi.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop',
    rating: 5
  },
  {
    id: 3,
    name: 'Mỹ Anh',
    role: 'E-commerce Owner',
    text: 'Tôi sử dụng PICMate cho ảnh sản phẩm. Giá cả hợp lý, chất lượng chuyên nghiệp. Rất hài lòng!',
    avatar: 'https://images.unsplash.com/photo-1517457373614-b7152f800529?w=64&h=64&fit=crop',
    rating: 4
  }
];

const mockMembershipPlans = [
  {
    id: 1,
    name: 'Free',
    price: 0,
    popular: false,
    features: ['Đặt lịch chụp ảnh', 'Xem portfolio', 'Nhận review']
  },
  {
    id: 2,
    name: 'Pro',
    price: 99000,
    popular: true,
    features: ['Tất cả tính năng Free', 'Ưu tiên booking', 'Giảm giá 10% dịch vụ', 'Preset mới hàng tuần']
  },
  {
    id: 3,
    name: 'Premium',
    price: 199000,
    popular: false,
    features: ['Tất cả tính năng Pro', 'Giảm giá 20% dịch vụ', 'Tư vấn chuyên gia', 'Tất cả preset miễn phí']
  }
];

export const photographers = bootstrap.photographers || mockPhotographers;
export const styles = bootstrap.styles || mockStyles;
export const services = bootstrap.services || [];
export const presets = bootstrap.presets || mockPresets;
export const bookingStatuses = bootstrap.bookingStatuses || [];
export const mockBookings = bootstrap.bookings || [];
export const testimonials = bootstrap.testimonials || mockTestimonials;
export const membershipPlans = bootstrap.membershipPlans || mockMembershipPlans;
export const mockUsers = bootstrap.mockUsers || [];
export const mockMessages = bootstrap.mockMessages || [];
export const mockDisputes = bootstrap.mockDisputes || [];
export const mockActivities = bootstrap.mockActivities || [];
export const favoritePhotographerIds = bootstrap.favoritePhotographerIds || [];

export const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(price || 0)}d`;


