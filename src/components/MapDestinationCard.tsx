import {
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Footprints,
  MapPin,
  Navigation,
  Plane,
  TrainFront,
} from 'lucide-react';
import type { Activity, LocalDocument } from '../data/schema';
import { activityPhoto } from '../data/placePhotos';
import { dateLabel, mapDestination, mapsLink, zoneLabel } from '../lib/domain';
import { itineraryHref } from '../lib/itineraryRoute';
import { TransportDetails } from '../pages/ActivityDetails';
import { ActivityVisual, parthenonPhoto } from './ActivityVisual';
import { LocalImage } from './ui';

export function DestinationLinks({
  destination,
  routeTo = destination,
  origin,
  title,
  driving,
}: {
  destination: string;
  routeTo?: string;
  origin?: string;
  title: string;
  driving?: boolean;
}) {
  return (
    <div className="destination-links">
      <a
        className="button destination-map-button"
        href={mapsLink(destination)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Abrir ${title} no Google Maps`}
      >
        <Navigation size={18} /> Abrir no mapa
      </a>
      <div className="destination-secondary-links">
        {driving ? (
          <a href={mapsLink(routeTo, 'driving', origin)} target="_blank" rel="noreferrer">
            <CarFront size={16} /> De carro
          </a>
        ) : (
          <>
            <a href={mapsLink(routeTo, 'walking', origin)} target="_blank" rel="noreferrer">
              <Footprints size={16} />
              <span>A pé</span>
            </a>
            <a href={mapsLink(routeTo, 'transit', origin)} target="_blank" rel="noreferrer">
              <TrainFront size={16} />
              <span>Transporte público</span>
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export function MapDestinationCard({
  activity: a,
  documents,
  point,
}: {
  activity: Activity;
  documents: LocalDocument[];
  point?: {
    name: string;
    destination: string;
    routeTo?: string;
    driving?: boolean;
    photoActivityId?: string;
  };
}) {
  const activityDestination = mapDestination(a);
  const destination = point?.destination ?? activityDestination;
  const atActivityDestination = destination === activityDestination;
  const title = point?.name ?? a.title;
  const personalPhoto = atActivityDestination
    ? documents.find((d) => d.id === a.photoDocumentId && d.type.startsWith('image/'))
    : undefined;
  const photo = point?.photoActivityId
    ? activityPhoto({ id: point.photoActivityId })
    : atActivityDestination
      ? activityPhoto(a)
      : null;
  const cover = photo?.src || (atActivityDestination && a.id === 'plan-2-11' ? parthenonPhoto : '');
  const hasPhoto = !!personalPhoto || !!cover;
  const transport = a.transport;
  const hasTransport = !!(
    transport.mode !== 'Não informado' ||
    transport.origin ||
    transport.destination ||
    transport.station ||
    transport.lines ||
    transport.notes ||
    transport.minutes !== null ||
    transport.price !== null
  );
  const TransportIcon =
    transport.mode === 'A pé'
      ? Footprints
      : transport.mode === 'Avião'
        ? Plane
        : transport.mode === 'Carro'
          ? CarFront
          : transport.mode === 'Outro'
            ? MapPin
            : TrainFront;
  return (
    <article
      className={`card location-card destination-card ${a.completed ? 'destination-visited' : ''}`}
      aria-label={title}
    >
      <div className={`destination-cover ${hasPhoto ? '' : 'destination-placeholder'}`}>
        {personalPhoto ? (
          <LocalImage blob={personalPhoto.blob} alt={`Fotografia de ${a.title}`} />
        ) : cover ? (
          <img src={cover} alt={photo?.alt || 'Acrópole de Atenas'} loading="lazy" />
        ) : (
          <ActivityVisual activity={a} />
        )}
        <span className={`destination-status ${a.completed ? 'visited' : ''}`}>
          {a.completed && <Check size={12} />}
          {a.completed ? 'Visita concluída' : a.confirmation}
        </span>
      </div>
      <div className="destination-content">
        <div className="destination-schedule">
          <span>
            <CalendarDays size={13} />
            {dateLabel(a.date)}
          </span>
          <span>
            <Clock3 size={13} />
            <strong>
              {a.start || (a.end ? 'Até ' : 'A definir')}
              {a.start && a.endTimeZone && ` (${zoneLabel(a)})`}
              {a.end && `${a.start ? '–' : ''}${a.end}`}
            </strong>{' '}
            · {zoneLabel(a, 'end')}
          </span>
        </div>
        <h3>{title}</h3>
        <p className="destination-address">
          <MapPin size={16} />
          <span>{destination}</span>
        </p>
        {a.timeCertainty === 'Proposto' && (
          <p className="destination-proposed">Horário proposto · confirmar com o operador</p>
        )}
        {atActivityDestination && transport.mode !== 'Não informado' && (
          <div className="destination-transport-chip">
            <TransportIcon size={14} />
            {transport.mode}
            {transport.minutes !== null &&
              ` · ${transport.minutes}${transport.minutesMax != null && transport.minutesMax !== transport.minutes ? `–${transport.minutesMax}` : ''} min`}
          </div>
        )}
        {a.openingHours && (
          <p className="destination-opening">
            <Clock3 size={14} />
            <span>
              <strong>Funcionamento</strong>
              {a.openingHours}
            </span>
          </p>
        )}
        <DestinationLinks
          destination={destination}
          routeTo={point?.routeTo}
          origin={atActivityDestination ? transport.origin : undefined}
          title={title}
          driving={point?.driving ?? transport.mode === 'Carro'}
        />
        {atActivityDestination && hasTransport && (
          <details className="destination-transport">
            <summary>
              Detalhes do deslocamento <ChevronDown size={16} />
            </summary>
            <TransportDetails activity={a} />
          </details>
        )}
        <a
          className="destination-details-link"
          href={itineraryHref(a.date, a.id)}
          aria-label={`Ver atividade: ${a.title}`}
        >
          Ver atividade
          <ChevronRight size={17} />
        </a>
      </div>
    </article>
  );
}
