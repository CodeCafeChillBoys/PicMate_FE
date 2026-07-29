import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function DirectAccessRoute({ children, role }) {
    const { user, authLoading } = useAuth();

    // while we are initializing auth state, show a lightweight loading indicator
    if (authLoading) return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24}} id="auth-loading">
            <div>Đang tải...</div>
        </div>
    );

    // not logged in -> go to login
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // wrong role -> send to login (or adjust to an unauthorized page)
    if (role && user.role !== role) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}
