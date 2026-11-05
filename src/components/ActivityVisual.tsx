import {
  BedDouble,
  Coffee,
  Footprints,
  Landmark,
  MapPin,
  Plane,
  TrainFront,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { Activity } from '../data/schema';

export const athensPhoto = `${import.meta.env.BASE_URL}images/athens-acropolis.jpg`;
export const parthenonPhoto = `${import.meta.env.BASE_URL}images/parthenon.jpg`;
export function ActivityVisual({ activity: a }: { activity: Activity }) {
  if (a.id === 'plan-2-11')
    return (
      <img
        className="activity-thumb"
        src={parthenonPhoto}
        alt="Acrópole de Atenas"
        loading="lazy"
      />
    );
  const title = a.title.toLocaleLowerCase('pt-BR');
  const [Icon, color]: [LucideIcon, string] = /café/.test(title)
    ? [Coffee, 'amber']
    : /almoço|jantar|lanche/.test(title)
      ? [Utensils, 'amber']
      : /hotel|check-in|check-out|descanso/.test(title)
        ? [BedDouble, 'pink']
        : /voo|conexão em roma/.test(title)
          ? [Plane, 'purple']
          : a.transport.mode === 'A pé' || /caminh|deslocamento|retorno|descida/.test(title)
            ? [Footprints, 'cyan']
            : /metrô|trem|estação/.test(title)
              ? [TrainFront, 'green']
              : /museu|biblioteca|ágora|templo|acrópole|arco/.test(title)
                ? [Landmark, 'amber']
                : [MapPin, 'blue'];
  return (
    <span className={`activity-symbol ${color}`} aria-hidden="true">
      <Icon size={24} strokeWidth={1.7} />
    </span>
  );
}
