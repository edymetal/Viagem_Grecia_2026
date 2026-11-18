import {
  ArrowLeft,
  Check,
  Clock3,
  Edit3,
  Flag,
  Heart,
  Hourglass,
  MapPin,
  Navigation,
  Route,
  Ticket,
  TrainFront,
} from 'lucide-react';
import type { Activity } from '../data/schema';
import type { TravelStore } from '../hooks/useTravel';
import {
  activityInstant,
  dateLabel,
  euro,
  mapDestination,
  mapsLink,
  moneyRange,
  zoneLabel,
} from '../lib/domain';
import { itineraryHref } from '../lib/itineraryRoute';
import { ActivityVisual, parthenonPhoto } from '../components/ActivityVisual';
import { LocalImage } from '../components/ui';
import { activityPhoto } from '../data/placePhotos';
import { ActivityDocuments } from '../components/ActivityDocuments';

export function ActivityDetails({
  activity: a,
  store,
  onEdit,
}: {
  activity: Activity;
  store: TravelStore;
  onEdit: () => void;
}) {
  const photo = store.documents.find(
    (d) => d.id === a.photoDocumentId && d.type.startsWith('image/'),
  );
  const destination = mapDestination(a);
  const placePhoto = activityPhoto(a);
  const photoSource = placePhoto?.src ?? (a.id === 'plan-2-11' ? parthenonPhoto : undefined);
  const directionMode =
    a.transport.mode === 'A pé'
      ? 'walking'
      : a.transport.mode === 'Carro'
        ? 'driving'
        : ['Metrô', 'Trem', 'Transporte público'].includes(a.transport.mode)
          ? 'transit'
          : undefined;
  const origin = a.transport.origin.trim();
  const hasRoute = directionMode && origin && destination && origin !== destination;
  const hasStatus = a.confirmation !== 'Planejada' || a.required;
  const scheduledDuration = (activityInstant(a, 'end') - activityInstant(a)) / 60_000;
  const showDuration =
    a.duration !== null && a.duration !== scheduledDuration && a.duration !== a.transport.minutes;
  const timeHint =
    a.timeCertainty === 'Estimativa'
      ? 'Horário estimado'
      : a.timeCertainty === 'Proposto' && a.confirmation !== 'Pendente'
        ? 'Horário a confirmar'
        : '';
  const links = [
    {
      url: a.ticketUrl,
      label: /\/infomobilita\//i.test(a.ticketUrl)
        ? 'Avisos de serviço'
        : a.confirmation === 'Confirmada'
          ? 'Portal de ingressos'
          : 'Ver ingressos',
    },
    { url: a.guideUrl, label: 'Reservar guia' },
    { url: a.website, label: 'Site oficial' },
  ].filter(({ url }, index, all) => url && all.findIndex((link) => link.url === url) === index);
  const toggle = (field: 'favorite' | 'completed') => {
    void store
      .update((s) => {
        const activity = s.activities.find((x) => x.id === a.id)!;
        activity[field] = !activity[field];
        return s;
      })
      .catch(() => undefined);
  };
  return (
    <section className="activity-screen" aria-label={`Detalhes de ${a.title}`}>
      <header className="route-heading">
        <a className="icon-button" href={itineraryHref(a.date)} aria-label="Voltar ao roteiro">
          <ArrowLeft size={23} />
        </a>
        <h1 tabIndex={-1}>Detalhes</h1>
        <button
          className={`icon-button favorite-toggle ${a.favorite ? 'is-favorite' : ''}`}
          aria-label={a.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={!!a.favorite}
          disabled={store.busy}
          onClick={() => toggle('favorite')}
        >
          <Heart size={24} fill={a.favorite ? 'currentColor' : 'none'} />
        </button>
      </header>
      <div className="activity-detail-layout">
        <div className="activity-detail-primary">
          <section
            className="card detail-section detail-overview"
            aria-labelledby="activity-detail-name"
          >
            <div className="detail-title-row">
              <ActivityVisual activity={a} showPhoto={false} />
              <div>
                <h2 className="detail-name" id="activity-detail-name">
                  {a.title}
                </h2>
                {hasStatus && (
                  <div className="detail-status">
                    {a.confirmation !== 'Planejada' && (
                      <span className={`badge ${a.confirmation === 'Pendente' ? 'warm' : ''}`}>
                        {a.confirmation}
                      </span>
                    )}
                    {a.required && (
                      <span className="badge warm">
                        <Flag size={12} /> Obrigatória
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <dl className="visit-facts">
              <div className="detail-scheduled-time">
                <dt>
                  <Clock3 size={19} /> {a.start || a.end ? 'Horário' : 'Data'}
                </dt>
                <dd>
                  {a.start || a.end ? (
                    <>
                      <strong>
                        {a.start || 'Até '}
                        {a.start && a.endTimeZone && ` (${zoneLabel(a)})`}
                        {a.end && `${a.start ? ' – ' : ''}${a.end}`}
                        {a.end && a.endTimeZone && ` (${zoneLabel(a, 'end')})`}
                      </strong>
                      <small>
                        {[dateLabel(a.date), !a.endTimeZone && zoneLabel(a), timeHint]
                          .filter(Boolean)
                          .join(' · ')}
                      </small>
                    </>
                  ) : (
                    <strong>
                      {dateLabel(a.date)} · {zoneLabel(a)}
                    </strong>
                  )}
                </dd>
              </div>
              {destination && (
                <div>
                  <dt>
                    <MapPin size={19} /> Local
                  </dt>
                  <dd>{destination}</dd>
                </div>
              )}
              {a.openingHours && (
                <div>
                  <dt>
                    <Clock3 size={18} /> Funcionamento
                  </dt>
                  <dd>{a.openingHours}</dd>
                </div>
              )}
              {a.price !== null && (
                <div>
                  <dt>
                    <Ticket size={18} /> Preço
                  </dt>
                  <dd>
                    <strong>
                      {a.price === 0 && !a.priceMax ? 'Gratuito' : moneyRange(a.price, a.priceMax)}
                    </strong>
                    {a.priceCertainty !== 'Não informado' && <small>{a.priceCertainty}</small>}
                  </dd>
                </div>
              )}
              {showDuration && (
                <div>
                  <dt>
                    <Hourglass size={18} /> Duração
                  </dt>
                  <dd>{a.duration} min</dd>
                </div>
              )}
            </dl>
            {a.timeNote && a.timeNote.trim() !== a.description.trim() && (
              <p className="detail-time-note">{a.timeNote}</p>
            )}
            {destination && (
              <div className="detail-navigation">
                <a
                  className="button detail-map-button"
                  href={mapsLink(destination)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation size={19} /> Ir no mapa
                </a>
                {hasRoute && (
                  <a
                    className="button secondary"
                    href={mapsLink(destination, directionMode, origin)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Route size={18} /> Traçar rota
                  </a>
                )}
              </div>
            )}
          </section>
          <ActivityDocuments key={a.id} activity={a} />
          {a.description && (
            <section className="card detail-section">
              <h3>Orientações</h3>
              <p className="detail-description">{a.description}</p>
            </section>
          )}
        </div>
        <div className="activity-detail-secondary">
          <TransportDetails activity={a} card />
          {links.length > 0 && (
            <section className="card detail-section">
              <h3>Links</h3>
              <div className="detail-external-links">
                {links.map(({ url, label }) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    {label} ↗
                  </a>
                ))}
              </div>
            </section>
          )}
          {a.notes && (
            <section className="card detail-section">
              <h3>Observações pessoais</h3>
              <p className="detail-description">{a.notes}</p>
            </section>
          )}
          {(photo || photoSource) && (
            <figure className="card detail-section detail-photo">
              <div className="detail-hero">
                {photo ? (
                  <LocalImage blob={photo.blob} alt={`Fotografia de ${a.title}`} />
                ) : (
                  <img src={photoSource} alt={placePhoto?.alt ?? 'Acrópole de Atenas e Partenon'} />
                )}
              </div>
              {!photo && placePhoto && (
                <figcaption className="detail-photo-credit">
                  {placePhoto.author} ·{' '}
                  <a href={placePhoto.source} target="_blank" rel="noreferrer">
                    Original
                  </a>{' '}
                  ·{' '}
                  <a href={placePhoto.licenseUrl} target="_blank" rel="noreferrer">
                    {placePhoto.license}
                  </a>
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </div>
      <div className="detail-visit-actions">
        <button
          className={`button ${a.completed ? 'secondary' : ''}`}
          disabled={store.busy}
          onClick={() => toggle('completed')}
          aria-pressed={a.completed}
        >
          <Check size={18} /> {a.completed ? 'Desmarcar visita' : 'Concluir visita'}
        </button>
        <button className="button secondary" onClick={onEdit} aria-label={`Editar ${a.title}`}>
          <Edit3 size={17} /> Editar
        </button>
      </div>
    </section>
  );
}

export function TransportDetails({
  activity: a,
  card = false,
}: {
  activity: Activity;
  card?: boolean;
}) {
  const t = a.transport;
  const direction = [t.origin, t.destination].filter(Boolean).join(' → ');
  const station = [...new Set([t.lines, t.station].filter(Boolean))].join(' · ');
  const time =
    t.minutes === null
      ? ''
      : `${t.minutes}${t.minutesMax != null && t.minutesMax !== t.minutes ? `–${t.minutesMax}` : ''} min`;
  const price = t.price !== null && (!card || t.price !== a.price) ? euro(t.price) : '';
  const facts = [
    ['Meio', t.mode === 'Não informado' ? '' : t.mode],
    ['Trajeto', direction],
    ['Linha ou estação', station],
    ['Tempo', time && `${time}${t.certainty === 'Estimativa' ? ' estimados' : ''}`],
    ['Tarifa', price],
  ].filter(([, value]) => value);
  if (!facts.length && !t.notes) return null;
  return (
    <div className={card ? 'card detail-section transport-detail' : 'transport-detail'}>
      <h4>
        <TrainFront size={16} /> Deslocamento
      </h4>
      {facts.length > 0 && (
        <dl className="detail-grid">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {t.notes && <p className="detail-description">{t.notes}</p>}
    </div>
  );
}
