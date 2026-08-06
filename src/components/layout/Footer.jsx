import { Link } from 'react-router-dom';
import { Camera, Instagram, Facebook, Mail, Phone, MapPin, Heart, Download } from 'lucide-react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer" id="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <img src="/Logo.jpg" alt="PIC PLS Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                            <span>PIC <strong>PLS</strong></span>
                        </Link>
                        <p className="footer-desc">
                            Nền tảng đặt lịch chụp ảnh Phone-Grapher #1 Việt Nam. Kết nối bạn với thợ chụp tài năng chỉ trong vài giây.
                        </p>
                        <div className="footer-socials">
                            <a href="https://www.facebook.com/profile.php?id=61590515463360" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="Facebook"><Facebook size={20} /></a>
                            <a href="mailto:picpls202@gmail.com" className="footer-social" aria-label="Email"><Mail size={20} /></a>

                            <a href="https://www.tiktok.com/@picpls201?_r=1&_t=ZS-98Qky9TJ9uy" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="TikTok">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                </svg>
                            </a>

                        </div>
                    </div>

                    <div className="footer-col">
                        <h4>Khám phá</h4>
                        <Link to="/explore">Tìm Phone-Grapher</Link>
                        <Link to="/presets">Preset Shop</Link>
                        <Link to="/instant">Đặt gấp – Chụp ngay</Link>
                        <Link to="/auth?role=photographer">Trở thành Phone-Grapher</Link>
                    </div>

                    <div className="footer-col">
                        <h4>Hỗ trợ</h4>

                        <Link to="/faq">Câu hỏi thường gặp</Link>
                        <Link to="/privacy">Chính sách bảo mật</Link>
                        <Link to="/terms">Điều khoản sử dụng</Link>
                        <Link to="/refund-policy">Chính sách hoàn tiền</Link>
                    </div>

                    <div className="footer-col">
                        <h4>Ứng dụng</h4>
                        {/* Thay đổi href thành tên file APK bạn đã copy vào thư mục public */}
                        <a href="/PicPls.apk" download className="app-download-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={16} /> Tải App (APK)
                        </a>
                    </div>

                    <div className="footer-col">
                        <h4>Liên hệ</h4>
                        <a href="mailto:picpls202@gmail.com" className="footer-contact">
                            <Mail size={16} />
                            picpls202@gmail.com
                        </a>
                        <a href="#" className="footer-contact">
                            <Phone size={16} />
                            0909 xxx xxx
                        </a>
                        <a href="#" className="footer-contact">
                            <MapPin size={16} />
                            TP. Hồ Chí Minh, Việt Nam
                        </a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 PIC PLS. Made with <Heart size={14} className="footer-heart" /> in Vietnam</p>
                </div>
            </div>
        </footer>
    );
}
