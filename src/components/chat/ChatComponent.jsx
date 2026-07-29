import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/http';
import { Send, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import './ChatComponent.css';

export default function ChatComponent({ otherUser, onClose }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connection, setConnection] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch message history
    useEffect(() => {
        if (!otherUser?.id) return;
        
        const fetchHistory = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/Messages/history/${otherUser.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('picmate_access_token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error("Failed to fetch chat history", err);
            }
        };

        fetchHistory();
    }, [otherUser?.id]);

    // Setup SignalR connection
    useEffect(() => {
        if (!user || !otherUser) return;

        const token = localStorage.getItem('picmate_access_token');
        const newConnection = new HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/chathub?access_token=${token}`)
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, [user, otherUser]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Connected to SignalR!');
                    
                    connection.on('ReceiveMessage', (message) => {
                        // Check if the message is relevant to the current conversation
                        if (
                            (message.senderId === user.id && message.receiverId === otherUser.id) ||
                            (message.senderId === otherUser.id && message.receiverId === user.id)
                        ) {
                            setMessages(prev => [...prev, message]);
                        }
                    });

                    // Mark messages as read when opening chat
                    if (otherUser?.id) {
                        connection.invoke("MarkAsRead", otherUser.id).catch(err => console.error(err));
                    }
                })
                .catch(e => {
                    console.log('Connection failed: ', e);
                });
        }

        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, [connection, otherUser?.id, user?.id]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!user) {
            toast.error("Vui lòng đăng nhập để gửi tin nhắn!");
            return;
        }
        
        if (!connection || connection.state !== 'Connected') {
            toast.error("Đang kết nối đến máy chủ trò chuyện, vui lòng đợi...");
            return;
        }

        if (!newMessage.trim() || !otherUser) return;

        try {
            await connection.invoke("SendMessage", otherUser.id, newMessage);
            setNewMessage('');
        } catch (e) {
            console.error("Gửi tin nhắn thất bại: ", e);
            toast.error("Lỗi gửi tin: " + e.message);
        }
    };

    if (!otherUser) return null;

    return (
        <div className="chat-box">
            <div className="chat-header">
                <button className="chat-back-btn" onClick={onClose}><ArrowLeft size={18} /></button>
                <div className="chat-header-info">
                    <img src={otherUser.avatarUrl || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop'} alt={otherUser.fullName} className="avatar-sm" />
                    <div>
                        <strong>{otherUser.fullName}</strong>
                        {otherUser.role && <span className="chat-role-badge">{otherUser.role}</span>}
                    </div>
                </div>
                <button className="chat-close-btn" onClick={onClose}><X size={18} /></button>
            </div>
            
            <div className="chat-messages">
                {messages.map((m, idx) => {
                    const isMine = m.senderId === user.id;
                    return (
                        <div key={m.id || idx} className={`chat-message ${isMine ? 'mine' : 'theirs'}`}>
                            <div className="message-bubble">
                                {m.content}
                            </div>
                            <div className="message-time">
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
                <input 
                    type="text" 
                    placeholder="Nhập tin nhắn..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()} className="chat-send-btn">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
