'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/frontend/lib/cartContext';
import './page.css';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });

    useEffect(() => {
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [items.length, router]);

    if (items.length === 0) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
        } else {
            // Simulate order placement
            alert('Замовлення успішно оформлено! Дякуємо за покупку.');
            clearCart();
            router.push('/');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <h1>Оформлення замовлення</h1>

                <div className="checkout-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <span>Контактні дані</span>
                    </div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <span>Доставка</span>
                    </div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <span>Підтвердження</span>
                    </div>
                </div>

                <div className="checkout-layout">
                    <form className="checkout-form" onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="form-section">
                                <h2>Контактні дані</h2>
                                <div className="form-grid">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Повне ім'я *"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email *"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Телефон *"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg">
                                    Продовжити
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="form-section">
                                <h2>Адреса доставки</h2>
                                <div className="form-grid">
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Адреса *"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        style={{ gridColumn: '1 / -1' }}
                                    />
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="Місто *"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="postalCode"
                                        placeholder="Поштовий індекс *"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="country"
                                        placeholder="Країна *"
                                        value={formData.country}
                                        onChange={handleChange}
                                        required
                                        style={{ gridColumn: '1 / -1' }}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                                        Назад
                                    </button>
                                    <button type="submit" className="btn btn-primary btn-lg">
                                        Продовжити
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="form-section">
                                <h2>Підтвердження замовлення</h2>
                                <div className="confirmation-details">
                                    <div className="detail-group">
                                        <h3>Контактні дані</h3>
                                        <p>{formData.name}</p>
                                        <p>{formData.email}</p>
                                        <p>{formData.phone}</p>
                                    </div>
                                    <div className="detail-group">
                                        <h3>Адреса доставки</h3>
                                        <p>{formData.address}</p>
                                        <p>{formData.city}, {formData.postalCode}</p>
                                        <p>{formData.country}</p>
                                    </div>
                                    <div className="payment-stub">
                                        <h3>Оплата</h3>
                                        <p className="payment-note">💳 Оплата при отриманні (заглушка)</p>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                                        Назад
                                    </button>
                                    <button type="submit" className="btn btn-primary btn-lg">
                                        Підтвердити замовлення
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="order-summary">
                        <h2>Ваше замовлення</h2>
                        <div className="summary-items">
                            {items.map((item) => (
                                <div key={`${item.product.id}-${item.selectedSize}`} className="summary-item">
                                    <div className="summary-item-info">
                                        <p className="summary-item-name">{item.product.name}</p>
                                        <p className="summary-item-details">
                                            {item.selectedSize} • {item.selectedColor} • x{item.quantity}
                                        </p>
                                    </div>
                                    <div className="summary-item-price">
                                        €{(item.product.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Товари</span>
                                <span>€{getTotal().toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Доставка</span>
                                <span>Безкоштовно</span>
                            </div>
                            <div className="summary-total">
                                <span>Разом</span>
                                <span>€{getTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
