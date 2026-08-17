import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Brain, Heart, Target, Shield, Users, Sparkles } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-[var(--primary)]" />
            <span className="text-2xl font-bold text-[var(--foreground)]">Спектр</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Возможности
            </a>
            <a href="#about" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              О методе
            </a>
            <a href="#pricing" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Тарифы
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link to="/register">
              <Button>Начать бесплатно</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-[var(--background)] to-[var(--card)]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[var(--foreground)]">
            Развивай психологическую гибкость
          </h1>
          <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-8">
            Первый в России ACT-тренажёр на основе терапии принятия и ответственности. 
            Научись жить в согласии со своими ценностями, даже когда трудно.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Начать бесплатный период
              </Button>
            </Link>
            <Link to="#about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Узнать больше
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            14 дней бесплатно • Без привязки карты • Отмена в любой момент
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[var(--foreground)]">
            Что вы получите
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-12 h-12 text-[var(--primary)]" />}
              title="6 навыков гибкости"
              description="Проработайте каждый из шести процессов психологической гибкости через интерактивные упражнения"
            />
            <FeatureCard
              icon={<Target className="w-12 h-12 text-[var(--secondary)]" />}
              title="Персонализация"
              description="Упражнения адаптируются под ваши ценности и жизненные ситуации с помощью AI"
            />
            <FeatureCard
              icon={<Heart className="w-12 h-12 text-[var(--accent)]" />}
              title="Безопасная среда"
              description="Никаких правильных ответов и наказаний. Возвращайтесь в любом темпе без чувства вины"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-[var(--success)]" />}
              title="Научная основа"
              description="Метод основан на доказательной ACT-терапии с более чем 300 исследованиями эффективности"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-[var(--warning)]" />}
              title="Поддержка психологов"
              description="Возможность записаться к сертифицированному специалисту за токены или деньги"
            />
            <FeatureCard
              icon={<Sparkles className="w-12 h-12 text-[var(--primary)]" />}
              title="Трекер прогресса"
              description="Отслеживайте развитие навыков и наблюдайте изменения в качестве жизни"
            />
          </div>
        </div>
      </section>

      {/* About ACT Section */}
      <section id="about" className="py-20 bg-[var(--card)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-[var(--foreground)]">
              Что такое ACT?
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] mb-6">
              <strong>Терапия принятия и ответственности (Acceptance and Commitment Therapy)</strong> — 
              это метод третьей волны когнитивно-поведенческой терапии, который помогает развить 
              психологическую гибкость: способность оставаться собой и действовать по своим ценностям, 
              даже когда внутри тревога, грусть или сомнения.
            </p>
            <p className="text-lg text-[var(--muted-foreground)] mb-6">
              В отличие от традиционных подходов, ACT не пытается изменить или устранить неприятные мысли 
              и чувства. Вместо этого она учит принимать их как часть человеческого опыта и направлять 
              энергию на то, что действительно важно.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <StatCard value="300+" label="Исследований эффективности" />
              <StatCard value="6" label="Процессов гибкости" />
              <StatCard value="40+" label="Лет научной разработки" />
              <StatCard value="14" label="Дней бесплатно" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[var(--foreground)]">
            Простые тарифы
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="Пробный период"
              price="0 ₽"
              period="14 дней"
              features={[
                'Полный доступ ко всем упражнениям',
                'Диагностика психологической гибкости',
                'Карта ценностей',
                'Трекер прогресса',
              ]}
              cta="Начать сейчас"
              linkTo="/register"
            />
            <PricingCard
              title="Подписка"
              price="990 ₽"
              period="в месяц"
              features={[
                'Неограниченный доступ',
                'Персонализация упражнений',
                'Токены для консультаций',
                'Новые материалы ежемесячно',
                'Поддержка по email',
              ]}
              cta="Оформить подписку"
              linkTo="/register"
              highlighted
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 bg-[var(--card)]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-[var(--primary)]" />
                <span className="text-xl font-bold text-[var(--foreground)]">Спектр</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                ACT-тренажёр психологической гибкости
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[var(--foreground)]">Продукт</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li><a href="#features" className="hover:text-[var(--foreground)]">Возможности</a></li>
                <li><a href="#pricing" className="hover:text-[var(--foreground)]">Тарифы</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)]">Для психологов</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[var(--foreground)]">Документы</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li><a href="#" className="hover:text-[var(--foreground)]">Пользовательское соглашение</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)]">Политика конфиденциальности</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)]">Оферта</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[var(--foreground)]">Контакты</h4>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li>support@spektr.app</li>
                <li>+7 (999) 000-00-00</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
            © 2024 Спектр. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">{title}</h3>
      <p className="text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-6 bg-[var(--background)] rounded-lg border border-[var(--border)]">
      <div className="text-4xl font-bold text-[var(--primary)] mb-2">{value}</div>
      <div className="text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  period,
  features,
  cta,
  linkTo,
  highlighted = false,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  linkTo: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-xl border-2 ${
        highlighted
          ? 'border-[var(--primary)] bg-[var(--primary-bg)] shadow-lg'
          : 'border-[var(--border)] bg-[var(--card)]'
      }`}
    >
      <h3 className="text-2xl font-bold mb-2 text-[var(--foreground)]">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-[var(--foreground)]">{price}</span>
        <span className="text-[var(--muted-foreground)] ml-2">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-[var(--muted-foreground)]">
            <svg className="w-5 h-5 text-[var(--success)] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link to={linkTo}>
        <Button
          variant={highlighted ? 'primary' : 'outline'}
          className="w-full"
          size="lg"
        >
          {cta}
        </Button>
      </Link>
    </div>
  );
}
