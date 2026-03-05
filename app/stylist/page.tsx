'use client';

import { useState, useRef, useEffect } from 'react';
import { mockProducts } from '@/frontend/lib/mockData';
import ProductCard from '@/frontend/components/ProductCard';
import './page.css';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    products?: typeof mockProducts;
}

export default function StylistPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'Привіт! Я ваш AI-стиліст. Допоможу підібрати ідеальний образ. Розкажіть про свої уподобання: який стиль вам близький, який у вас бюджет, для якого сезону підбираємо одяг?',
        },
    ]);
    const [input, setInput] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<{
        budget?: string;
        season?: string;
        style?: string;
    }>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleQuickFilter = (type: 'budget' | 'season' | 'style', value: string) => {
        const newFilters = { ...selectedFilters, [type]: value };
        setSelectedFilters(newFilters);

        // Simulate AI response
        const filterMessage = `Чудово! Я підберу ${type === 'style' ? 'образ в стилі' : type === 'season' ? 'одяг для сезону' : 'варіанти в бюджеті'} "${value}".`;
        sendMessage(filterMessage, true);
    };

    const sendMessage = (messageText: string, isAutoMessage = false) => {
        const userMessage = messageText || input;
        if (!userMessage.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        if (!isAutoMessage) setInput('');

        // Simulate AI response with product recommendations
        setTimeout(() => {
            const recommendations = mockProducts.slice(0, 3);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Ось кілька варіантів, які можуть вам підійти:',
                    products: recommendations,
                },
            ]);
        }, 800);
    };

    return (
        <div className="stylist-page">
            <div className="container">
                <div className="stylist-header">
                    <h1>🤖 AI Стиліст</h1>
                    <p>Персональний помічник у виборі одягу</p>
                </div>

                <div className="stylist-layout">
                    <div className="quick-filters">
                        <div className="filter-group">
                            <h4>Бюджет:</h4>
                            <div className="filter-buttons">
                                <button
                                    className={`filter-btn ${selectedFilters.budget === '< €100' ? 'active' : ''}`}
                                    onClick={() => handleQuickFilter('budget', '< €100')}
                                >
                                    &lt; €100
                                </button>
                                <button
                                    className={`filter-btn ${selectedFilters.budget === '€100-€200' ? 'active' : ''}`}
                                    onClick={() => handleQuickFilter('budget', '€100-€200')}
                                >
                                    €100-€200
                                </button>
                                <button
                                    className={`filter-btn ${selectedFilters.budget === '> €200' ? 'active' : ''}`}
                                    onClick={() => handleQuickFilter('budget', '> €200')}
                                >
                                    &gt; €200
                                </button>
                            </div>
                        </div>

                        <div className="filter-group">
                            <h4>Сезон:</h4>
                            <div className="filter-buttons">
                                {['Весна', 'Літо', 'Осінь', 'Зима'].map(season => (
                                    <button
                                        key={season}
                                        className={`filter-btn ${selectedFilters.season === season ? 'active' : ''}`}
                                        onClick={() => handleQuickFilter('season', season)}
                                    >
                                        {season}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h4>Стиль:</h4>
                            <div className="filter-buttons">
                                {['Casual', 'Smart Casual', 'Formal', 'Street'].map(style => (
                                    <button
                                        key={style}
                                        className={`filter-btn ${selectedFilters.style === style ? 'active' : ''}`}
                                        onClick={() => handleQuickFilter('style', style)}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="chat-container">
                        <div className="chat-messages">
                            {messages.map((message, index) => (
                                <div key={index} className={`message ${message.role}`}>
                                    <div className="message-content">
                                        <p>{message.content}</p>
                                        {message.products && (
                                            <div className="message-products">
                                                {message.products.map(product => (
                                                    <ProductCard key={product.id} product={product} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                                placeholder="Опишіть, що ви шукаєте..."
                            />
                            <button onClick={() => sendMessage(input)} className="btn btn-primary">
                                Надіслати
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
