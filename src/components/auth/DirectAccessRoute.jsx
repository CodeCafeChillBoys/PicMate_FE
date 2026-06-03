import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function DirectAccessRoute({ children, role }) {
    const { user, login, demoAccounts } = useAuth();
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Nếu user đã đăng nhập và đúng role, không cần làm gì thêm
        if (user && user.role === role) {
            setIsAuthenticating(false);
            return;
        }

        // Nếu chưa đăng nhập hoặc sai role, tự động đăng nhập bằng tài khoản demo
        const accountToUse = demoAccounts.find(acc => acc.role === role);

        if (accountToUse) {
            // Giả lập delay nhỏ rồ đăng nhập để giao diện mượt hơn
            setTimeout(() => {
                login(accountToUse.email, accountToUse.password);
                setIsAuthenticating(false);
            }, 300);
        } else {
            setIsAuthenticating(false);
        }
    }, [user, role, login, demoAccounts, location]);

    if (isAuthenticating) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(108, 92, 231, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p>Đang chuẩn bị không gian làm việc cho bạn...</p>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    // Nếu sau khi authenticate xong mà vẫn không có user (lỗi xảy ra), đẩy về trang login
    if (!user || user.role !== role) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}
