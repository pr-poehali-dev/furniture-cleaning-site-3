import { useState, useEffect, useRef } from 'react';
import {
  Service, Step,
  SERVICES_URL, SUBMIT_LEAD_URL,
  SOFA_STRAIGHT_SIZES, SOFA_CORNER_SIZES, MATTRESS_SIZES,
  findPrice, parsePrice, formatPrice, getUpsells, getAutoBundle,
} from './calculator/types';
import StepFurniture from './calculator/StepFurniture';
import StepDetails from './calculator/StepDetails';
import StepBooking from './calculator/StepBooking';

export default function PriceCalculator() {
  const [services, setServices] = useState<Service[]>([]);
  const [step, setStep] = useState<Step>('furniture');

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sofaStraightSize, setSofaStraightSize] = useState('');
  const [sofaCornerSize, setSofaCornerSize] = useState('');
  const [mattressSize, setMattressSize] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [totalItems, setTotalItems] = useState<{ label: string; price: string }[]>([]);
  const [totalSum, setTotalSum] = useState(0);
  const [originalSum, setOriginalSum] = useState(0);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingTime, setBookingTime] = useState('');
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

    if (selected.has('sofa_straight') && sofaStraightSize)
      addItemWithCount(items, SOFA_STRAIGHT_SIZES[sofaStraightSize], SOFA_STRAIGHT_SIZES[sofaStraightSize], getCount('sofa_straight'), sum);
    if (selected.has('sofa_corner') && sofaCornerSize)
      addItemWithCount(items, SOFA_CORNER_SIZES[sofaCornerSize], SOFA_CORNER_SIZES[sofaCornerSize], getCount('sofa_corner'), sum);
    if (selected.has('mattress') && mattressSize)
      addItemWithCount(items, MATTRESS_SIZES[mattressSize], MATTRESS_SIZES[mattressSize], getCount('mattress'), sum);
    if (selected.has('armchair'))
      addItemWithCount(items, 'Кресло', 'Кресло', getCount('armchair'), sum);
    if (selected.has('armchair_pc'))
      addItemWithCount(items, 'Кресло компьютерное', 'Кресло компьютерное', getCount('armchair_pc'), sum);
    if (selected.has('chair'))
      addItemWithCount(items, 'Стул с мягкой обивкой', 'Стул с мягкой обивкой', getCount('chair'), sum);
    if (selected.has('odor'))
      addItemWithCount(items, 'Удаление запахов', 'Удаление запахов', getCount('odor'), sum);
    if (selected.has('headboard'))
      addItemWithCount(items, 'Изголовье кровати', 'Изголовье кровати', getCount('headboard'), sum);
    if (selected.has('kitchen'))
      addItemWithCount(items, 'Кухонный уголок', 'Кухонный уголок', getCount('kitchen'), sum);

    const autoBundle = getAutoBundle(selected);
    if (autoBundle && sum.val > 0) {
      const discount = Math.round(sum.val * 0.1);
      items.push({ label: `Скидка «${autoBundle}» −10%`, price: `−${discount.toLocaleString('ru-RU')} ₽` });
      setOriginalSum(sum.val);
      sum.val = sum.val - discount;
      setTotalItems(items);
      setTotalSum(sum.val);
      setStep('price');
      scrollTop();
      return;
    }

    setTotalItems(items);
    setTotalSum(sum.val);
    const upsells = getUpsells(selected);
    setStep(upsells.length > 0 ? 'upsell' : 'price');
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
    if (selected.has('armchair_pc'))
      addItemWithCount(items, 'Кресло компьютерное', 'Кресло компьютерное', getCount('armchair_pc'), sum);
    if (selected.has('chair'))
      addItemWithCount(items, 'Стул с мягкой обивкой', 'Стул с мягкой обивкой', getCount('chair'), sum);
    if (selected.has('odor'))
      addItemWithCount(items, 'Удаление запахов', 'Удаление запахов', getCount('odor'), sum);
    if (selected.has('headboard'))
      addItemWithCount(items, 'Изголовье кровати', 'Изголовье кровати', getCount('headboard'), sum);
    if (selected.has('kitchen'))
      addItemWithCount(items, 'Кухонный уголок', 'Кухонный уголок', getCount('kitchen'), sum);
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
          if (num > 0) { items.push({ label: 'Матрас двуспальный', price: formatPrice(String(num)) }); sum.val += num; }
        }
        if (itemId === 'sofa_straight' && !selected.has('sofa_straight') && !selected.has('sofa_corner')) {
          const priceStr = findPrice(services, SOFA_STRAIGHT_SIZES['3-местный']);
          const num = parsePrice(priceStr);
          if (num > 0) { items.push({ label: 'Диван прямой 3-местный', price: formatPrice(String(num)) }); sum.val += num; }
        }
        if (itemId === 'odor' && !selected.has('odor')) {
          const priceStr = findPrice(services, 'Удаление запахов');
          const num = parsePrice(priceStr);
          if (num > 0) { items.push({ label: 'Удаление запахов', price: formatPrice(String(num)) }); sum.val += num; }
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

  return (
    <div ref={topRef} className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-sm">

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

      {step === 'furniture' && (
        <StepFurniture
          selected={selected}
          needsDetails={needsDetails}
          toggle={toggle}
          calcPrice={calcPrice}
          setStep={setStep}
          scrollTop={scrollTop}
        />
      )}

      {(step === 'details' || step === 'upsell' || step === 'price') && (
        <StepDetails
          step={step}
          selected={selected}
          needsDetails={needsDetails}
          sofaStraightSize={sofaStraightSize}
          sofaCornerSize={sofaCornerSize}
          mattressSize={mattressSize}
          setSofaStraightSize={setSofaStraightSize}
          setSofaCornerSize={setSofaCornerSize}
          setMattressSize={setMattressSize}
          detailsReady={!!detailsReady}
          getCount={getCount}
          setCount={setCount}
          calcPrice={calcPrice}
          setStep={setStep}
          acceptedUpsells={acceptedUpsells}
          setAcceptedUpsells={setAcceptedUpsells}
          applyUpsellsAndGoToPrice={applyUpsellsAndGoToPrice}
          totalItems={totalItems}
          totalSum={totalSum}
          originalSum={originalSum}
          services={services}
          scrollTop={scrollTop}
        />
      )}

      {(step === 'booking' || step === 'contacts' || step === 'done') && (
        <StepBooking
          step={step}
          totalSum={totalSum}
          originalSum={originalSum}
          totalItems={totalItems}
          bookingDate={bookingDate}
          bookingTime={bookingTime}
          setBookingDate={setBookingDate}
          setBookingTime={setBookingTime}
          name={name}
          phone={phone}
          address={address}
          userComment={userComment}
          setName={setName}
          setPhone={setPhone}
          setAddress={setAddress}
          setUserComment={setUserComment}
          submitting={submitting}
          handleSubmit={handleSubmit}
          setStep={setStep}
          reset={reset}
          scrollTop={scrollTop}
        />
      )}
    </div>
  );
}