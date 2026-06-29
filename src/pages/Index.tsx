import { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import PriceCalculator from '@/components/PriceCalculator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const NAV = [
  { id: 'hero', label: 'Главная' },
  { id: 'services', label: 'Услуги' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'calculator', label: 'Калькулятор' },
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
  { icon: 'Tag', title: 'Цена известна до выезда', desc: 'Рассчитайте итоговую стоимость и запишитесь онлайн' },
  { icon: 'BadgeCheck', title: 'Оплата после результата', desc: 'Сначала оцениваете качество, потом оплачиваете.' },
  { icon: 'ShieldCheck', title: 'Не навязываем услуги', desc: 'Стоимость фиксируется заранее.' },
  { icon: 'Sparkles', title: 'Работаем бережно', desc: 'Профессиональная экстракторная чистка без вреда для ткани.' },
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
  { icon: 'Calculator', title: 'Считаете стоимость в калькуляторе на сайте' },
  { icon: 'CalendarCheck', title: 'Записываетесь онлайн на удобное время' },
  { icon: 'Car', title: 'Мастер приезжает в назначенное время' },
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
    before: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/491d5513-ae1f-4149-825e-c891b67cc2d8.jpg',
    after: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/59f75b22-953b-4c35-9673-daf9fab579e8.png',
    item: 'Матрас',
  },
  {
    name: 'Антон К.',
    location: 'Москва, Реутов',
    text: 'Кресло было с жирными пятнами — думал уже выбрасывать. Ребята почистили за час, пятна ушли полностью. Цена совпала с тем, что назвали по телефону — без сюрпризов.',
    rating: 5,
    before: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/7f810fd7-c198-404c-8b18-e8620fa39e1d.jpg',
    after: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/80293506-5104-441e-895e-21af4954c180.jpg',
    item: 'Кресло',
  },
  {
    name: 'Ольга Д.',
    location: 'Москва, Химки',
    text: 'Заказала чистку матраса — даже не ожидала такого результата. Запах пропал полностью, цвет обновился. Дети теперь спят спокойно. Буду заказывать каждый год.',
    rating: 5,
    before: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/323dbacc-a0bd-461b-b7a2-5f7b32feff66.jpg',
    after: 'https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/f882c85c-2e31-4bd8-801d-8d08eb91d813.jpg',
    item: 'Диван',
  },
];

