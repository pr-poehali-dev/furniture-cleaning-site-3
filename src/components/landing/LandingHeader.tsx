import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const NAV = [
  { id: 'hero', label: 'Главная' },
  { id: 'services', label: 'Услуги' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'calculator', label: 'Калькулятор' },
  { id: 'process', label: 'Процесс' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contacts', label: 'Контакты' },
];

interface Props {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  scrollTo: (id: string) => void;
}

export default function LandingHeader({ menuOpen, setMenuOpen, scrollTo }: Props) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-8">
        <button onClick={() => scrollTo('hero')} className="flex items-center">
          <img
            src="https://cdn.poehali.dev/projects/07a52f30-72bd-43a7-943b-fb5b19303e7b/bucket/e50719c1-844c-449b-8cce-1a62414ae30d.png"
            alt="Кликчист"
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
        <button className="md:hidden grid place-items-center w-10 h-10 rounded-xl bg-secondary" onClick={() => setMenuOpen(!menuOpen)}>
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
  );
}
