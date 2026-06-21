import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const SERVICES_URL = 'https://functions.poehali.dev/69cf7aba-5592-425b-b604-218abbaf0e1d';
const SUBMIT_LEAD_URL = 'https://functions.poehali.dev/f8b7c153-8fc2-4042-9674-36ccc1e91425';

interface Service { id: number; name: string; price: string; }

const FURNITURE_ITEMS = [
  { id: 'sofa_straight', label: 'Прямой диван', icon: 'Sofa' },
  { id: 'sofa_corner',  label: 'Угловой диван', icon: 'Sofa' },
  { id: 'mattress',     label: 'Матрас',         icon: 'BedDouble' },
  { id: 'armchair',     label: 'Кресло',         icon: 'Armchair' },
  { id: 'chair',        label: 'Стул',           icon: 'Armchair' },
  { id: 'odor',         label: 'Удаление запахов', icon: 'Wind' },
];

// Точные названия из БД — должны совпадать с тем, что введено в панели «Услуги и цены»
const SOFA_STRAIGHT_SIZES: Record<string, string> = {
  '2-местный': 'Диван прямой двухместный',
  '3-местный': 'Диван прямой трехместный',
};

const SOFA_CORNER_SIZES: Record<string, string> = {
  'до 4 мест': 'Диван угловой (до 4 мест)',
  'до 6 мест': 'Диван угловой (до 5-6 мест)',
};

const MATTRESS_SIZES: Record<string, string> = {
  'Одноместный': 'Матрас односпальный',
  'Двухместный': 'Матрас двуспальный',
  'King Size': 'Матрас King Size',
};

function findPrice(services: Service[], exactName: string): string {
  const lower = exactName.toLowerCase();
  const found = services.find((s) => s.name.toLowerCase() === lower);
  return found ? found.price : '';
}

function parsePrice(priceStr: string): number {
  const m = priceStr.match(/\d+/);
  if (!m) return 0;
  return parseInt(m[0], 10);
}

function formatPrice(priceStr: string): string {
  const num = parsePrice(priceStr);
  return num > 0 ? `${num.toLocaleString('ru-RU')} ₽` : '—';
}

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const TIME_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

function Calendar({ onSelect }: { onSelect: (date: Date) => void }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const pick = (day: number) => {
    const d = new Date(year, month, day);
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    setSelected(d);
    onSelect(d);
  };

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Icon name="ChevronLeft" size={16} /></button>
        <span className="font-semibold text-sm">{MONTHS[month]} {year}</span>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Icon name="ChevronRight" size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS_SHORT.map(d => <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(year, month, day);
          const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isSel = selected?.getDate() === day && selected?.getMonth() === month && selected?.getFullYear() === year;
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          return (
            <button
              key={day}
              onClick={() => pick(day)}
              disabled={isPast}
              className={`text-sm rounded-lg py-1.5 transition-colors font-medium
                ${isSel ? 'bg-primary text-primary-foreground' : ''}
                ${isToday && !isSel ? 'border border-primary text-primary' : ''}
                ${isPast ? 'text-muted-foreground/30 cursor-not-allowed' : !isSel ? 'hover:bg-secondary' : ''}
              `}
            >{day}</button>
          );
        })}
      </div>
    </div>
  );
}

function CounterRow({ label, id, getCount, setCount }: {
  label: string;
  id: string;
  getCount: (id: string) => number;
  setCount: (id: string, val: number) => void;
}) {
  const count = getCount(id);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCount(id, count - 1)}
          className="w-9 h-9 rounded-xl border-2 border-border hover:border-primary/40 font-bold text-lg transition-all flex items-center justify-center"
        >−</button>
        <span className="font-bold text-xl w-6 text-center">{count}</span>
        <button
          onClick={() => setCount(id, count + 1)}
          className="w-9 h-9 rounded-xl border-2 border-border hover:border-primary/40 font-bold text-lg transition-all flex items-center justify-center"
        >+</button>
      </div>
    </div>
  );
}

type Step = 'furniture' | 'details' | 'price' | 'upsell' | 'booking' | 'contacts' | 'done';

interface Upsell {
  id: string;
  title: string;
  desc: string;
  badge: string;
  addItems: string[];
}

