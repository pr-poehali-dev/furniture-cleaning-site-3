import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Step, Upsell,
  SOFA_STRAIGHT_SIZES, SOFA_CORNER_SIZES, MATTRESS_SIZES,
  getUpsells, findPrice, parsePrice, formatPrice,
  Service,
} from './types';

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

interface DetailsProps {
  step: Step;
  selected: Set<string>;
  needsDetails: boolean;
  sofaStraightSize: string;
  sofaCornerSize: string;
  mattressSize: string;
  setSofaStraightSize: (v: string) => void;
  setSofaCornerSize: (v: string) => void;
  setMattressSize: (v: string) => void;
  detailsReady: boolean;
  getCount: (id: string) => number;
  setCount: (id: string, val: number) => void;
  calcPrice: () => void;
  setStep: (s: Step) => void;
  acceptedUpsells: Set<string>;
  setAcceptedUpsells: (fn: (prev: Set<string>) => Set<string>) => void;
  applyUpsellsAndGoToPrice: (accepted: Set<string>) => void;
  totalItems: { label: string; price: string }[];
  totalSum: number;
  originalSum: number;
  services: Service[];
  scrollTop: () => void;
}

export default function StepDetails({
  step, selected, needsDetails,
  sofaStraightSize, sofaCornerSize, mattressSize,
  setSofaStraightSize, setSofaCornerSize, setMattressSize,
  detailsReady, getCount, setCount,
  calcPrice, setStep,
  acceptedUpsells, setAcceptedUpsells, applyUpsellsAndGoToPrice,
  totalItems, totalSum, originalSum,
}: DetailsProps) {
  const needsStraightDetail = selected.has('sofa_straight');
  const needsCornerDetail = selected.has('sofa_corner');
  const needsMattressDetail = selected.has('mattress');

  if (step === 'details') return (
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
        {selected.has('armchair_pc') && (
          <CounterRow label="Количество компьютерных кресел" id="armchair_pc" getCount={getCount} setCount={setCount} />
        )}
        {selected.has('chair') && (
          <CounterRow label="Количество стульев" id="chair" getCount={getCount} setCount={setCount} />
        )}
        {selected.has('odor') && (
          <CounterRow label="Удаление запахов (предметов)" id="odor" getCount={getCount} setCount={setCount} />
        )}
        {selected.has('headboard') && (
          <CounterRow label="Количество изголовий кровати" id="headboard" getCount={getCount} setCount={setCount} />
        )}
        {selected.has('kitchen') && (
          <CounterRow label="Количество кухонных уголков" id="kitchen" getCount={getCount} setCount={setCount} />
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
  );

  if (step === 'upsell') {
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
          {upsells.map((u: Upsell) => (
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
  }

  if (step === 'price') return (
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
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
        <Icon name="ShieldCheck" size={20} className="text-green-600 flex-shrink-0" />
        <p className="text-sm text-green-800 font-medium">Гарантия качества — если не понравится, переделаем бесплатно</p>
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
            setAcceptedUpsells(() => new Set());
            setStep('upsell');
          } else {
            setStep(needsDetails ? 'details' : 'furniture');
          }
        }} className="rounded-xl h-12 px-5">
          <Icon name="ArrowLeft" size={16} />
        </Button>
        <Button onClick={() => setStep('booking')} className="flex-1 rounded-xl h-12 font-semibold">
          <Icon name="CalendarDays" size={16} className="mr-2" /> Записаться на удобное время
        </Button>
      </div>
    </div>
  );

  return null;
}