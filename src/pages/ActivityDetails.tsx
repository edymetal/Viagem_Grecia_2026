import {
  ArrowLeft,
  Check,
  Clock3,
  Edit3,
  Flag,
  Heart,
  Hourglass,
  ImageOff,
  MapPin,
  Navigation,
  Ticket,
  TrainFront,
} from 'lucide-react';
import type { Activity } from '../data/schema';
import type { TravelStore } from '../hooks/useTravel';
import { dateLabel, euro, mapDestination, mapsLink, moneyRange, zoneLabel } from '../lib/domain';
import { itineraryHref } from '../lib/itineraryRoute';
import { ActivityVisual, parthenonPhoto } from '../components/ActivityVisual';
import { LocalImage, MapsLinks } from '../components/ui';

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
          <div className={`detail-hero ${!photo && a.id !== 'plan-2-11' ? 'without-photo' : ''}`}>
            {photo ? (
              <LocalImage blob={photo.blob} alt={`Fotografia de ${a.title}`} />
            ) : a.id === 'plan-2-11' ? (
              <img src={parthenonPhoto} alt="Acrópole de Atenas e Partenon" />
            ) : (
              <>
                <ActivityVisual activity={a} />
                <span>
                  <ImageOff size={13} /> Sem foto adicionada
                </span>
              </>
            )}
          </div>
          <h2 className="detail-name">{a.title}</h2>
          {destination ? (
            <p className="detail-location">
              <MapPin size={18} /> {destination}
            </p>
          ) : (
            <p className="small muted">Localização não informada</p>
          )}
          <div className="detail-status">
            <span className="badge">{a.confirmation}</span>
            {a.timeCertainty && (
              <span className="badge neutral">
                Horário {a.timeCertainty.toLocaleLowerCase('pt-BR')}
              </span>
            )}
            {a.required && (
              <span className="badge warm">
                <Flag size={12} /> Obrigatória
              </span>
            )}
            {a.completed && (
              <span className="badge">
                <Check size={12} /> Concluída
              </span>
            )}
          </div>
          <dl className="visit-facts">
            <div>
              <dt>
                <Ticket size={19} /> Preço / ingresso
              </dt>
              <dd>
                <strong>
                  {a.price === null ? 'Não informado' : moneyRange(a.price, a.priceMax)}
                </strong>
                {a.price !== null && <small>{a.priceCertainty}</small>}
              </dd>
            </div>
            <div>
              <dt>
                <Clock3 size={19} /> Sua programação
              </dt>
              <dd>
                <strong>
                  {a.start || 'A definir'}
                  {a.end && ` – ${a.end}`}
                </strong>
                <small>
                  {dateLabel(a.date)} · {zoneLabel(a)}
                </small>
              </dd>
            </div>
            <div>
              <dt>
                <Clock3 size={19} /> Funcionamento
              </dt>
              <dd>{a.openingHours || 'Não informado'}</dd>
            </div>
            <div>
              <dt>
                <Hourglass size={19} /> Duração estimada
              </dt>
              <dd>{a.duration === null ? 'Não informada' : `${a.duration} min`}</dd>
            </div>
          </dl>
          {a.timeNote && <p className="small muted detail-time-note">{a.timeNote}</p>}
          {destination && (
            <>
              <a
                className="button detail-map-button"
                href={mapsLink(destination)}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation size={21} fill="currentColor" /> Ir no mapa
              </a>
              <MapsLinks address={destination} origin={a.transport.origin} />
              <p className="small muted internet-note">Google Maps e rotas precisam de internet.</p>
            </>
          )}
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
        </div>
        <div className="activity-detail-secondary">
          {a.description && (
            <section className="card detail-section">
              <h3>Sobre a atividade</h3>
              <p className="detail-description">{a.description}</p>
            </section>
          )}
          <section className="card detail-section">
            <TransportDetails activity={a} />
          </section>
          {(a.website || a.ticketUrl || a.guideUrl) && (
            <section className="card detail-section">
              <h3>Links e ingressos</h3>
              <div className="detail-external-links">
                {a.website && (
                  <a href={a.website} target="_blank" rel="noreferrer">
                    Site oficial ↗
                  </a>
                )}
                {a.ticketUrl && (
                  <a href={a.ticketUrl} target="_blank" rel="noreferrer">
                    Comprar ingresso ↗
                  </a>
                )}
                {a.guideUrl && (
                  <a href={a.guideUrl} target="_blank" rel="noreferrer">
                    Reservar somente guia ↗
                  </a>
                )}
              </div>
              <p className="small muted">
                Requer internet. Consulte a disponibilidade antes de comprar.
              </p>
            </section>
          )}
          <section className="card detail-section">
            <div className="card-heading">
              <h3>Observações pessoais</h3>
              <button className="icon-button" onClick={onEdit} aria-label="Editar observações">
                <Edit3 size={18} />
              </button>
            </div>
            <p className="notes">{a.notes || 'Nenhuma observação adicionada.'}</p>
          </section>
        </div>
      </div>
    </section>
  );
}

export function TransportDetails({ activity: a }: { activity: Activity }) {
  const t = a.transport;
  return (
    <div className="transport-detail">
      <h4>
        <TrainFront size={16} /> Deslocamento
      </h4>
      <dl className="detail-grid">
        <div>
          <dt>Transporte</dt>
          <dd>{t.mode}</dd>
        </div>
        <div>
          <dt>Origem → destino</dt>
          <dd>
            {t.origin || 'A informar'} → {t.destination || a.address || 'A informar'}
          </dd>
        </div>
        <div>
          <dt>Estação / linhas</dt>
          <dd>
            {t.station || 'A informar'} / {t.lines || 'A informar'}
          </dd>
        </div>
        <div>
          <dt>Tempo / valor</dt>
          <dd>
            {t.minutes === null
              ? 'A informar'
              : `${t.minutes}${t.minutesMax != null && t.minutesMax !== t.minutes ? `–${t.minutesMax}` : ''} min`}
            {' · '}
            {t.price === null ? 'A informar' : euro(t.price)}
            {t.certainty !== 'Não informado' && ` (${t.certainty})`}
          </dd>
        </div>
      </dl>
      {t.notes && <p className="notes">{t.notes}</p>}
    </div>
  );
}
