import { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const NAV = [
  { id: 'hero', label: 'Главная' },
  { id: 'services', label: 'Услуги' },
  { id: 'packages', label: 'Пакеты' },
  { id: 'price', label: 'Прайс' },
  { id: 'process', label: 'Процесс' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contacts', label: 'Контакты' },
];

const PAINS = [
  { icon: 'Droplets', text: 'Пятна на диване не оттираются бытовой химией' },
  { icon: 'PawPrint', text: 'После животных остался неприятный запах' },
  { icon: 'BedDouble', text: 'Матрас давно не чистился' },
  { icon: 'Sofa', text: 'Гостиная выглядит неопрятно из-за мебели' },
];

const ADVANTAGES = [
  { icon: 'Tag', title: 'Цена известна до выезда', desc: 'Никаких сюрпризов после окончания работ.' },
  { icon: 'BadgeCheck', title: 'Оплата после результата', desc: 'Сначала оцениваете качество, потом оплачиваете.' },
  { icon: 'ShieldCheck', title: 'Не навязываем услуги', desc: 'Стоимость фиксируется заранее.' },
  { icon: 'Sparkles', title: 'Работаем бережно', desc: 'Профессиональная экстракторная чистка без вреда для ткани.' },
];

const PACKAGES = [
  { name: 'Семейный', items: 'Диван + матрас', price: '5 900 ₽', popular: false },
  { name: 'После питомцев', items: 'Диван + устранение запаха', price: '6 900 ₽', popular: true },
  { name: 'Полное обновление', items: 'Диван + матрас + 4 стула', price: '9 900 ₽', popular: false },
];

const PRICE = [
  { name: 'Прямой диван', price: 'от 3 500 ₽', icon: 'Sofa' },
  { name: 'Угловой диван', price: 'от 4 500 ₽', icon: 'Armchair' },
  { name: 'Матрас', price: 'от 2 500 ₽', icon: 'BedDouble' },
  { name: 'Кресло', price: 'от 1 000 ₽', icon: 'Armchair' },
  { name: 'Стул', price: 'от 250 ₽', icon: 'Chair' },
  { name: 'Удаление запахов', price: 'от 1 500 ₽', icon: 'Wind' },
];

const STEPS = [
  { icon: 'Camera', title: 'Отправляете фото мебели' },
  { icon: 'Calculator', title: 'Фиксируем стоимость' },
  { icon: 'Car', title: 'Приезжаем в назначенное время' },
  { icon: 'Sparkles', title: 'Выполняем химчистку' },
  { icon: 'ThumbsUp', title: 'Вы принимаете работу' },
  { icon: 'Wallet', title: 'Оплачиваете результат' },
];

const FAQ = [
  { q: 'Цена изменится после приезда?', a: 'Нет, цена фиксируется заранее.' },
  { q: 'Сколько сохнет мебель?', a: 'В среднем от 4 до 12 часов.' },
  { q: 'Удаляются ли все пятна?', a: 'Большинство пятен удаляется полностью, но результат зависит от их происхождения и давности.' },
  { q: 'Безопасна ли химия?', a: 'Да, используем профессиональные средства для мебели и текстиля.' },
  { q: 'Есть ли гарантия?', a: 'Если что-то не устроит, оперативно вернёмся и исправим.' },
];

const REVIEWS = [
  {
    name: 'Елена М.',
    location: 'Москва, Митино',
    text: 'Диван после кота был в ужасном состоянии — пятна, запах. После химчистки выглядит как новый! Мастер приехал вовремя, всё сделал аккуратно. Однозначно рекомендую.',
    rating: 5,
    before: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/files/6910d211-aea5-4e1a-8ecf-2d9e54b597b9.jpg',
    after: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/files/a9c4367d-8747-4a70-a6f2-20814ce24893.jpg',
    item: 'Диван',
  },
  {
    name: 'Антон К.',
    location: 'Москва, Реутов',
    text: 'Кресло было с жирными пятнами — думал уже выбрасывать. Ребята почистили за час, пятна ушли полностью. Цена совпала с тем, что назвали по телефону — без сюрпризов.',
    rating: 5,
    before: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/files/7caab006-a9e3-41b0-a41c-578d1eda0f09.jpg',
    after: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/files/6bac44ef-4bb3-4711-a90d-dd7a6d211feb.jpg',
    item: 'Кресло',
  },
  {
    name: 'Ольга Д.',
    location: 'Москва, Химки',
    text: 'Заказала чистку матраса — даже не ожидала такого результата. Запах пропал полностью, цвет обновился. Дети теперь спят спокойно. Буду заказывать каждый год.',
    rating: 5,
    before: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/files/9425f0dc-fe46-487b-bfc5-07150904b26d.jpg',
    after: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/files/b7eb92aa-a295-4b0e-ba4d-3c44cdbda9fd.jpg',
    item: 'Матрас',
  },
];

const TELEGRAM = 'https://t.me/';
const WHATSAPP = 'https://wa.me/';
const PHONE = 'tel:+70000000000';

function BeforeAfterSlider({ before, after, item }: { before: string; after: string; item: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const calcPos = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => { dragging.current = true; calcPos(e.clientX); };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) calcPos(e.clientX); };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchMove = (e: React.TouchEvent) => { calcPos(e.touches[0].clientX); };

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] overflow-hidden select-none cursor-col-resize"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      <img src={after} alt="После чистки" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} alt="До чистки" className="absolute inset-0 w-full h-full object-cover" style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%', maxWidth: 'none' }} />
      </div>
      <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{ left: `calc(${pos}% - 1px)` }}>
        <div className="w-0.5 h-full bg-white shadow-lg" />
        <div className="absolute grid place-items-center w-9 h-9 rounded-full bg-white shadow-xl -translate-x-1/2 border-2 border-white">
          <Icon name="ChevronsLeftRight" size={18} className="text-gray-700" />
        </div>
      </div>
      <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full pointer-events-none">До</div>
      <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full pointer-events-none">После</div>
      <div className="absolute bottom-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full pointer-events-none">{item}</div>
    </div>
  );
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add('in'), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);


  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4 md:px-8">
          <button onClick={() => scrollTo('hero')} className="flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/53938927-e253-4412-bb52-def6bbd4efbb.png"
              alt="Чистер"
              className="h-10 w-auto object-contain"
            />
          </button>
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {n.label}
              </button>
            ))}
          </nav>
          <Button onClick={() => scrollTo('contacts')} className="hidden md:inline-flex rounded-full font-semibold">
            Рассчитать
          </Button>
          <button className="md:hidden grid place-items-center w-10 h-10 rounded-xl bg-secondary" onClick={() => setMenuOpen((v) => !v)}>
            <Icon name={menuOpen ? 'X' : 'Menu'} size={22} />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background animate-accordion-down">
            <div className="flex flex-col p-4 gap-1">
              {NAV.map((n) => (
                <button key={n.id} onClick={() => scrollTo(n.id)} className="text-left py-2.5 px-3 rounded-lg font-medium hover:bg-secondary transition-colors">
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="hero" className="relative pt-28 md:pt-40 pb-20 md:pb-28 grain">
        <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="container relative px-4 md:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-primary text-sm font-semibold mb-6">
              <Icon name="MapPin" size={15} /> Москва и Московская область
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl">
              Химчистка мебели <span className="text-primary">на дому</span> в Москве и области
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl">
              Фиксируем цену до выезда специалиста. Оплата только после результата.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Button onClick={() => scrollTo('contacts')} size="lg" className="rounded-full text-base font-semibold h-14 px-8">
                <Icon name="Calculator" size={20} className="mr-2" /> Рассчитать стоимость
              </Button>
              <a href={TELEGRAM} target="_blank" rel="noreferrer">
                <Button variant="outline" size="lg" className="rounded-full text-base font-semibold h-14 px-8 w-full border-2">
                  <Icon name="Send" size={20} className="mr-2" /> Написать в Telegram
                </Button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pains */}
      <section id="services" className="py-16 md:py-24 bg-secondary/40">
        <div className="container px-4 md:px-8">
          <Reveal>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center">Знакомые проблемы?</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PAINS.map((p, i) => (
              <Reveal key={p.text} delay={i * 80}>
                <div className="h-full bg-card rounded-3xl p-7 border border-border hover:border-primary/40 hover:-translate-y-1 transition-all">
                  <div className="grid place-items-center w-12 h-12 rounded-2xl bg-secondary text-primary mb-4">
                    <Icon name={p.icon} size={24} />
                  </div>
                  <p className="font-medium text-lg leading-snug">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p className="mt-10 text-center text-lg md:text-xl font-semibold max-w-2xl mx-auto">
              Мы решаем эти проблемы <span className="text-primary">экстракторной чисткой</span>.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <Reveal>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center max-w-2xl mx-auto">
              Сервис, который удобен клиенту
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ADVANTAGES.map((a, i) => (
              <Reveal key={a.title} delay={i * 80}>
                <div className="h-full rounded-3xl p-7 bg-gradient-to-br from-primary/5 to-accent/10 border border-border">
                  <div className="grid place-items-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground mb-4">
                    <Icon name={a.icon} size={24} />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2">{a.title}</h3>
                  <p className="text-muted-foreground">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-16 md:py-24 bg-secondary/40">
        <div className="container px-4 md:px-8">
          <Reveal>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center">Пакетные предложения</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((p, i) => (
              <Reveal key={p.name} delay={i * 100}>
                <div className={`relative h-full rounded-3xl p-8 flex flex-col ${p.popular ? 'bg-primary text-primary-foreground shadow-xl md:scale-105' : 'bg-card border border-border'}`}>
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wide">
                      Хит
                    </span>
                  )}
                  <h3 className="font-display font-bold text-2xl">{p.name}</h3>
                  <p className={`mt-2 ${p.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{p.items}</p>
                  <div className="font-display font-black text-4xl mt-6 mb-8">{p.price}</div>
                  <Button
                    onClick={() => scrollTo('contacts')}
                    className={`mt-auto rounded-full font-semibold h-12 ${p.popular ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}
                    variant={p.popular ? 'default' : 'default'}
                  >
                    Выбрать
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Price */}
      <section id="price" className="py-16 md:py-24">
        <div className="container px-4 md:px-8 max-w-3xl">
          <Reveal>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center mb-12">Прайс</h2>
          </Reveal>
          <div className="space-y-3">
            {PRICE.map((p, i) => (
              <Reveal key={p.name} delay={i * 60}>
                <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-6 py-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="grid place-items-center w-10 h-10 rounded-xl bg-secondary text-primary">
                      <Icon name={p.icon} size={20} fallback="Sofa" />
                    </span>
                    <span className="font-medium text-lg">{p.name}</span>
                  </div>
                  <span className="font-display font-bold text-lg text-primary whitespace-nowrap">{p.price}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-16 md:py-24 bg-secondary/40">
        <div className="container px-4 md:px-8">
          <Reveal>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center mb-14">Как проходит работа</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className="h-full bg-card rounded-3xl p-7 border border-border relative">
                  <span className="font-display font-black text-5xl text-primary/15 absolute top-4 right-5">{i + 1}</span>
                  <div className="grid place-items-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground mb-4">
                    <Icon name={s.icon} size={24} />
                  </div>
                  <p className="font-semibold text-lg leading-snug pr-8">{s.title}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <Reveal>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center mb-3">Отзывы клиентов</h2>
            <p className="text-center text-muted-foreground mb-12">Реальные результаты — тяните ползунок, чтобы увидеть фото до и после</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name} delay={i * 80}>
                <div className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col h-full">
                  <BeforeAfterSlider before={r.before} after={r.after} item={r.item} />
                  {/* Review text */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Icon key={j} name="Star" size={16} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">«{r.text}»</p>
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                      <div className="grid place-items-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {r.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24">
        <div className="container px-4 md:px-8 max-w-3xl">
          <Reveal>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center mb-12">Частые вопросы</h2>
          </Reveal>
          <Reveal>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-2xl px-6">
                  <AccordionTrigger className="text-left font-display font-semibold text-lg hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Contacts / Final */}
      <section id="contacts" className="py-16 md:py-24 bg-primary text-primary-foreground grain">
        <div className="container px-4 md:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <h2 className="font-display font-black text-3xl md:text-5xl leading-tight">Узнайте стоимость за 5 минут</h2>
              <p className="mt-5 text-lg text-primary-foreground/85 max-w-md">
                Отправьте фото мебели в WhatsApp или Telegram и получите точный расчёт без выезда.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href={WHATSAPP} target="_blank" rel="noreferrer">
                  <Button size="lg" className="rounded-full font-semibold h-14 px-7 w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Icon name="MessageCircle" size={20} className="mr-2" /> WhatsApp
                  </Button>
                </a>
                <a href={TELEGRAM} target="_blank" rel="noreferrer">
                  <Button size="lg" variant="secondary" className="rounded-full font-semibold h-14 px-7 w-full">
                    <Icon name="Send" size={20} className="mr-2" /> Telegram
                  </Button>
                </a>
                <a href={PHONE}>
                  <Button size="lg" variant="outline" className="rounded-full font-semibold h-14 px-7 w-full border-2 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                    <Icon name="Phone" size={20} className="mr-2" /> Позвонить
                  </Button>
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="bg-card text-card-foreground rounded-3xl p-7 md:p-9 shadow-2xl"
            >
              <h3 className="font-display font-bold text-2xl mb-1">Оставьте заявку</h3>
              <p className="text-muted-foreground mb-6">Перезвоним и рассчитаем стоимость</p>
              <div className="space-y-4">
                <Input placeholder="Ваше имя" className="h-13 rounded-xl bg-secondary/50 border-border" />
                <Input placeholder="Телефон" type="tel" className="h-13 rounded-xl bg-secondary/50 border-border" />
                <Textarea placeholder="Комментарий (что нужно почистить)" className="rounded-xl bg-secondary/50 border-border min-h-[110px]" />
                <Button type="submit" className="w-full rounded-full font-semibold h-13 text-base">
                  Получить расчёт
                </Button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <div className="flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/53938927-e253-4412-bb52-def6bbd4efbb.png"
              alt="Чистер"
              className="h-9 w-auto object-contain"
            />
          </div>
          <p>Выездная химчистка мебели · Москва и область</p>
          <p>© {new Date().getFullYear()} Чистер</p>
        </div>
      </footer>

      {/* Floating buttons */}
      <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 flex flex-col gap-3">
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="grid place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform"
        >
          <Icon name="MessageCircle" size={26} />
        </a>
        <a
          href={TELEGRAM}
          target="_blank"
          rel="noreferrer"
          aria-label="Telegram"
          className="grid place-items-center w-14 h-14 rounded-full bg-[#229ED9] text-white shadow-lg hover:scale-110 transition-transform"
        >
          <Icon name="Send" size={24} />
        </a>
      </div>
    </div>
  );
};

export default Index;