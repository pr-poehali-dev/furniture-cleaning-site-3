import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { FURNITURE_ITEMS, Step } from './types';

interface Props {
  selected: Set<string>;
  needsDetails: boolean;
  toggle: (id: string) => void;
  calcPrice: () => void;
  setStep: (s: Step) => void;
  scrollTop: () => void;
}

export default function StepFurniture({ selected, needsDetails, toggle, calcPrice, setStep, scrollTop }: Props) {
  return (
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
  );
}
