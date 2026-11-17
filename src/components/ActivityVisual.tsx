import {
  ArrowRightLeft,
  BedDouble,
  CarFront,
  CircleParking,
  ClipboardCheck,
  Coffee,
  DoorOpen,
  Footprints,
  Gamepad2,
  Landmark,
  LogIn,
  LogOut,
  Luggage,
  MapPin,
  Mountain,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  ShieldCheck,
  Telescope,
  Ticket,
  TrainFront,
  TrainFrontTunnel,
  Trees,
  UsersRound,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { Activity } from '../data/schema';
import { activityPhoto } from '../data/placePhotos';

export const athensPhoto = `${import.meta.env.BASE_URL}images/athens-acropolis.jpg`;
export const parthenonPhoto = `${import.meta.env.BASE_URL}images/parthenon.jpg`;

const transportBrands = {
  'ita-airways': 'ITA Airways',
  ryanair: 'Ryanair',
  trenitalia: 'Trenitalia',
  'metro-atenas': 'Metrô de Atenas',
  'metro-roma': 'Metrô de Roma',
};

function transportBrand(a: Activity): keyof typeof transportBrands | null {
  const { mode, lines } = a.transport;
  const service = `${a.title} ${lines}`;

  if (mode === 'Avião') {
    if (/\b(?:Ryanair|FR\s*\d{2,4})\b/i.test(service)) return 'ryanair';
    if (/\b(?:ITA|AZ\s*\d{2,4})\b/i.test(service)) return 'ita-airways';
  }
  if (mode === 'Trem' && /\b(?:Leonardo Express|Trenitalia)\b/i.test(service)) return 'trenitalia';
  if (mode === 'Metrô') {
    if (a.timeZone === 'Europe/Athens') return 'metro-atenas';
    if (a.timeZone === 'Europe/Rome') return 'metro-roma';
  }
  return null;
}

function activitySymbol(a: Activity): [LucideIcon, string] {
  const title = a.title.toLocaleLowerCase('pt-BR');
  if (/estacionamento|retirada do carro/.test(title)) return [CircleParking, 'blue'];
  if (a.transport.mode === 'Carro') return [CarFront, 'cyan'];
  if (a.transport.mode === 'Avião') return [Plane, 'purple'];
  if (a.transport.mode === 'Metrô') return [TrainFrontTunnel, 'green'];
  if (a.transport.mode === 'Trem') return [TrainFront, 'green'];
  if (/café/.test(title)) return [Coffee, 'amber'];
  if (/almoço|jantar|lanche/.test(title)) return [Utensils, 'amber'];
  if (/check-in/.test(title)) return [LogIn, 'pink'];
  if (/check-out/.test(title)) return [LogOut, 'pink'];
  if (/conexão em roma|trocar de plataforma/.test(title)) return [ArrowRightLeft, 'blue'];
  if (/procedimentos no aeroporto|segurança do aeroporto/.test(title)) return [ShieldCheck, 'blue'];
  if (/\bdesembarque\b|chegada prevista/.test(title)) return [PlaneLanding, 'purple'];
  if (/\bembarque\b/.test(title)) return [PlaneTakeoff, 'purple'];
  if (a.transport.mode === 'A pé' || /caminh|deslocamento|retorn|voltar|descida|descer/.test(title))
    return [Footprints, 'cyan'];
  if (/bagagem/.test(title)) return [Luggage, 'purple'];
  if (/portão|preparar-se|conferir quarto/.test(title)) return [ClipboardCheck, 'blue'];
  if (/\btour\b|visita guiada|apresentar-se ao guia/.test(title)) return [UsersRound, 'purple'];
  if (/planetário/.test(title)) return [Telescope, 'purple'];
  if (/\bgamm\b|\bgame museum\b/.test(title)) return [Gamepad2, 'purple'];
  if (/licabeto|filopapo/.test(title)) return [Mountain, 'green'];
  if (/jardim|parque/.test(title)) return [Trees, 'green'];
  if (/voo/.test(title)) return [Plane, 'purple'];
  if (/hotel|descanso/.test(title)) return [BedDouble, 'pink'];
  if (/passe|acesso/.test(title)) return [Ticket, 'amber'];
  if (/saída|finalizar a visita e sair/.test(title)) return [DoorOpen, 'cyan'];
  if (/metrô|trem|estação|plataforma/.test(title)) return [TrainFront, 'green'];
  if (/museu|biblioteca|ágora|templo|acrópole|arco|galleria/.test(title)) return [Landmark, 'amber'];
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
  const brand = transportBrand(a);
  if (brand)
    return (
      <span className={`activity-symbol activity-brand activity-brand-${brand}`}>
        <img
          className="activity-brand-mark"
          src={`${import.meta.env.BASE_URL}images/brands/${brand}.png`}
          alt={transportBrands[brand]}
          loading="lazy"
        />
      </span>
    );
  const [Icon, color] = activitySymbol(a);
  return (
    <span className={`activity-symbol ${color}`} aria-hidden="true">
      <Icon size={24} strokeWidth={1.9} />
    </span>
  );
}
