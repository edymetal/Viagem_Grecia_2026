import {
  ArrowRightLeft,
  BedDouble,
  ClipboardCheck,
  Coffee,
  DoorOpen,
  Footprints,
  Landmark,
  Luggage,
  MapPin,
  Plane,
  PlaneLanding,
  ShieldCheck,
  Ticket,
  TrainFront,
  UsersRound,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { Activity } from '../data/schema';
import { activityPhoto } from '../data/placePhotos';

export const athensPhoto = `${import.meta.env.BASE_URL}images/athens-acropolis.jpg`;
export const parthenonPhoto = `${import.meta.env.BASE_URL}images/parthenon.jpg`;

function activitySymbol(a: Activity): [LucideIcon, string] {
  const title = a.title.toLocaleLowerCase('pt-BR');
  if (/café/.test(title)) return [Coffee, 'amber'];
  if (/almoço|jantar|lanche/.test(title)) return [Utensils, 'amber'];
  if (a.transport.mode === 'A pé' || /caminh|deslocamento|retorn|voltar|descida|descer/.test(title))
    return [Footprints, 'cyan'];
  if (/bagagem/.test(title)) return [Luggage, 'purple'];
  if (/procedimentos no aeroporto/.test(title)) return [ShieldCheck, 'blue'];
  if (/portão|preparar-se|conferir quarto/.test(title)) return [ClipboardCheck, 'blue'];
  if (/trocar de plataforma/.test(title)) return [ArrowRightLeft, 'green'];
  if (/apresentar-se ao guia/.test(title)) return [UsersRound, 'purple'];
  if (/chegada prevista/.test(title)) return [PlaneLanding, 'purple'];
  if (/voo|conexão em roma/.test(title)) return [Plane, 'purple'];
  if (/hotel|check-in|check-out|descanso/.test(title)) return [BedDouble, 'pink'];
  if (/passe|acesso/.test(title)) return [Ticket, 'amber'];
  if (/saída|finalizar a visita e sair/.test(title)) return [DoorOpen, 'cyan'];
  if (['Metrô', 'Trem'].includes(a.transport.mode) || /metrô|trem|estação|plataforma/.test(title))
    return [TrainFront, 'green'];
  if (/museu|biblioteca|ágora|templo|acrópole|arco/.test(title)) return [Landmark, 'amber'];
  return [MapPin, 'blue'];
}

export function ActivityVisual({ activity: a }: { activity: Activity }) {
  const photo = activityPhoto(a);
  if (photo)
    return <img className="activity-thumb" src={photo.src} alt={photo.alt} loading="lazy" />;
  if (a.id === 'plan-2-11')
    return (
      <img
        className="activity-thumb"
        src={parthenonPhoto}
        alt="Acrópole de Atenas"
        loading="lazy"
      />
    );
  const [Icon, color] = activitySymbol(a);
  return (
    <span className={`activity-symbol ${color}`} aria-hidden="true">
      <Icon size={24} strokeWidth={1.9} />
    </span>
  );
}
