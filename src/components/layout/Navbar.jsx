import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Camera, User, ChevronDown, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileOpen(false);
        setIsDropdownOpen(false);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNavLinks = () => {
        if (!user) {
            // Guest / not logged in
            return [
                { path: '/', label: 'Trang chủ' },
                { path: '/explore', label: 'Tìm thợ chụp' },
                { path: '/presets', label: 'Preset Shop' },
                { path: '/instant', label: '⚡ Chụp ngay' },
            ];
        }

        switch (user.role) {
            case 'photographer':
                return [
                    { path: '/', label: 'Trang chủ' },
                    { path: '/dashboard/photographer', label: '📋 Đơn hàng' },
                    { path: '/presets', label: 'Preset Shop' },
                    { path: '/explore', label: 'Khám phá' },
                ];
            case 'admin':
                return [
                    { path: '/admin', label: '🏠 Tổng quan' },
                    { path: '/admin', label: '👥 Người dùng' },
                    { path: '/admin', label: '📸 Phone-Graphers' },
                    { path: '/admin', label: '📦 Đơn hàng' },
                ];
            default: // customer
                return [
                    { path: '/', label: 'Trang chủ' },
                    { path: '/explore', label: 'Tìm thợ chụp' },
                    { path: '/presets', label: 'Preset Shop' },
                    { path: '/instant', label: '⚡ Chụp ngay' },
                ];
        }
    };

    const navLinks = getNavLinks();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardPath = () => {
        if (!user) return '/dashboard';
        switch (user.role) {
            case 'admin': return '/admin';
            case 'photographer': return '/dashboard/photographer';
            default: return '/dashboard';
        }
    };

    const getRoleLabel = () => {
        if (!user) return '';
        switch (user.role) {
            case 'customer': return 'Khách hàng';
            case 'photographer': return 'Phone-Grapher';
            case 'admin': return 'Administrator';
            default: return '';
        }
    };

    const hideNavLinks = user && (user.role === 'admin' || user.role === 'photographer');

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`} id="main-nav">
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo" id="nav-logo">
                    <Camera size={28} strokeWidth={2.5} />
                    <span>PIC<strong>Mate</strong></span>
                </Link>

                {!hideNavLinks && (
                    <div className={`navbar-links ${isMobileOpen ? 'active' : ''}`}>
                        {navLinks.map((link, idx) => (
                            <Link
                                key={`${link.path}-${idx}`}
                                to={link.path}
                                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                                id={`nav-link-${link.label.replace(/[^a-zA-Z]/g, '').toLowerCase() || 'home'}`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="navbar-mobile-actions">
                            {user ? (
                                <>
                                    <Link to={getDashboardPath()} className="btn btn-primary btn-sm" id="nav-dashboard-mobile">
                                        <LayoutDashboard size={16} /> Dashboard
                                    </Link>
                                    <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="nav-logout-mobile">
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/auth" className="btn btn-primary btn-sm" id="nav-login-mobile">
                                        Đăng nhập
                                    </Link>
                                    <Link to="/auth?role=photographer" className="btn btn-secondary btn-sm" id="nav-register-mobile">
                                        Trở thành Phone-Grapher
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="navbar-actions">
                    {user ? (
                        <div className="user-menu" ref={dropdownRef}>
                            <button
                                className="user-menu-trigger"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                id="nav-user-menu"
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="user-menu-avatar" />
                                ) : (
                                    <div className="user-menu-avatar-placeholder">
                                        {user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                                    </div>
                                )}
                                <div className="user-menu-info">
                                    <span className="user-menu-name">{user.name}</span>
                                    <span className="user-menu-role">{getRoleLabel()}</span>
                                </div>
                                <ChevronDown size={16} className={`user-menu-chevron ${isDropdownOpen ? 'open' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="user-dropdown" id="user-dropdown">

                                    <Link to={getDashboardPath()} className="dropdown-item">
                                        <User size={16} />
                                        <span>Hồ sơ</span>
                                    </Link>
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item dropdown-logout" onClick={handleLogout} id="nav-dropdown-logout">
                                        <LogOut size={16} />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/auth" className="btn btn-ghost btn-sm" id="nav-login">
                                <User size={18} />
                                Đăng nhập
                            </Link>
                            <Link to="/auth?role=photographer" className="btn btn-primary btn-sm" id="nav-register">
                                Trở thành Phone-Grapher
                            </Link>
                        </>
                    )}
                </div>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    aria-label="Toggle menu"
                    id="nav-toggle"
                >
                    {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {isMobileOpen && <div className="navbar-overlay" onClick={() => setIsMobileOpen(false)} />}
        </nav>
    );
}
