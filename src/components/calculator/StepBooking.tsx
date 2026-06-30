import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Step, MONTHS, DAYS_SHORT, TIME_SLOTS, SERVICES_URL } from './types';

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

  const cells: (number | null)[] = [];
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

interface Props {
  step: Step;
  totalSum: number;
  originalSum: number;
  totalItems: { label: string; price: string }[];
  bookingDate: Date | null;
  bookingTime: string;
  setBookingDate: (d: Date | null) => void;
  setBookingTime: (t: string) => void;
  name: string;
  phone: string;
  address: string;
  userComment: string;
  setName: (v: string) => void;
  setPhone: (v: string) => void;
  setAddress: (v: string) => void;
  setUserComment: (v: string) => void;
  submitting: boolean;
  handleSubmit: () => void;
  setStep: (s: Step) => void;
  reset: () => void;
  scrollTop: () => void;
}

export default function StepBooking({
  step, totalSum, originalSum, totalItems,
  bookingDate, bookingTime, setBookingDate, setBookingTime,
  name, phone, address, userComment,
  setName, setPhone, setAddress, setUserComment,
  submitting, handleSubmit, setStep, reset, scrollTop,
}: Props) {
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [busyTooltip, setBusyTooltip] = useState('');

  if (step === 'booking') return (
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
        <Calendar onSelect={(d) => {
          setBookingDate(d);
          setBookingTime('');
          setBusyTooltip('');
          const dateStr = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
          setSlotsLoading(true);
          fetch(`${SERVICES_URL}?scope=slots&date=${dateStr}`)
            .then(r => r.json())
            .then(data => setBusySlots(data.busy || []))
            .catch(() => setBusySlots([]))
            .finally(() => setSlotsLoading(false));
        }} />
      </div>
      {bookingDate && (
        <div>
          <p className="font-semibold text-sm mb-2">Выберите время</p>
          {slotsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Icon name="Loader2" size={14} className="animate-spin" /> Загрузка доступного времени...
            </div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-4 gap-2 mb-1">
                {TIME_SLOTS.map(t => {
                  const isBusy = busySlots.includes(t);
                  const now = new Date();
                  const isToday = bookingDate
                    ? bookingDate.getFullYear() === now.getFullYear() &&
                      bookingDate.getMonth() === now.getMonth() &&
                      bookingDate.getDate() === now.getDate()
                    : false;
                  const slotHour = parseInt(t.split(':')[0], 10);
                  const isPast = isToday && slotHour <= now.getHours();
                  const isDisabled = isBusy || isPast;
                  const isSel = bookingTime === t;
                  return (
                    <div key={t} className="relative">
                      <button
                        onClick={() => {
                          if (isDisabled) {
                            setBusyTooltip(t);
                            setTimeout(() => setBusyTooltip(''), 3000);
                          } else {
                            setBookingTime(t);
                            setBusyTooltip('');
                          }
                        }}
                        className={`w-full py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          isSel ? 'border-primary bg-primary/5 text-primary' :
                          isDisabled ? 'border-border/30 text-muted-foreground/40 bg-secondary/30 cursor-pointer' :
                          'border-border hover:border-primary/40'
                        }`}
                      >{t}</button>
                      {isDisabled && busyTooltip === t && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-foreground text-background text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                          {isPast && !isBusy ? 'Это время уже прошло' : 'Время занято — выберите другое'}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
  );

  if (step === 'contacts') return (
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
      <div className="bg-secondary/40 rounded-2xl px-4 py-3 mb-4 space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ваш заказ</p>
        {totalItems.filter(i => !i.label.startsWith('Скидка')).map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.price || '—'}</span>
          </div>
        ))}
        {originalSum > 0 && (
          <div className="flex justify-between items-center text-sm text-green-700">
            <span>Скидка по пакету −10%</span>
            <span className="font-medium">−{(originalSum - totalSum).toLocaleString('ru-RU')} ₽</span>
          </div>
        )}
        <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
          <span className="font-semibold text-sm">Итого</span>
          <div className="text-right">
            {originalSum > 0 && (
              <div className="text-xs text-muted-foreground line-through">{originalSum.toLocaleString('ru-RU')} ₽</div>
            )}
            <span className="font-bold text-primary">{totalSum > 0 ? `${totalSum.toLocaleString('ru-RU')} ₽` : 'по прайсу'}</span>
          </div>
        </div>
      </div>
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
  );

  if (step === 'done') return (
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
  );

  return null;
}
