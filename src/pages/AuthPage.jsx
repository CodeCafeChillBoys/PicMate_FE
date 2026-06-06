import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Camera, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (isLogin) {
      if (!email || !password) {
        setError('Vui lòng nhập đầy đủ email và mật khẩu!');
        return;
      }
      setLoading(true);
      const result = await login(email, password);
      setLoading(false);

      if (result.success) navigate(result.redirect || '/');
      else setError(result.message);
    } else {
      if (!email || !password || !fullName || !phoneNumber) {
        setError('Vui lòng điền đầy đủ tất cả thông tin!');
        return;
      }
      try {
        setLoading(true);
        await apiClient.register({
          FullName: fullName,
          Email: email,
          Password: password,
          PhoneNumber: phoneNumber,
          Role: role
        });
        setLoading(false);
        setSuccessMsg('Đăng ký thành công! Đang chuyển sang đăng nhập...');
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMsg('');
          setPassword('');
        }, 1500);
      } catch (err) {
        setLoading(false);
        // Safely extract validation errors if possible
        setError(err.message || 'Lỗi hệ thống, vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-visual">
          <div className="auth-visual-content">
            <Link to="/" className="auth-logo">
              <Camera size={32} strokeWidth={2.5} />
              <span>PIC<strong>Mate</strong></span>
            </Link>
            <h2>Tìm kiếm thợ ảnh hoàn hảo<br/>trong tích tắc</h2>
            <p>Khám phá cộng đồng nhiếp ảnh gia chuyên nghiệp, kết nối và đặt lịch chụp ảnh cho những khoảnh khắc đáng nhớ của bạn.</p>
            
            <div className="auth-visual-stats">
              <div className="auth-stat">
                <strong>5,000+</strong>
                <span>Khách hàng</span>
              </div>
              <div className="auth-stat">
                <strong>1,200+</strong>
                <span>Thợ ảnh</span>
              </div>
              <div className="auth-stat">
                <strong>99%</strong>
                <span>Hài lòng</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="auth-header-mobile">
                <Link to="/" className="auth-logo-mobile">
                <Camera size={28} strokeWidth={2.5} />
                <span>PIC<strong>Mate</strong></span>
                </Link>
            </div>
            
            <div className="auth-tabs">
              <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }} id="auth-tab-login">Đăng nhập</button>
              <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }} id="auth-tab-register">Đăng ký</button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-fade-in">
                  <div className="role-selection">
                    <button type="button" className={`role-card ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')} id="role-customer">
                      <User size={24} />
                      <strong>Khách hàng</strong>
                      <span>Tìm thợ ảnh</span>
                    </button>
                    <button type="button" className={`role-card ${role === 'photographer' ? 'active' : ''}`} onClick={() => setRole('photographer')} id="role-photographer">
                      <Camera size={24} />
                      <strong>Phone-Grapher</strong>
                      <span>Chụp ảnh lấy tiền</span>
                    </button>
                  </div>
                  
                  <div className="input-group">
                    <label>Họ và tên</label>
                    <div className="input-icon-wrapper">
                      <User size={18} className="input-icon" />
                      <input type="text" className="input input-with-icon" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                  </div>

                  <div className="input-group mt-3">
                    <label>Số điện thoại</label>
                    <div className="input-icon-wrapper">
                      <Phone size={18} className="input-icon" />
                      <input type="tel" className="input input-with-icon" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              <div className="input-group mt-3">
                <label>Email</label>
                <div className="input-icon-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input type="email" className="input input-with-icon" value={email} onChange={(e) => setEmail(e.target.value)} id="auth-email" />
                </div>
              </div>

              <div className="input-group mt-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Mật khẩu</label>
                  {isLogin && <a href="#" className="auth-forgot">Quên mật khẩu?</a>}
                </div>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input type={showPassword ? 'text' : 'password'} className="input input-with-icon" value={password} onChange={(e) => setPassword(e.target.value)} id="auth-password" />
                  <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error" id="auth-error">{error}</div>}
              {successMsg && <div className="auth-success" id="auth-success">{successMsg}</div>}

              <button type="submit" className="btn btn-primary btn-lg auth-submit mt-4" id="auth-submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
              </button>
              
              {isLogin && (
                  <div className="auth-footer-text">
                    Chưa có tài khoản? <button type="button" className="btn-link" onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}>Đăng ký ngay</button>
                  </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
