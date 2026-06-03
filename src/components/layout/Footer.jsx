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
                            <Camera size={28} strokeWidth={2.5} />
                            <span>PIC<strong>Mate</strong></span>
                        </Link>
                        <p className="footer-desc">
                            Nền tảng đặt lịch chụp ảnh Phone-Grapher #1 Việt Nam. Kết nối bạn với thợ chụp tài năng chỉ trong vài giây.
                        </p>
                        <div className="footer-socials">
                            <a href="#" className="footer-social" aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="#" className="footer-social" aria-label="Facebook"><Facebook size={20} /></a>
                            <a href="#" className="footer-social" aria-label="Email"><Mail size={20} /></a>
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
                        <a href="#">Câu hỏi thường gặp</a>
                        <a href="#">Chính sách bảo mật</a>
                        <a href="#">Điều khoản sử dụng</a>
                        <a href="#">Chính sách hoàn tiền</a>
                    </div>

                    <div className="footer-col">
                        <h4>Liên hệ</h4>
                        <a href="#" className="footer-contact">
                            <Mail size={16} />
                            hello@picmate.vn
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
                    <p>© 2025 PICMate. Made with <Heart size={14} className="footer-heart" /> in Vietnam</p>
                </div>
            </div>
        </footer>
    );
}
