export const SERVICES_URL = 'https://functions.poehali.dev/69cf7aba-5592-425b-b604-218abbaf0e1d';
export const SUBMIT_LEAD_URL = 'https://functions.poehali.dev/f8b7c153-8fc2-4042-9674-36ccc1e91425';

export interface Service { id: number; name: string; price: string; }

export const FURNITURE_ITEMS = [
  { id: 'sofa_straight', label: 'Прямой диван', icon: 'Sofa' },
  { id: 'sofa_corner',  label: 'Угловой диван', icon: 'Sofa' },
  { id: 'mattress',     label: 'Матрас',         icon: 'BedDouble' },
  { id: 'armchair',     label: 'Кресло',         icon: 'Armchair' },
  { id: 'chair',        label: 'Стул',           icon: 'Armchair' },
  { id: 'odor',         label: 'Удаление запахов', icon: 'Wind' },
];

export const SOFA_STRAIGHT_SIZES: Record<string, string> = {
  '2-местный': 'Диван прямой двухместный',
  '3-местный': 'Диван прямой трехместный',
};

export const SOFA_CORNER_SIZES: Record<string, string> = {
  'до 4 мест': 'Диван угловой (до 4 мест)',
  'до 6 мест': 'Диван угловой (до 5-6 мест)',
};

export const MATTRESS_SIZES: Record<string, string> = {
  'Одноместный': 'Матрас односпальный',
  'Двухместный': 'Матрас двуспальный',
  'King Size': 'Матрас King Size',
};

export const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
export const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
export const TIME_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

export type Step = 'furniture' | 'details' | 'price' | 'upsell' | 'booking' | 'contacts' | 'done';

export interface Upsell {
  id: string;
  title: string;
  desc: string;
  badge: string;
  addItems: string[];
}

export function findPrice(services: Service[], exactName: string): string {
  const lower = exactName.toLowerCase();
  const found = services.find((s) => s.name.toLowerCase() === lower);
  return found ? found.price : '';
}

export function parsePrice(priceStr: string): number {
  const m = priceStr.match(/\d+/);
  if (!m) return 0;
  return parseInt(m[0], 10);
}

export function formatPrice(priceStr: string): string {
  const num = parsePrice(priceStr);
  return num > 0 ? `${num.toLocaleString('ru-RU')} ₽` : '—';
}

export function getUpsells(selected: Set<string>): Upsell[] {
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
  if ((hasSofa || hasMattress) && !hasOdor) {
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