import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AUTH_URL = 'https://functions.poehali.dev/5284cfbd-315b-46e6-9070-7bd4e724c3b9';
const LEADS_URL = 'https://functions.poehali.dev/69cf7aba-5592-425b-b604-218abbaf0e1d';

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Выполнена',
  cancelled: 'Отменена',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const SOURCE_LABELS: Record<string, string> = {
  form: 'Форма заявки',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  furniture_picker: 'Подборщик мебели',
  calculator: 'Калькулятор цены',
};

interface Lead {
  id: number;
  name: string | null;
  phone: string | null;
  comment: string | null;
  source: string;
  furniture: string | null;
  appointed_at: string | null;
  address: string | null;
  status: string;
  created_at: string;
}

const SERVICE_CATEGORIES: Record<string, string> = {
  sofas: 'Диваны',
  mattresses: 'Матрасы',
  other: 'Другая мебель',
  additional: 'Дополнительные услуги',
  packages: 'Пакетные предложения',
};

interface Service {
  id: number;
  name: string;
  price: string;
  sort_order: number;
  is_active: boolean;
  category: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [tab, setTab] = useState<'crm' | 'services' | 'finance' | 'ads'>('crm');

  // CRM
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(() => !!localStorage.getItem('admin_token'));
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [crmView, setCrmView] = useState<'list' | 'calendar'>('list');
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calSelected, setCalSelected] = useState<string | null>(null);

  // Services
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({ name: '', price: '', category: 'other' });
  const [savingService, setSavingService] = useState(false);
  const [addingNew, setAddingNew] = useState(false);

  // Finance
  const [finDateFrom, setFinDateFrom] = useState('');
  const [finDateTo, setFinDateTo] = useState('');

  // Ads
  interface AdChannel {
    id: number;
    name: string;
    slug: string;
    budget: number;
    impressions: number;
    leads_count: number;
    leads_planned: number;
    sales: number;
    sort_order: number;
  }
  const [adChannels, setAdChannels] = useState<AdChannel[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [editingAd, setEditingAd] = useState<AdChannel | null>(null);
  const [savingAd, setSavingAd] = useState(false);

  const fetchAds = useCallback(async (t: string) => {
    setAdsLoading(true);
    try {
      const res = await fetch(`${LEADS_URL}?scope=ads&token=${encodeURIComponent(t)}`);
      const data = await res.json();
      setAdChannels(data.channels || []);
    } finally {
      setAdsLoading(false);
    }
  }, []);

  const saveAd = async (ch: AdChannel) => {
    setSavingAd(true);
    try {
      await fetch(`${LEADS_URL}?scope=ads&token=${encodeURIComponent(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ch),
      });
      setEditingAd(null);
      fetchAds(token);
    } finally {
      setSavingAd(false);
    }
  };

  const fetchLeads = useCallback(async (t: string) => {
    setLeadsLoading(true);
    try {
      const res = await fetch(`${LEADS_URL}?token=${encodeURIComponent(t)}`);
      if (res.status === 401) { setToken(''); localStorage.removeItem('admin_token'); return; }
      const data = await res.json();
      setLeads(data.leads || []);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async (t: string) => {
    setServicesLoading(true);
    try {
      const res = await fetch(`${LEADS_URL}?scope=services&token=${encodeURIComponent(t)}`);
      const data = await res.json();
      setServices(data.services || []);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchLeads(token);
      fetchServices(token);
      fetchAds(token);
    }
  }, [token, fetchLeads, fetchServices, fetchAds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem('admin_token', password);
        setToken(password);
      } else {
        setAuthError('Неверный пароль');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${LEADS_URL}?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const createService = async () => {
    if (!newService.name.trim() || !newService.price.trim()) return;
    setSavingService(true);
    try {
      await fetch(`${LEADS_URL}?scope=services&token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newService.name, price: newService.price, category: newService.category, sort_order: services.length }),
      });
      setNewService({ name: '', price: '', category: 'other' });
      setAddingNew(false);
      fetchServices(token);
    } finally {
      setSavingService(false);
    }
  };

  const updateService = async (s: Service) => {
    setSavingService(true);
    try {
      await fetch(`${LEADS_URL}?scope=services&token=${encodeURIComponent(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      setEditingService(null);
      fetchServices(token);
    } finally {
      setSavingService(false);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm('Удалить услугу?')) return;
    await fetch(`${LEADS_URL}?scope=services&token=${encodeURIComponent(token)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchServices(token);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-card border border-border rounded-3xl p-8 w-full max-w-sm shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
              <Icon name="ShieldCheck" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Панель администратора</h1>
              <p className="text-muted-foreground text-sm">Введите пароль для входа</p>
            </div>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl"
              autoFocus
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <Button type="submit" disabled={authLoading} className="w-full rounded-xl h-11 font-semibold">
              {authLoading ? 'Вход...' : 'Войти'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const filtered = leads.filter((l) => {
    const matchStatus = filter === 'all' || l.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [l.name, l.phone, l.comment, l.furniture].some((v) => v?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const counts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  const parseLeadSum = (l: Lead): number => {
    const matches = l.furniture?.match(/\(−?[\d\s]+₽\)/g) || [];
    return matches.reduce((s, m) => {
      const negative = m.includes('−');
      const num = parseInt(m.replace(/\D/g, ''), 10);
      return s + (negative ? -num : num);
    }, 0);
  };

  // Finance filters
  const QUICK_PERIODS = [
    { label: 'Всё время', from: '', to: '' },
    { label: 'Этот месяц', from: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; })(), to: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(new Date(d.getFullYear(),d.getMonth()+1,0).getDate()).padStart(2,'0')}`; })() },
    { label: 'Прошлый месяц', from: (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; })(), to: (() => { const d = new Date(); d.setDate(0); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })() },
    { label: 'Этот год', from: `${new Date().getFullYear()}-01-01`, to: `${new Date().getFullYear()}-12-31` },
  ];

  const finLeads = leads.filter(l => {
    const d = new Date(l.created_at);
    if (finDateFrom && d < new Date(finDateFrom)) return false;
    if (finDateTo && d > new Date(finDateTo + 'T23:59:59')) return false;
    return true;
  });

  const financeStats = Object.keys(STATUS_LABELS).map((key) => {
    const statusLeads = finLeads.filter(l => l.status === key);
    const total = statusLeads.reduce((sum, l) => sum + parseLeadSum(l), 0);
    return { key, count: statusLeads.length, total };
  });

  const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  const monthlyData = (() => {
    const map: Record<string, { month: string; выручка: number; заказов: number }> = {};
    finLeads.filter(l => l.status === 'done').forEach(l => {
      const d = new Date(l.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`;
      if (!map[key]) map[key] = { month: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, выручка: 0, заказов: 0 };
      map[key].выручка += parseLeadSum(l);
      map[key].заказов += 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  })();

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTab('crm')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === 'crm' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'
              }`}
            >
              <Icon name="LayoutDashboard" size={16} />
              CRM · Заявки
              {leads.length > 0 && (
                <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 ${tab === 'crm' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                  {leads.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('services')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === 'services' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'
              }`}
            >
              <Icon name="ListChecks" size={16} />
              Управление услугами
            </button>
            <button
              onClick={() => setTab('finance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === 'finance' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'
              }`}
            >
              <Icon name="CircleDollarSign" size={16} />
              Финансы
            </button>
            <button
              onClick={() => setTab('ads')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === 'ads' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'
              }`}
            >
              <Icon name="Megaphone" size={16} />
              Реклама
            </button>
          </div>
          <div className="flex items-center gap-2">
            {tab === 'crm' && (
              <Button variant="ghost" size="sm" onClick={() => fetchLeads(token)} className="gap-1">
                <Icon name="RefreshCw" size={14} /> Обновить
              </Button>
            )}
            {tab === 'services' && (
              <Button variant="ghost" size="sm" onClick={() => fetchServices(token)} className="gap-1">
                <Icon name="RefreshCw" size={14} /> Обновить
              </Button>
            )}
            {tab === 'ads' && (
              <Button variant="ghost" size="sm" onClick={() => fetchAds(token)} className="gap-1">
                <Icon name="RefreshCw" size={14} /> Обновить
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1 text-muted-foreground">
              <Icon name="LogOut" size={14} /> Выйти
            </Button>
          </div>
        </div>
      </header>

      {/* CRM Tab */}
      {tab === 'crm' && (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div key={key} className="bg-card border border-border rounded-2xl p-4">
                <p className="text-muted-foreground text-xs mb-1">{label}</p>
                <p className="font-bold text-2xl">
                  {leadsLoading ? <span className="text-muted-foreground text-lg">—</span> : (counts[key] || 0)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex gap-1 bg-secondary rounded-xl p-1">
              <button onClick={() => setCrmView('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${crmView === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                <Icon name="List" size={14} /> Список
              </button>
              <button onClick={() => setCrmView('calendar')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${crmView === 'calendar' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                <Icon name="CalendarDays" size={14} /> Календарь
              </button>
            </div>
            {crmView === 'list' && (
              <>
                <Input
                  placeholder="Поиск по имени, телефону, комментарию..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-xl h-10 max-w-xs"
                />
                <div className="flex gap-2 flex-wrap">
                  {[['all', 'Все'], ...Object.entries(STATUS_LABELS)].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filter === key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-secondary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Calendar view */}
          {crmView === 'calendar' && !leadsLoading && (() => {
            const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
            const MONTHS_FULL = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
            const firstDay = new Date(calYear, calMonth, 1).getDay();
            const offset = firstDay === 0 ? 6 : firstDay - 1;
            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
            const cells: (number | null)[] = [];
            for (let i = 0; i < offset; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push(d);

            const leadsByDay: Record<string, Lead[]> = {};
            leads.forEach(l => {
              if (!l.appointed_at) return;
              const match = l.appointed_at.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
              if (!match) return;
              const key = `${match[3]}-${match[2]}-${match[1]}`;
              if (!leadsByDay[key]) leadsByDay[key] = [];
              leadsByDay[key].push(l);
            });

            const selKey = calSelected;
            const selLeads = selKey ? (leadsByDay[selKey] || []) : [];

            return (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); } else setCalMonth(m => m-1); setCalSelected(null); }} className="p-2 rounded-xl hover:bg-secondary transition-colors"><Icon name="ChevronLeft" size={18} /></button>
                    <span className="font-semibold">{MONTHS_FULL[calMonth]} {calYear}</span>
                    <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); } else setCalMonth(m => m+1); setCalSelected(null); }} className="p-2 rounded-xl hover:bg-secondary transition-colors"><Icon name="ChevronRight" size={18} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAYS_SHORT.map(d => <div key={d} className="text-center text-xs text-muted-foreground py-1 font-medium">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((day, i) => {
                      if (!day) return <div key={i} />;
                      const dKey = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      const dayLeads = leadsByDay[dKey] || [];
                      const isToday = new Date().getDate() === day && new Date().getMonth() === calMonth && new Date().getFullYear() === calYear;
                      const isSel = selKey === dKey;
                      return (
                        <button key={day} onClick={() => setCalSelected(isSel ? null : dKey)}
                          className={`relative min-h-[52px] rounded-xl p-1.5 text-left transition-all border-2 ${isSel ? 'border-primary bg-primary/5' : dayLeads.length > 0 ? 'border-border hover:border-primary/40 bg-secondary/30' : 'border-transparent hover:bg-secondary/50'}`}>
                          <span className={`text-xs font-semibold block mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>{day}</span>
                          {dayLeads.slice(0,3).map(l => (
                            <div key={l.id} className={`text-[10px] leading-tight px-1 py-0.5 rounded mb-0.5 truncate ${STATUS_COLORS[l.status]}`}>
                              {l.name || 'Без имени'}
                            </div>
                          ))}
                          {dayLeads.length > 3 && <div className="text-[10px] text-muted-foreground px-1">+{dayLeads.length - 3}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selLeads.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Заявки на {selKey ? `${selKey.split('-')[2]}.${selKey.split('-')[1]}.${selKey.split('-')[0]}` : ''}
                    </p>
                    {selLeads.map(lead => (
                      <div key={lead.id} className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{lead.name || 'Без имени'}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
                              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{SOURCE_LABELS[lead.source] || lead.source}</span>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                              {lead.phone && <div className="flex items-center gap-2"><Icon name="Phone" size={14} className="text-muted-foreground" /><a href={`tel:${lead.phone}`} className="text-primary hover:underline">{lead.phone}</a></div>}
                              {lead.appointed_at && <div className="flex items-center gap-2 sm:col-span-2"><Icon name="CalendarCheck" size={14} className="text-primary" /><span className="font-medium text-primary">{lead.appointed_at}</span></div>}
                              {lead.address && <div className="flex items-center gap-2 sm:col-span-2"><Icon name="MapPin" size={14} className="text-muted-foreground" /><span>{lead.address}</span></div>}
                              {lead.furniture && <div className="flex items-center gap-2 sm:col-span-2"><Icon name="Sofa" size={14} className="text-muted-foreground" /><span>{lead.furniture}</span></div>}
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col gap-1.5 flex-shrink-0">
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                              <button key={key} onClick={() => updateStatus(lead.id, key)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${lead.status === key ? `${STATUS_COLORS[key]} ring-1 ring-current` : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'}`}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {crmView === 'list' && leadsLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Icon name="Loader2" size={24} className="animate-spin mr-2" /> Загрузка...
            </div>
          ) : crmView === 'list' && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Icon name="Inbox" size={36} />
              <p>{leads.length === 0 ? 'Заявок пока нет' : 'Ничего не найдено'}</p>
            </div>
          ) : crmView === 'list' ? (
            <div className="space-y-3">
              {filtered.map((lead) => (
                <div key={lead.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{lead.name || 'Без имени'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}>
                          {STATUS_LABELS[lead.status]}
                        </span>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          {SOURCE_LABELS[lead.source] || lead.source}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">{formatDate(lead.created_at)}</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Icon name="Phone" size={14} className="text-muted-foreground flex-shrink-0" />
                            <a href={`tel:${lead.phone}`} className="text-primary hover:underline">{lead.phone}</a>
                          </div>
                        )}
                        {lead.appointed_at && (
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Icon name="CalendarCheck" size={14} className="text-primary flex-shrink-0" />
                            <span className="font-medium text-primary">{lead.appointed_at}</span>
                          </div>
                        )}
                        {lead.address && (
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Icon name="MapPin" size={14} className="text-muted-foreground flex-shrink-0" />
                            <span>{lead.address}</span>
                          </div>
                        )}
                        {lead.furniture && (
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Icon name="Sofa" size={14} className="text-muted-foreground flex-shrink-0" />
                            <span>{lead.furniture}</span>
                          </div>
                        )}
                        {lead.comment && (
                          <div className="flex items-start gap-2 sm:col-span-2">
                            <Icon name="MessageSquare" size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{lead.comment}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-1.5 flex-shrink-0">
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => updateStatus(lead.id, key)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                            lead.status === key
                              ? `${STATUS_COLORS[key]} ring-1 ring-current`
                              : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Services Tab */}
      {tab === 'services' && (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-xl">Управление услугами</h2>
              <p className="text-sm text-muted-foreground">Изменения сразу отображаются на сайте</p>
            </div>
            <Button onClick={() => { setAddingNew(true); setEditingService(null); }} className="gap-2 rounded-xl">
              <Icon name="Plus" size={16} /> Добавить услугу
            </Button>
          </div>

          {/* Форма добавления */}
          {addingNew && (
            <div className="bg-card border-2 border-primary/40 rounded-2xl p-5 space-y-3">
              <p className="font-semibold text-sm">Новая услуга</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Название (например: Чистка дивана)"
                  value={newService.name}
                  onChange={(e) => setNewService((s) => ({ ...s, name: e.target.value }))}
                  className="rounded-xl flex-1"
                  autoFocus
                />
                <Input
                  placeholder="Цена (например: от 3 500 ₽)"
                  value={newService.price}
                  onChange={(e) => setNewService((s) => ({ ...s, price: e.target.value }))}
                  className="rounded-xl w-48"
                />
                <select
                  value={newService.category}
                  onChange={(e) => setNewService((s) => ({ ...s, category: e.target.value }))}
                  className="rounded-xl border border-border bg-background text-sm px-3 h-10 w-52"
                >
                  {Object.entries(SERVICE_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={createService} disabled={savingService || !newService.name || !newService.price} className="rounded-xl gap-1">
                  <Icon name="Check" size={14} /> {savingService ? 'Сохраняю...' : 'Сохранить'}
                </Button>
                <Button variant="ghost" onClick={() => { setAddingNew(false); setNewService({ name: '', price: '', category: 'other' }); }} className="rounded-xl">
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {servicesLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Icon name="Loader2" size={24} className="animate-spin mr-2" /> Загрузка...
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Icon name="PackageOpen" size={36} />
              <p>Услуг пока нет — добавьте первую</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(SERVICE_CATEGORIES).map(([catKey, catLabel]) => {
                const catServices = services.filter(s => (s.category || 'other') === catKey);
                return (
                  <div key={catKey}>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{catLabel}</h3>
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{catServices.length}</span>
                    </div>
                    {catServices.length === 0 ? (
                      <p className="text-sm text-muted-foreground/60 py-2 pl-1">Нет услуг в этой категории</p>
                    ) : (
                      <div className="space-y-2">
                        {catServices.map((s) => (
                <div key={s.id} className={`bg-card border rounded-2xl p-4 transition-opacity ${!s.is_active ? 'opacity-50' : ''} ${editingService?.id === s.id ? 'border-primary/40 border-2' : 'border-border'}`}>
                  {editingService?.id === s.id ? (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          value={editingService.name}
                          onChange={(e) => setEditingService((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                          className="rounded-xl flex-1"
                          autoFocus
                        />
                        <Input
                          value={editingService.price}
                          onChange={(e) => setEditingService((prev) => prev ? { ...prev, price: e.target.value } : prev)}
                          className="rounded-xl w-48"
                        />
                        <select
                          value={editingService.category || 'other'}
                          onChange={(e) => setEditingService((prev) => prev ? { ...prev, category: e.target.value } : prev)}
                          className="rounded-xl border border-border bg-background text-sm px-3 h-10 w-52"
                        >
                          {Object.entries(SERVICE_CATEGORIES).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingService.is_active}
                            onChange={(e) => setEditingService((prev) => prev ? { ...prev, is_active: e.target.checked } : prev)}
                            className="rounded"
                          />
                          Показывать на сайте
                        </label>
                        <div className="flex gap-2 ml-auto">
                          <Button onClick={() => updateService(editingService)} disabled={savingService} className="rounded-xl gap-1" size="sm">
                            <Icon name="Check" size={14} /> {savingService ? 'Сохраняю...' : 'Сохранить'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingService(null)} className="rounded-xl">
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-primary font-bold text-sm">{s.price}</p>
                      </div>
                      {!s.is_active && (
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Скрыта</span>
                      )}
                      <button
                        onClick={() => { setEditingService(s); setAddingNew(false); }}
                        className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="Pencil" size={16} />
                      </button>
                      <button
                        onClick={() => deleteService(s.id)}
                        className="p-2 rounded-xl hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  )}
                </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Finance Tab */}
      {tab === 'finance' && (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-1">Финансы</h2>
            <p className="text-sm text-muted-foreground">Сводка по заказам и суммам в разбивке по статусам</p>
          </div>

          {/* Фильтр по датам */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_PERIODS.map(p => {
                const active = finDateFrom === p.from && finDateTo === p.to;
                return (
                  <button
                    key={p.label}
                    onClick={() => { setFinDateFrom(p.from); setFinDateTo(p.to); }}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/40 text-muted-foreground'}`}
                  >{p.label}</button>
                );
              })}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground whitespace-nowrap">С</span>
                <Input type="date" value={finDateFrom} onChange={e => setFinDateFrom(e.target.value)} className="rounded-xl h-9 text-sm" />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground whitespace-nowrap">По</span>
                <Input type="date" value={finDateTo} onChange={e => setFinDateTo(e.target.value)} className="rounded-xl h-9 text-sm" />
              </div>
              {(finDateFrom || finDateTo) && (
                <button onClick={() => { setFinDateFrom(''); setFinDateTo(''); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Сбросить
                </button>
              )}
            </div>
          </div>

          {leadsLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Icon name="Loader2" size={24} className="animate-spin mr-2" /> Загрузка...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {financeStats.map(({ key, count, total }) => {
                  const colorMap: Record<string, string> = {
                    new: 'border-blue-200 bg-blue-50',
                    in_progress: 'border-yellow-200 bg-yellow-50',
                    done: 'border-green-200 bg-green-50',
                    cancelled: 'border-gray-200 bg-gray-50',
                  };
                  const iconMap: Record<string, string> = {
                    new: 'Inbox',
                    in_progress: 'Clock',
                    done: 'CircleCheck',
                    cancelled: 'CircleX',
                  };
                  return (
                    <div key={key} className={`rounded-2xl border-2 p-5 ${colorMap[key]}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon name={iconMap[key]} size={18} className="text-muted-foreground" />
                        <span className="font-semibold text-sm">{STATUS_LABELS[key]}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Заказов</p>
                          <p className="text-3xl font-bold">{count}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-0.5">Сумма</p>
                          <p className="text-2xl font-bold">
                            {total > 0 ? `${total.toLocaleString('ru-RU')} ₽` : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs text-muted-foreground mb-1">Итого выручка (выполненные заказы)</p>
                <p className="text-3xl font-bold text-green-600">
                  {(financeStats.find(s => s.key === 'done')?.total || 0).toLocaleString('ru-RU')} ₽
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  В работе ещё {(financeStats.find(s => s.key === 'in_progress')?.total || 0).toLocaleString('ru-RU')} ₽ · Новых {(financeStats.find(s => s.key === 'new')?.total || 0).toLocaleString('ru-RU')} ₽
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="font-semibold text-sm mb-1">Выручка по месяцам</p>
                <p className="text-xs text-muted-foreground mb-5">Только выполненные заказы</p>
                {monthlyData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Пока нет выполненных заказов</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}к`} />
                      <Tooltip
                        formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, 'Выручка']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: 13 }}
                      />
                      <Bar dataKey="выручка" fill="hsl(var(--primary))" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Ads Tab */}
      {tab === 'ads' && (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-1">Рекламные каналы</h2>
            <p className="text-sm text-muted-foreground">Бюджет, заявки, продажи и эффективность по каждому каналу</p>
          </div>

          {adsLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Icon name="Loader2" size={24} className="animate-spin mr-2" /> Загрузка...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Сводная таблица */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40">
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground whitespace-nowrap">Канал</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Бюджет, ₽</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Показы</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Заявки факт</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Заявки план</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Конверсия</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Цена заявки</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Продажи</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Цена продажи</th>
                        <th className="px-3 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {adChannels.map((ch) => {
                        const convRate = ch.impressions > 0 ? ((ch.leads_count / ch.impressions) * 100).toFixed(2) : '—';
                        const cpl = ch.leads_count > 0 ? Math.round(ch.budget / ch.leads_count) : null;
                        const cps = ch.sales > 0 ? Math.round(ch.budget / ch.sales) : null;
                        const isEditing = editingAd?.id === ch.id;

                        if (isEditing && editingAd) {
                          return (
                            <tr key={ch.id} className="border-b border-border bg-primary/5">
                              <td className="px-5 py-3 font-semibold whitespace-nowrap">{ch.name}</td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={editingAd.budget} onChange={e => setEditingAd(p => p ? { ...p, budget: +e.target.value } : p)}
                                  className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={editingAd.impressions} onChange={e => setEditingAd(p => p ? { ...p, impressions: +e.target.value } : p)}
                                  className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={editingAd.leads_count} onChange={e => setEditingAd(p => p ? { ...p, leads_count: +e.target.value } : p)}
                                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={editingAd.leads_planned} onChange={e => setEditingAd(p => p ? { ...p, leads_planned: +e.target.value } : p)}
                                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm" />
                              </td>
                              <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                              <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={editingAd.sales} onChange={e => setEditingAd(p => p ? { ...p, sales: +e.target.value } : p)}
                                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm" />
                              </td>
                              <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                              <td className="px-3 py-2">
                                <div className="flex gap-1">
                                  <button onClick={() => saveAd(editingAd)} disabled={savingAd}
                                    className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                                    <Icon name={savingAd ? 'Loader2' : 'Check'} size={14} className={savingAd ? 'animate-spin' : ''} />
                                  </button>
                                  <button onClick={() => setEditingAd(null)}
                                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                                    <Icon name="X" size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={ch.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                            <td className="px-5 py-4 font-semibold whitespace-nowrap">{ch.name}</td>
                            <td className="px-4 py-4 text-right">{ch.budget > 0 ? ch.budget.toLocaleString('ru-RU') : '—'}</td>
                            <td className="px-4 py-4 text-right">{ch.impressions > 0 ? ch.impressions.toLocaleString('ru-RU') : '—'}</td>
                            <td className="px-4 py-4 text-right">
                              <span className="font-semibold">{ch.leads_count > 0 ? ch.leads_count : '—'}</span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              {ch.leads_planned > 0 ? (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ch.leads_count >= ch.leads_planned ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {ch.leads_planned}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-4 text-right text-muted-foreground">{ch.impressions > 0 ? `${convRate}%` : '—'}</td>
                            <td className="px-4 py-4 text-right">{cpl != null ? `${cpl.toLocaleString('ru-RU')} ₽` : '—'}</td>
                            <td className="px-4 py-4 text-right font-semibold">{ch.sales > 0 ? ch.sales : '—'}</td>
                            <td className="px-4 py-4 text-right">{cps != null ? `${cps.toLocaleString('ru-RU')} ₽` : '—'}</td>
                            <td className="px-3 py-4">
                              <button onClick={() => setEditingAd({ ...ch })}
                                className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                                <Icon name="Pencil" size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {/* Итоговая строка */}
                    {adChannels.length > 0 && (() => {
                      const totBudget = adChannels.reduce((s, c) => s + c.budget, 0);
                      const totLeads = adChannels.reduce((s, c) => s + c.leads_count, 0);
                      const totPlanned = adChannels.reduce((s, c) => s + c.leads_planned, 0);
                      const totSales = adChannels.reduce((s, c) => s + c.sales, 0);
                      const totCpl = totLeads > 0 ? Math.round(totBudget / totLeads) : null;
                      const totCps = totSales > 0 ? Math.round(totBudget / totSales) : null;
                      return (
                        <tfoot>
                          <tr className="bg-secondary/60 font-semibold border-t-2 border-border">
                            <td className="px-5 py-3 text-muted-foreground">Итого</td>
                            <td className="px-4 py-3 text-right">{totBudget > 0 ? totBudget.toLocaleString('ru-RU') : '—'}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                            <td className="px-4 py-3 text-right">{totLeads > 0 ? totLeads : '—'}</td>
                            <td className="px-4 py-3 text-right">{totPlanned > 0 ? totPlanned : '—'}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">—</td>
                            <td className="px-4 py-3 text-right">{totCpl != null ? `${totCpl.toLocaleString('ru-RU')} ₽` : '—'}</td>
                            <td className="px-4 py-3 text-right">{totSales > 0 ? totSales : '—'}</td>
                            <td className="px-4 py-3 text-right">{totCps != null ? `${totCps.toLocaleString('ru-RU')} ₽` : '—'}</td>
                            <td />
                          </tr>
                        </tfoot>
                      );
                    })()}
                  </table>
                </div>
              </div>

              {/* Карточки-подсказки */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {adChannels.map(ch => {
                  const planPct = ch.leads_planned > 0 ? Math.min(100, Math.round((ch.leads_count / ch.leads_planned) * 100)) : null;
                  return (
                    <div key={ch.id} className="bg-card border border-border rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">{ch.name}</p>
                      <p className="text-2xl font-bold">{ch.leads_count}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">заявок</p>
                      {planPct != null && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">план</span>
                            <span className={planPct >= 100 ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>{planPct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${planPct >= 100 ? 'bg-green-500' : 'bg-yellow-400'}`} style={{ width: `${planPct}%` }} />
                          </div>
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
    </div>
  );
}