function getUpsells(selected: Set<string>): Upsell[] {
  const hasSofa = selected.has('sofa_straight') || selected.has('sofa_corner');
  const hasMattress = selected.has('mattress');
  const hasOdor = selected.has('odor');
  const result: Upsell[] = [];

  if (hasSofa && !hasMattress) {
    result.push({
      id: 'family',
      title: 'Семейный пакет',
      desc: 'Добавьте чистку матраса — часто они загрязнены так же, как диван. Вместе дешевле.',
      badge: 'Скидка 10%',
      addItems: ['mattress'],
    });
  }
  if (hasMattress && !hasSofa) {
    result.push({
      id: 'family',
      title: 'Семейный пакет',
      desc: 'Добавьте чистку дивана — мастер уже приедет, а вместе это выгоднее.',
      badge: 'Скидка 10%',
      addItems: ['sofa_straight'],
    });
  }
  if (hasSofa && !hasOdor) {
    result.push({
      id: 'pets',
      title: 'После питомцев',
      desc: 'Избавьтесь не только от пятен, но и от запаха животных с экономией 10% на весь заказ.',
      badge: 'Скидка 10%',
      addItems: ['odor'],
    });
  }
  return result;
}

export default function PriceCalculator() {
  const [services, setServices] = useState<Service[]>([]);
  const [step, setStep] = useState<Step>('furniture');

  // Шаг 1 — выбор мебели
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Шаг 2 — уточнение деталей
  const [sofaStraightSize, setSofaStraightSize] = useState('');
  const [sofaCornerSize, setSofaCornerSize] = useState('');
  const [mattressSize, setMattressSize] = useState('');
  // Количество для каждого типа
  const [counts, setCounts] = useState<Record<string, number>>({});
  // Шаг 3 — цена
  const [totalItems, setTotalItems] = useState<{ label: string; price: string }[]>([]);
  const [totalSum, setTotalSum] = useState(0);
  const [originalSum, setOriginalSum] = useState(0);
  // Шаг 4 — запись
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingTime, setBookingTime] = useState('');
  // Шаг 5 — контакты
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [acceptedUpsells, setAcceptedUpsells] = useState<Set<string>>(new Set());

  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${SERVICES_URL}?scope=services`)
      .then(r => r.json())
      .then(d => { if (d.services?.length) setServices(d.services); })
      .catch(() => {});
  }, []);

  const scrollTop = () => setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

  const getCount = (id: string) => counts[id] ?? 1;
  const setCount = (id: string, val: number) => setCounts(prev => ({ ...prev, [id]: Math.max(1, Math.min(20, val)) }));

  const needsStraightDetail = selected.has('sofa_straight');
  const needsCornerDetail = selected.has('sofa_corner');
  const needsMattressDetail = selected.has('mattress');
  const needsDetails = needsStraightDetail || needsCornerDetail || needsMattressDetail || selected.size > 0;

  const detailsReady = (
    (!needsStraightDetail || sofaStraightSize) &&
    (!needsCornerDetail || sofaCornerSize) &&
    (!needsMattressDetail || mattressSize)
  );

  const addItemWithCount = (
    items: { label: string; price: string }[],
    label: string,
    exactName: string,
    count: number,
    sum: { val: number }
  ) => {
    const priceStr = findPrice(services, exactName);
    const num = parsePrice(priceStr) * count;
    const displayLabel = count > 1 ? `${label} × ${count}` : label;
    items.push({ label: displayLabel, price: formatPrice(String(num)) });
    sum.val += num;
  };

  const calcPrice = () => {
    const items: { label: string; price: string }[] = [];
    const sum = { val: 0 };

    if (selected.has('sofa_straight') && sofaStraightSize) {
      addItemWithCount(items, SOFA_STRAIGHT_SIZES[sofaStraightSize], SOFA_STRAIGHT_SIZES[sofaStraightSize], getCount('sofa_straight'), sum);
    }
    if (selected.has('sofa_corner') && sofaCornerSize) {
      addItemWithCount(items, SOFA_CORNER_SIZES[sofaCornerSize], SOFA_CORNER_SIZES[sofaCornerSize], getCount('sofa_corner'), sum);
    }
    if (selected.has('mattress') && mattressSize) {
      addItemWithCount(items, MATTRESS_SIZES[mattressSize], MATTRESS_SIZES[mattressSize], getCount('mattress'), sum);
    }
    if (selected.has('armchair')) {
      addItemWithCount(items, 'Кресло', 'Кресло', getCount('armchair'), sum);
    }
    if (selected.has('chair')) {
      addItemWithCount(items, 'Стул с мягкой обивкой', 'Стул с мягкой обивкой', getCount('chair'), sum);
    }
    if (selected.has('odor')) {
      addItemWithCount(items, 'Удаление запахов', 'Удаление запахов', getCount('odor'), sum);
    }

    setTotalItems(items);
    setTotalSum(sum.val);
    const upsells = getUpsells(selected);
    setStep(upsells.length > 0 ? 'upsell' : 'price');
    scrollTop();
  };

  const handleSubmit = async () => {
    if (!phone.trim() || !address.trim()) return;
    setSubmitting(true);
    const furnitureList = totalItems.map(i => `${i.label} (${i.price})`).join(', ');
    const appointedAt = bookingDate && bookingTime
      ? `${bookingDate.toLocaleDateString('ru-RU')} в ${bookingTime}`
      : '';
    try {
      await fetch(SUBMIT_LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, address,
          furniture: furnitureList,
          appointed_at: appointedAt,
          comment: [
            `Итого: ${totalSum > 0 ? totalSum.toLocaleString('ru-RU') + ' ₽' : 'по прайсу'}`,
            userComment.trim() ? `Комментарий: ${userComment.trim()}` : '',
          ].filter(Boolean).join('\n'),
          source: 'calculator',
        }),
      });
      setStep('done');
      scrollTop();
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep('furniture');
    setSelected(new Set());
    setSofaStraightSize(''); setSofaCornerSize(''); setMattressSize(''); setCounts({});
    setTotalItems([]); setTotalSum(0); setOriginalSum(0);
    setBookingDate(null); setBookingTime('');
    setName(''); setPhone(''); setAddress(''); setUserComment('');
    setAcceptedUpsells(new Set());
    scrollTop();
  };

  const buildBaseItems = () => {
    const items: { label: string; price: string }[] = [];
    const sum = { val: 0 };
    if (selected.has('sofa_straight') && sofaStraightSize)
      addItemWithCount(items, SOFA_STRAIGHT_SIZES[sofaStraightSize], SOFA_STRAIGHT_SIZES[sofaStraightSize], getCount('sofa_straight'), sum);
    if (selected.has('sofa_corner') && sofaCornerSize)
      addItemWithCount(items, SOFA_CORNER_SIZES[sofaCornerSize], SOFA_CORNER_SIZES[sofaCornerSize], getCount('sofa_corner'), sum);
    if (selected.has('mattress') && mattressSize)
      addItemWithCount(items, MATTRESS_SIZES[mattressSize], MATTRESS_SIZES[mattressSize], getCount('mattress'), sum);
    if (selected.has('armchair'))
      addItemWithCount(items, 'Кресло', 'Кресло', getCount('armchair'), sum);
    if (selected.has('chair'))
      addItemWithCount(items, 'Стул с мягкой обивкой', 'Стул с мягкой обивкой', getCount('chair'), sum);
    if (selected.has('odor'))
      addItemWithCount(items, 'Удаление запахов', 'Удаление запахов', getCount('odor'), sum);
    return { items, sum };
  };

  const applyUpsellsAndGoToPrice = (accepted: Set<string>) => {
    const { items, sum } = buildBaseItems();
    const upsells = getUpsells(selected);

    for (const upsell of upsells) {
      if (!accepted.has(upsell.id)) continue;
      for (const itemId of upsell.addItems) {
        if (itemId === 'mattress' && !selected.has('mattress')) {
          const priceStr = findPrice(services, MATTRESS_SIZES['Двухместный']);
          const num = parsePrice(priceStr);
          if (num > 0) {
            items.push({ label: 'Матрас двуспальный', price: formatPrice(String(num)) });
            sum.val += num;
          }
        }
        if (itemId === 'sofa_straight' && !selected.has('sofa_straight') && !selected.has('sofa_corner')) {
          const priceStr = findPrice(services, SOFA_STRAIGHT_SIZES['3-местный']);
          const num = parsePrice(priceStr);
          if (num > 0) {
            items.push({ label: 'Диван прямой 3-местный', price: formatPrice(String(num)) });
            sum.val += num;
          }
        }
        if (itemId === 'odor' && !selected.has('odor')) {
          const priceStr = findPrice(services, 'Удаление запахов');
          const num = parsePrice(priceStr);
          if (num > 0) {
            items.push({ label: 'Удаление запахов', price: formatPrice(String(num)) });
            sum.val += num;
          }
        }
      }
    }

    if (accepted.size > 0 && sum.val > 0) {
      const beforeDiscount = sum.val;
      const discount = Math.round(sum.val * 0.1);
      items.push({ label: 'Скидка по пакету −10%', price: `−${discount.toLocaleString('ru-RU')} ₽` });
      sum.val = sum.val - discount;
      setOriginalSum(beforeDiscount);
    } else {
      setOriginalSum(0);
    }

    setTotalItems(items);
    setTotalSum(sum.val);
    setStep('price');
    scrollTop();
  };

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div ref={topRef} className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-sm">

      {/* ШАГИ — индикатор */}
      {step !== 'done' && (
        <div className="flex items-center gap-1.5 mb-6">
          {(['furniture','details','price','booking','contacts'] as Step[])
            .filter(s => s !== 'price' && (s !== 'details' || needsDetails))
            .map((s, i, arr) => {
              const stepOrder: Step[] = ['furniture','details','booking','contacts'];
              const filtered = stepOrder.filter(x => x !== 'details' || needsDetails);
              const current = filtered.indexOf(step === 'price' ? 'booking' : step);
              const idx = filtered.indexOf(s);
              const done = idx < current;
              const active = idx === current;
              return (
                <div key={s} className="flex items-center gap-1.5 flex-1">
                  <div className={`flex-1 h-1.5 rounded-full transition-colors ${done || active ? 'bg-primary' : 'bg-secondary'}`} />
                  {i === arr.length - 1 && <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-primary' : 'bg-secondary'}`} />}
                </div>
              );
            })}
        </div>
      )}

      {/* ШАГ 1 — выбор мебели */}
      {step === 'furniture' && (
        <div>
          <h3 className="font-bold text-xl mb-1">Что нужно почистить?</h3>
          <p className="text-sm text-muted-foreground mb-5">Можно выбрать несколько позиций</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {FURNITURE_ITEMS.map(item => {
              const active = selected.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all text-center ${
                    active ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background hover:border-primary/40'
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
          <Button
            disabled={selected.size === 0}
            onClick={() => { if (needsDetails) { setStep('details'); scrollTop(); } else calcPrice(); }}
            className="w-full rounded-xl h-12 font-semibold"
          >
            Рассчитать стоимость <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>
      )}

      {/* ШАГ 2 — уточнение деталей */}
      {step === 'details' && (
        <div>
          <h3 className="font-bold text-xl mb-1">Уточните параметры</h3>
          <p className="text-sm text-muted-foreground mb-5">Это нужно для точного расчёта</p>
          <div className="space-y-5">

            {needsStraightDetail && (
              <div>
                <p className="font-semibold mb-2 text-sm">Размер прямого дивана</p>
                <div className="flex gap-2 mb-3">
                  {Object.keys(SOFA_STRAIGHT_SIZES).map(s => (
                    <button key={s} onClick={() => setSofaStraightSize(s)}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${sofaStraightSize === s ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'}`}
                    >{s}</button>
                  ))}
                </div>
                <CounterRow label="Количество" id="sofa_straight" getCount={getCount} setCount={setCount} />
              </div>
            )}

            {needsCornerDetail && (
              <div>
                <p className="font-semibold mb-2 text-sm">Размер углового дивана</p>
                <div className="flex gap-2 mb-3">
                  {Object.keys(SOFA_CORNER_SIZES).map(s => (
                    <button key={s} onClick={() => setSofaCornerSize(s)}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${sofaCornerSize === s ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'}`}
                    >{s}</button>
                  ))}
                </div>
                <CounterRow label="Количество" id="sofa_corner" getCount={getCount} setCount={setCount} />
              </div>
            )}

            {needsMattressDetail && (
              <div>
                <p className="font-semibold mb-2 text-sm">Размер матраса</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {Object.keys(MATTRESS_SIZES).map(s => (
                    <button key={s} onClick={() => setMattressSize(s)}
                      className={`flex-1 min-w-[90px] py-3 rounded-xl border-2 font-medium text-sm transition-all ${mattressSize === s ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'}`}
                    >{s}</button>
                  ))}
                </div>
                <CounterRow label="Количество" id="mattress" getCount={getCount} setCount={setCount} />
              </div>
            )}

            {selected.has('armchair') && (
              <CounterRow label="Количество кресел" id="armchair" getCount={getCount} setCount={setCount} />
            )}

            {selected.has('chair') && (
              <CounterRow label="Количество стульев" id="chair" getCount={getCount} setCount={setCount} />
            )}

            {selected.has('odor') && (
              <CounterRow label="Удаление запахов (предметов)" id="odor" getCount={getCount} setCount={setCount} />
            )}

          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep('furniture')} className="rounded-xl h-12 px-5">
              <Icon name="ArrowLeft" size={16} />
            </Button>
            <Button disabled={!detailsReady} onClick={calcPrice} className="flex-1 rounded-xl h-12 font-semibold">
              Рассчитать стоимость <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ШАГ UPSELL — допродажи */}
      {step === 'upsell' && (() => {
        const upsells = getUpsells(selected);
        return (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="grid place-items-center w-12 h-12 rounded-xl bg-accent/20 text-accent-foreground flex-shrink-0">
                <Icon name="Sparkles" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl leading-tight">Специальные предложения</h3>
                <p className="text-sm text-muted-foreground">Добавьте услугу и сэкономьте</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {upsells.map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    setAcceptedUpsells(prev => {
                      const next = new Set(prev);
                      if (next.has(u.id)) next.delete(u.id); else next.add(u.id);
                      return next;
                    });
                  }}
                  className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${acceptedUpsells.has(u.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                >
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    {u.badge}
                  </span>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${acceptedUpsells.has(u.id) ? 'bg-primary border-primary' : 'border-border'}`}>
                      {acceptedUpsells.has(u.id) && <Icon name="Check" size={12} className="text-primary-foreground" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{u.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{u.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep(needsDetails ? 'details' : 'furniture'); }} className="rounded-xl h-12 px-5">
                <Icon name="ArrowLeft" size={16} />
              </Button>
              <Button onClick={() => applyUpsellsAndGoToPrice(acceptedUpsells)} className="flex-1 rounded-xl h-12 font-semibold">
                {acceptedUpsells.size > 0 ? 'Добавить и посмотреть цену' : 'Пропустить'} <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        );
      })()}

      {/* ШАГ 3 — показ цены */}
      {step === 'price' && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0">
              <Icon name="Calculator" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl leading-tight">Ваша стоимость</h3>
              <p className="text-sm text-muted-foreground">Цена фиксируется до выезда специалиста</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {totalItems.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-secondary/50 rounded-xl px-4 py-3">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="font-bold text-primary">{item.price || '—'}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center bg-primary/5 border border-primary/20 rounded-xl px-4 py-3.5 mb-6">
            <span className="font-semibold">Итого</span>
            <div className="text-right">
              {originalSum > 0 && (
                <div className="text-sm text-muted-foreground line-through">
                  {originalSum.toLocaleString('ru-RU')} ₽
                </div>
              )}
              <span className="font-bold text-2xl text-primary">
                {totalSum > 0 ? `${totalSum.toLocaleString('ru-RU')} ₽` : 'по прайсу'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              const upsells = getUpsells(selected);
              if (upsells.length > 0) {
                setAcceptedUpsells(new Set());
                setStep('upsell');
              } else {
                setStep(needsDetails ? 'details' : 'furniture');
              }
            }} className="rounded-xl h-12 px-5">
              <Icon name="ArrowLeft" size={16} />
            </Button>
            <Button onClick={() => { setStep('booking'); scrollTop(); }} className="flex-1 rounded-xl h-12 font-semibold">
              <Icon name="CalendarDays" size={16} className="mr-2" /> Записаться на удобное время
            </Button>
          </div>
        </div>
      )}

      {/* ШАГ 4 — запись на дату и время */}
      {step === 'booking' && (
        <div>
          <h3 className="font-bold text-xl mb-1">Выберите дату и время</h3>
          <p className="text-sm text-muted-foreground mb-5">Специалист приедет в удобное для вас время</p>
          {totalSum > 0 && (
            <div className="flex justify-between items-center bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 mb-5">
              <span className="text-sm font-medium">Итоговая стоимость</span>
              <span className="font-bold text-primary">{totalSum.toLocaleString('ru-RU')} ₽</span>
            </div>
          )}
          <div className="bg-secondary/30 rounded-2xl p-4 mb-4">
            <Calendar onSelect={setBookingDate} />
          </div>
          {bookingDate && (
            <div>
              <p className="font-semibold text-sm mb-2">Выберите время</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    onClick={() => setBookingTime(t)}
                    className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      bookingTime === t ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('price')} className="rounded-xl h-12 px-5">
              <Icon name="ArrowLeft" size={16} />
            </Button>
            <Button
              disabled={!bookingDate || !bookingTime}
              onClick={() => { setStep('contacts'); scrollTop(); }}
              className="flex-1 rounded-xl h-12 font-semibold"
            >
              Продолжить <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </div>
          <button
            onClick={() => { setStep('contacts'); scrollTop(); }}
            className="w-full text-center text-sm text-muted-foreground mt-3 hover:text-foreground transition-colors"
          >
            Пропустить, выберу позже
          </button>
        </div>
      )}

      {/* ШАГ 5 — контакты */}
      {step === 'contacts' && (
        <div>
          <h3 className="font-bold text-xl mb-1">Ваши данные</h3>
          <p className="text-sm text-muted-foreground mb-5">Менеджер свяжется для подтверждения</p>
          {bookingDate && bookingTime && (
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 mb-4">
              <Icon name="CalendarCheck" size={16} className="text-primary flex-shrink-0" />
              <span className="text-sm font-medium">
                {bookingDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в {bookingTime}
              </span>
            </div>
          )}
          <div className="space-y-3 mb-5">
            <Input
              placeholder="Ваше имя"
              value={name}
              onChange={e => setName(e.target.value)}
              className="rounded-xl h-12"
            />
            <Input
              placeholder="Телефон для связи *"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="rounded-xl h-12"
              type="tel"
            />
            <Input
              placeholder="Адрес, где будут производиться работы *"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="rounded-xl h-12"
            />
            <Textarea
              placeholder="Дополнительный комментарий (необязательно) — опишите загрязнения, материал мебели, особые пожелания"
              value={userComment}
              onChange={e => setUserComment(e.target.value)}
              className="rounded-xl resize-none min-h-[90px]"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('booking')} className="rounded-xl h-12 px-5">
              <Icon name="ArrowLeft" size={16} />
            </Button>
            <Button
              disabled={!phone.trim() || !address.trim() || submitting}
              onClick={handleSubmit}
              className="flex-1 rounded-xl h-12 font-semibold"
            >
              {submitting ? <><Icon name="Loader2" size={16} className="animate-spin mr-2" />Отправляю...</> : 'Отправить заявку'}
            </Button>
          </div>
        </div>
      )}

      {/* ГОТОВО */}
      {step === 'done' && (
        <div className="text-center py-6">
          <div className="grid place-items-center w-20 h-20 rounded-full bg-green-100 text-green-600 mx-auto mb-5">
            <Icon name="CheckCircle2" size={40} />
          </div>
          <h3 className="font-bold text-2xl mb-3">Мы получили вашу заявку!</h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Менеджер свяжется с вами в ближайшее время для её подтверждения
          </p>
          <Button variant="outline" onClick={reset} className="rounded-xl h-11">
            Рассчитать ещё раз
          </Button>
        </div>
      )}
    </div>
  );
}