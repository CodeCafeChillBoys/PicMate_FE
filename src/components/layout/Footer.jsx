import { Link } from 'react-router-dom';
import { Camera, Instagram, Facebook, Mail, Phone, MapPin, Heart } from 'lucide-react';
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

                            <a href="https://www.tiktok.com/@picpls201?_r=1&_t=ZS-98Qky9TJ9uy" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="TikTok" style={{ fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center' }}>TikTok</a>

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
                    <p>© 2025 PIC PLS. Made with <Heart size={14} className="footer-heart" /> in Vietnam</p>
                </div>
            </div>
        </footer>
    );
}
