import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hello! I am your AI jewelry assistant. Start by telling me what you are looking for, e.g., "Silver earrings for a party".' }
    ]);
    const [inputStr, setInputStr] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputStr.trim()) return;

        const userMessage = inputStr;
        setInputStr('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            // Use environment variable or production fallback
            const apiUrl = import.meta.env.VITE_API_URL || 'https://saurabh07703-ai-jewelry-backend.hf.space';
            console.log("Chatbot sending request to:", apiUrl + '/chat');

            const response = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();

            // Add text response
            setMessages(prev => [...prev, { type: 'bot', text: data.response_text }]);

            // Add product cards if any
            if (data.products && data.products.length > 0) {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    isProductList: true,
                    products: data.products
                }]);
            }

        } catch (error) {
            console.error("Chat error details:", error);
            setMessages(prev => [...prev, { type: 'bot', text: `Error connecting to server: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <svg className="chatbot-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <div className="bot-indicator"></div>
                            AI Assistant
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <React.Fragment key={idx}>
                                {!msg.isProductList ? (
                                    <div className={`message ${msg.type}`}>
                                        {msg.text}
                                    </div>
                                ) : (
                                    <div className="product-list-chat">
                                        {msg.products.map((p, pIdx) => (
                                            <div key={pIdx} className="product-card-chat" onClick={() => console.log('View product', p.product_id)}>
                                                <img src={p.image_url} alt={p.product_name} className="p-image" />
                                                <div className="p-details">
                                                    <div className="p-name">{p.product_name}</div>
                                                    <div className="p-price">{formatPrice(p.price)}</div>
                                                    <div className="p-meta">{p.category_code} • {p.material}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                        {isLoading && (
                            <div className="message bot typing-indicator">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Ask about jewelry..."
                            value={inputStr}
                            onChange={(e) => setInputStr(e.target.value)}
                        />
                        <button type="submit" className="send-btn" disabled={!inputStr.trim() || isLoading}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
