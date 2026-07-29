import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Image as ImageIcon } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../services/http';
import './ChatbotWidget.css';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Xin chào! 👋 Mình là trợ lý AI của PIC PLS. Tôi có thể giúp gì cho bạn?' }
    ]);
    const location = useLocation();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null); // { base64: string, type: string, name: string, previewUrl: string }
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    useEffect(() => {
        if (location.pathname === '/') {
            const timer = setTimeout(() => {
                setShowTooltip(true);
            }, 1500); // 1.5s delay to show the suggestion bubble
            return () => clearTimeout(timer);
        }
    }, [location.pathname]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chỉ tải lên file hình ảnh!');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedFile({
                base64: reader.result,
                type: file.type,
                name: file.name,
                previewUrl: URL.createObjectURL(file)
            });
        };
        reader.readAsDataURL(file);
    };

    const sendMessage = async (overrideText = null) => {
        const text = overrideText !== null ? overrideText.trim() : input.trim();
        if (!text && !selectedFile) return;

        // Display user message in chat
        const userMsgText = text || `[Đã gửi 1 ảnh: ${selectedFile.name}]`;
        const userMsg = { role: 'user', text: userMsgText };
        setMessages(prev => [...prev, userMsg]);
        
        if (overrideText === null) {
            setInput('');
        }
        setLoading(true);

        const fileData = (overrideText === null && selectedFile) ? selectedFile.base64 : null;
        const mimeType = (overrideText === null && selectedFile) ? selectedFile.type : null;

        if (overrideText === null) {
            setSelectedFile(null);
        }

        // Build history (exclude welcome and match roles)
        const history = messages
            .filter((_, i) => i > 0)
            .map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

        try {
            const res = await fetch(`${API_BASE_URL}/api/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text || "Hãy xem hình ảnh tôi vừa gửi.",
                    history: history,
                    fileBase64: fileData,
                    mimeType: mimeType
                })
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'model', text: data.reply || 'Xin lỗi, mình không thể trả lời lúc này.' }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'model', text: 'Lỗi kết nối. Vui lòng thử lại sau nhé! 😅' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickQuestions = [
        'Tôi chưa biết chọn phong cách nào? 🤔',
        'Cách đặt lịch chụp?',
        'Giá dịch vụ bao nhiêu?',
    ];

    const renderMessageText = (text) => {
        if (!text) return null;
        const lines = text.split('\n');

        return lines.map((line, lineIdx) => {
            // Check if this line is an option button
            const optionMatch = line.trim().match(/^-\s*\[Option:\s*(.*?)\s*\]$/i);
            if (optionMatch) {
                const optionLabel = optionMatch[1];
                return (
                    <button
                        key={lineIdx}
                        className="chatbot-option-btn"
                        onClick={() => sendMessage(optionLabel)}
                        disabled={loading}
                    >
                        {optionLabel}
                    </button>
                );
            }

            // Regex to split by bold text **bold** and markdown links [label](url)
            const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
            const segments = line.split(regex);
            
            const renderedLine = segments.map((seg, segIdx) => {
                if (seg.startsWith('**') && seg.endsWith('**')) {
                    return <strong key={segIdx}>{seg.slice(2, -2)}</strong>;
                }
                if (seg.startsWith('[') && seg.includes('](')) {
                    const closeBracket = seg.indexOf(']');
                    const label = seg.slice(1, closeBracket);
                    const url = seg.slice(closeBracket + 2, -1);
                    if (url.startsWith('/')) {
                        return (
                            <Link key={segIdx} to={url} className="chatbot-link" onClick={() => setIsOpen(false)}>
                                {label}
                            </Link>
                        );
                    }
                    return (
                        <a key={segIdx} href={url} target="_blank" rel="noopener noreferrer" className="chatbot-link">
                            {label}
                        </a>
                    );
                }
                return seg;
            });
            
            return (
                <div key={lineIdx} className="chatbot-line" style={{ minHeight: '1.2em' }}>
                    {renderedLine}
                </div>
            );
        });
    };

    const hiddenRoutes = ['/auth', '/admin-dashboard', '/photographer-dashboard'];
    if (hiddenRoutes.some(path => location.pathname.startsWith(path))) {
        return null;
    }

    return (
        <>
            {/* Floating Button */}
            <div className={`chatbot-fab-container ${isOpen ? 'hide' : ''}`} style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
                {showTooltip && (
                    <div className="chatbot-tooltip" onClick={() => { setIsOpen(true); setShowTooltip(false); }}>
                        <div className="chatbot-tooltip-content">
                            <strong>PIC PLS AI</strong>
                            <p>Tôi có thể giúp gì cho bạn? 👋</p>
                        </div>
                        <button className="chatbot-tooltip-close" onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}>
                            <X size={14} />
                        </button>
                        <div className="chatbot-tooltip-arrow" />
                    </div>
                )}
                <button
                    className="chatbot-fab"
                    onClick={() => { setIsOpen(true); setShowTooltip(false); }}
                    id="chatbot-fab"
                    aria-label="Mở chatbot"
                    style={{ position: 'static' }}
                >
                    <MessageCircle size={24} />
                    <span className="chatbot-fab-pulse" />
                </button>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window" id="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <img src="/Logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <strong>PIC PLS AI</strong>
                                <span className="chatbot-status">
                                    <span className="online-dot-sm" /> Online
                                </span>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}>
                                {msg.role === 'model' && (
                                    <div className="chatbot-msg-avatar">
                                        <img src="/Logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div className="chatbot-msg-bubble">
                                    {renderMessageText(msg.text)}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chatbot-msg chatbot-msg-bot">
                                <div className="chatbot-msg-avatar">
                                    <img src="/Logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                </div>
                                <div className="chatbot-msg-bubble chatbot-typing">
                                    <Loader2 size={16} className="spin" /> Đang suy nghĩ...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions (only if no user msgs yet) */}
                    {messages.length <= 1 && (
                        <div className="chatbot-quick">
                            {quickQuestions.map((q, i) => (
                                <button key={i} className="chatbot-quick-btn" onClick={() => { setInput(q); }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="chatbot-input-area-container">
                        {/* File preview */}
                        {selectedFile && (
                            <div className="chatbot-file-preview">
                                <img src={selectedFile.previewUrl} alt="Preview" />
                                <span className="chatbot-file-name">{selectedFile.name}</span>
                                <button className="chatbot-file-remove" onClick={() => setSelectedFile(null)}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <div className="chatbot-input-area">
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <button
                                className="chatbot-attach-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                type="button"
                                aria-label="Đính kèm hình ảnh"
                            >
                                <ImageIcon size={20} />
                            </button>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                id="chatbot-input"
                            />
                            <button
                                className="chatbot-send"
                                onClick={() => sendMessage()}
                                disabled={(!input.trim() && !selectedFile) || loading}
                                id="chatbot-send"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
