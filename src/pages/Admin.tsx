import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

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

interface Service {
  id: number;
  name: string;
  price: string;
  sort_order: number;
  is_active: boolean;
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
  const [tab, setTab] = useState<'crm' | 'services'>('crm');

  // CRM
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(() => !!localStorage.getItem('admin_token'));
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Services
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [savingService, setSavingService] = useState(false);
  const [addingNew, setAddingNew] = useState(false);

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
    }
  }, [token, fetchLeads, fetchServices]);

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
        body: JSON.stringify({ name: newService.name, price: newService.price, sort_order: services.length }),
      });
      setNewService({ name: '', price: '' });
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
              Услуги и цены
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

          <div className="flex flex-col sm:flex-row gap-3">
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
          </div>

          {leadsLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Icon name="Loader2" size={24} className="animate-spin mr-2" /> Загрузка...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Icon name="Inbox" size={36} />
              <p>{leads.length === 0 ? 'Заявок пока нет' : 'Ничего не найдено'}</p>
            </div>
          ) : (
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
          )}
        </div>
      )}

      {/* Services Tab */}
      {tab === 'services' && (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-xl">Услуги и цены</h2>
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
              <div className="flex gap-3">
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
                  className="rounded-xl w-52"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createService} disabled={savingService || !newService.name || !newService.price} className="rounded-xl gap-1">
                  <Icon name="Check" size={14} /> {savingService ? 'Сохраняю...' : 'Сохранить'}
                </Button>
                <Button variant="ghost" onClick={() => { setAddingNew(false); setNewService({ name: '', price: '' }); }} className="rounded-xl">
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
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s.id} className={`bg-card border rounded-2xl p-4 transition-opacity ${!s.is_active ? 'opacity-50' : ''} ${editingService?.id === s.id ? 'border-primary/40 border-2' : 'border-border'}`}>
                  {editingService?.id === s.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <Input
                          value={editingService.name}
                          onChange={(e) => setEditingService((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                          className="rounded-xl flex-1"
                          autoFocus
                        />
                        <Input
                          value={editingService.price}
                          onChange={(e) => setEditingService((prev) => prev ? { ...prev, price: e.target.value } : prev)}
                          className="rounded-xl w-52"
                        />
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
      )}
    </div>
  );
}