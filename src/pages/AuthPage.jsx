import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Camera, Eye, EyeOff, LogIn, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, demoAccounts } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Vui long nhap day du email va mat khau!');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) navigate(result.redirect);
    else setError(result.message);
  };

  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    const result = await login(account.email, account.password);
    if (result.success) navigate(result.redirect);
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
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="auth-tabs">
              <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)} id="auth-tab-login">Dang nhap</button>
              <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)} id="auth-tab-register">Dang ky</button>
            </div>

            <div className="demo-banner" id="demo-banner">
              <button className="demo-banner-toggle" onClick={() => setShowDemo(!showDemo)}>
                <Info size={16} />
                <span>Tai khoan demo co san</span>
              </button>
              {showDemo && (
                <div className="demo-accounts-list">
                  {demoAccounts.map((acc, i) => (
                    <button key={i} className="demo-account-btn" onClick={() => handleDemoLogin(acc)} id={`demo-login-${acc.role}`}>
                      <div className="demo-account-info">
                        <span className="demo-email">{acc.email}</span>
                        <span className="demo-pass">Mat khau: {acc.password}</span>
                      </div>
                      <span className="demo-login-icon"><LogIn size={16} /></span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="role-selection">
                    <button type="button" className={`role-card ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')} id="role-customer">
                      <User size={24} />
                      <strong>Khach hang</strong>
                    </button>
                    <button type="button" className={`role-card ${role === 'photographer' ? 'active' : ''}`} onClick={() => setRole('photographer')} id="role-photographer">
                      <Camera size={24} />
                      <strong>Phone-Grapher</strong>
                    </button>
                  </div>
                </>
              )}

              <div className="input-group">
                <label>Email</label>
                <div className="input-icon-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input type="email" className="input input-with-icon" value={email} onChange={(e) => setEmail(e.target.value)} id="auth-email" />
                </div>
              </div>

              <div className="input-group">
                <label>Mat khau</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input type={showPassword ? 'text' : 'password'} className="input input-with-icon" value={password} onChange={(e) => setPassword(e.target.value)} id="auth-password" />
                  <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error" id="auth-error">{error}</div>}

              <button type="submit" className="btn btn-primary btn-lg auth-submit" id="auth-submit" disabled={loading}>
                {loading ? 'Dang xu ly...' : isLogin ? 'Dang nhap' : 'Dang ky'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