const CALC_ITEMS = [
  { id: 'sofa_straight', icon: 'Sofa',      label: 'Прямой диван',   price: 3500 },
  { id: 'sofa_corner',  icon: 'Sofa',       label: 'Угловой диван',  price: 4500 },
  { id: 'mattress',     icon: 'BedDouble',  label: 'Матрас',         price: 2500 },
  { id: 'armchair',     icon: 'Armchair',   label: 'Кресло',         price: 1000 },
  { id: 'chair',        icon: 'Chair',      label: 'Стул',           price: 250  },
  { id: 'odor',         icon: 'Wind',       label: 'Удаление запаха',price: 1500 },
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

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => { if (dragging.current) calcPos(e.clientX); };
    const onMouseUp = () => { dragging.current = false; };
    const onTouchMove = (e: TouchEvent) => { if (dragging.current) { e.preventDefault(); calcPos(e.touches[0].clientX); } };
    const onTouchEnd = () => { dragging.current = false; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [calcPos]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-square overflow-hidden select-none cursor-col-resize"
      onMouseDown={(e) => { dragging.current = true; calcPos(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; calcPos(e.touches[0].clientX); }}
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

const SUBMIT_LEAD_URL = 'https://functions.poehali.dev/f8b7c153-8fc2-4042-9674-36ccc1e91425';
const SERVICES_URL = 'https://functions.poehali.dev/69cf7aba-5592-425b-b604-218abbaf0e1d';



function FurniturePicker() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const hasItems = selected.size > 0;

  const waText = CALC_ITEMS
    .filter((i) => selected.has(i.id))
    .map((i) => i.label)
    .join(', ');
  const waLink = `${WHATSAPP}?text=${encodeURIComponent(`Здравствуйте! Хочу узнать стоимость химчистки: ${waText}. Подскажите цену?`)}`;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {CALC_ITEMS.map((item) => {
          const active = selected.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all text-center ${
                active
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-background hover:border-primary/40 text-foreground'
              }`}
            >
              <span className={`grid place-items-center w-10 h-10 rounded-xl transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'}`}>
                <Icon name={item.icon} size={20} fallback="Sofa" />
              </span>
              <span className="font-medium text-sm leading-snug">{item.label}</span>
              {active && <Icon name="CheckCircle2" size={16} className="text-primary" />}
            </button>
          );
        })}
      </div>

      <div className="border-t border-border pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm text-center sm:text-left">
          {hasItems
            ? `Выбрано: ${Array.from(selected).map((id) => CALC_ITEMS.find((i) => i.id === id)?.label).join(', ')}`
            : 'Отметьте, что нужно почистить'}
        </p>
        <a href={hasItems ? waLink : undefined} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
          <Button
            size="lg"
            disabled={!hasItems}
            className="rounded-full font-semibold h-12 px-7 w-full bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
          >
            <Icon name="MessageCircle" size={18} className="mr-2" />
            Узнать точную цену
          </Button>
        </a>
      </div>
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

interface Service { id: number; name: string; price: string; }

const SECTION_IDS = NAV.map(n => n.id);

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    fetch(`${SERVICES_URL}?scope=services`)
      .then((r) => r.json())
      .then((d) => { if (d.services?.length) setServices(d.services); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = SECTION_IDS.indexOf(entry.target.id);
            if (idx !== -1) setCurrentSection(idx);
          }
        });
      },
      { threshold: 0.3 }
    );
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const goTo = (delta: number) => {
    const next = Math.max(0, Math.min(SECTION_IDS.length - 1, currentSection + delta));
    scrollTo(SECTION_IDS[next]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Section nav arrows */}
      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        <button
          onClick={() => goTo(-1)}
          disabled={currentSection === 0}
          className="grid place-items-center w-10 h-10 rounded-full bg-card border border-border shadow-lg text-muted-foreground hover:text-primary hover:border-primary/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Предыдущий блок"
        >
          <Icon name="ChevronUp" size={18} />
        </button>
        <div className="flex flex-col items-center gap-1.5 py-1">
          {SECTION_IDS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(SECTION_IDS[i])}
              className={`rounded-full transition-all ${i === currentSection ? 'w-1.5 h-4 bg-primary' : 'w-1.5 h-1.5 bg-border hover:bg-primary/50'}`}
            />
          ))}
        </div>
        <button
          onClick={() => goTo(1)}
          disabled={currentSection === SECTION_IDS.length - 1}
          className="grid place-items-center w-10 h-10 rounded-full bg-card border border-border shadow-lg text-muted-foreground hover:text-primary hover:border-primary/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Следующий блок"
        >
          <Icon name="ChevronDown" size={18} />
        </button>
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4 md:px-8">
          <button onClick={() => scrollTo('hero')} className="flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/de0b62e5-b681-4231-a70a-b60a28a8c0e7.png"
              alt="Чистекс"
              className="h-24 w-auto object-contain"
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
              Рассчитайте стоимость и сразу запишитесь онлайн на удобное время. Цена фиксируется при оформлении заказа
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Button onClick={() => scrollTo('calculator')} size="lg" className="rounded-full text-base font-semibold h-14 px-8">
                <Icon name="Calculator" size={20} className="mr-2" /> Рассчитать стоимость
              </Button>
              <Button onClick={() => scrollTo('contacts')} variant="outline" size="lg" className="rounded-full text-base font-semibold h-14 px-8 border-2">
                <Icon name="MessageCircle" size={20} className="mr-2" /> Связаться
              </Button>
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

      {/* Reviews */}
      <section id="reviews" className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <Reveal>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center mb-3">Отзывы клиентов</h2>
            <p className="text-center text-muted-foreground mb-12">Реальные результаты — тяните ползунок, чтобы увидеть фото до и после</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {REVIEWS.map((r, i) => (
              <div key={r.name} className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col h-full">
                <BeforeAfterSlider before={r.before} after={r.after} item={r.item} />
                <Reveal delay={i * 80} className="flex flex-col flex-1">
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
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="py-16 md:py-24 bg-secondary/40">
        <div className="container px-4 md:px-8">
          <Reveal>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center mb-3">Расчёт точной стоимости</h2>
            <p className="text-center text-muted-foreground mb-10">Ответьте на несколько вопросов — узнайте цену за 30 секунд</p>
          </Reveal>
          <Reveal delay={80}>
            <PriceCalculator />
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-16 md:py-24">
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
          <Reveal>
            <div className="flex justify-center mt-10">
              <Button size="lg" className="rounded-2xl h-14 px-8 font-semibold text-base" onClick={() => {
                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <Icon name="Calculator" size={20} className="mr-2" />
                Рассчитать стоимость
              </Button>
            </div>
          </Reveal>
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
        <div className="container px-4 md:px-8 max-w-2xl mx-auto text-center">
          <Reveal>
            <h2 className="font-display font-black text-3xl md:text-5xl leading-tight">Есть вопросы?<br />Свяжитесь с нами</h2>
            <p className="mt-5 text-lg text-primary-foreground/85">
              Ответим на любые вопросы, поможем подобрать услугу и согласуем удобное время
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
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
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <div className="flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/de0b62e5-b681-4231-a70a-b60a28a8c0e7.png"
              alt="Чистекс"
              className="h-9 w-auto object-contain"
            />
          </div>
          <p>Выездная химчистка мебели · Москва и область</p>
          <p>© {new Date().getFullYear()} Чистекс</p>
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