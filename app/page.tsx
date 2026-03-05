import Link from 'next/link';
import ProductCard from '@/frontend/components/ProductCard';
import { mockProducts } from '@/frontend/lib/mockData';
import './page.css';

export default function Home() {
  const featuredProducts = mockProducts.slice(0, 6);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Відкрийте для себе
              <br />
              <span className="gradient-text">нову еру моди</span>
            </h1>
            <p className="hero-description">
              Унікальний магазин з AI-стилістом та віртуальним примірюванням.
              Підбирайте ідеальний образ за допомогою штучного інтелекту.
            </p>
            <div className="hero-actions">
              <Link href="/catalog" className="btn btn-primary btn-lg">
                Дивитись каталог
              </Link>
              <Link href="/stylist" className="btn btn-secondary btn-lg">
                🤖 AI Стиліст
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="img-placeholder hero-image">
                <span>✨</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Стиліст</h3>
              <p>Персональний AI-асистент допоможе підібрати ідеальний образ за вашими вподобаннями</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👔</div>
              <h3>Віртуальне примірювання</h3>
              <p>Спробуйте одяг віртуально перед покупкою за допомогою технології AI</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Швидка доставка</h3>
              <p>Доставка по всій Європі від 2 днів</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Обрані товари</h2>
            <Link href="/catalog" className="view-all-link">
              Дивитись всі →
            </Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Спробуйте AI Стиліста</h2>
            <p>
              Наш розумний асистент враховує ваш бюджет, стиль та вподобання,
              щоб створити ідеальний образ спеціально для вас.
            </p>
            <Link href="/stylist" className="btn btn-primary btn-lg">
              Почати підбір
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
