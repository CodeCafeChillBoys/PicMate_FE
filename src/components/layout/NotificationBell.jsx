import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import './NotificationBell.css';

function formatTime(iso) {
    try {
        const d = new Date(iso);
        const diffMs = Date.now() - d.getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Vừa xong';
        if (mins < 60) return `${mins} phút trước`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return d.toLocaleDateString('vi-VN');
    } catch {
        return '';
    }
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const ref = useRef(null);

    const loadCount = async () => {
        try {
            const r = await apiClient.getUnreadNotifCount();
            setUnread(r.count || 0);
        } catch { /* im lặng: thông báo không nên gây ồn */ }
    };

    const loadList = async () => {
        try {
            setItems(await apiClient.getNotifications());
        } catch { /* im lặng */ }
    };

    useEffect(() => {
        loadCount();
        const timer = setInterval(loadCount, 30000); // poll 30s
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const toggle = async () => {
        const next = !open;
        setOpen(next);
        if (next) await loadList();
    };

    const handleItemClick = async (n) => {
        if (n.isRead) return;
        try { await apiClient.markNotifRead(n.id); } catch { /* im lặng */ }
        setItems(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
        setUnread(u => Math.max(0, u - 1));
    };

    const markAll = async () => {
        try { await apiClient.markAllNotifRead(); } catch { /* im lặng */ }
        setItems(prev => prev.map(x => ({ ...x, isRead: true })));
        setUnread(0);
    };

    return (
        <div className="notif-bell" ref={ref}>
            <button className="notif-bell-btn" onClick={toggle} aria-label="Thông báo" id="notif-bell-btn">
                <Bell size={20} />
                {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>

            {open && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <strong>Thông báo</strong>
                        {unread > 0 && (
                            <button className="notif-markall" onClick={markAll}>Đánh dấu đã đọc</button>
                        )}
                    </div>
                    <div className="notif-list">
                        {items.length === 0 ? (
                            <div className="notif-empty">Chưa có thông báo nào</div>
                        ) : (
                            items.map(n => (
                                <button
                                    key={n.id}
                                    className={`notif-item ${n.isRead ? '' : 'unread'}`}
                                    onClick={() => handleItemClick(n)}
                                >
                                    <span className="notif-item-title">{n.title}</span>
                                    <span className="notif-item-msg">{n.message}</span>
                                    <span className="notif-item-time">{formatTime(n.createdAt)}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
