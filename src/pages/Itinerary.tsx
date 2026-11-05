import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock3,
  Edit3,
  Flag,
  MapPin,
  Plus,
  Trash2,
  TrainFront,
} from 'lucide-react';
import type { Activity } from '../data/schema';
import { activitySchema, tripDates } from '../data/schema';
import { emptyActivity } from '../data/initial';
import type { TravelStore } from '../hooks/useTravel';
import { athensNow, conflicts, dateLabel, euro } from '../lib/domain';
import {
  AsyncForm,
  Empty,
  Field,
  LocalImage,
  MapsLinks,
  Modal,
  optionalNumber,
  PageHeading,
  ValidationError,
  value,
} from '../components/ui';

export function ActivityEditor({
  activity: a,
  store,
  onClose,
}: {
  activity: Activity;
  store: TravelStore;
  onClose: () => void;
}) {
  return (
    <Modal
      title={
        store.state!.activities.some((x) => x.id === a.id) ? 'Editar atividade' : 'Nova atividade'
      }
      onClose={onClose}
    >
      <AsyncForm
        onSave={async (f) => {
          const candidate = {
            ...a,
            date: value(f, 'date'),
            title: value(f, 'title'),
            start: value(f, 'start'),
            end: value(f, 'end'),
            description: value(f, 'description'),
            address: value(f, 'address'),
            price: optionalNumber(f, 'price'),
            priceCertainty: value(f, 'priceCertainty'),
            duration: optionalNumber(f, 'duration'),
            openingHours: value(f, 'openingHours'),
            website: value(f, 'website'),
            ticketUrl: value(f, 'ticketUrl'),
            notes: value(f, 'notes'),
            required: f.has('required'),
            confirmation: value(f, 'confirmation'),
            photoDocumentId: value(f, 'photoDocumentId') || null,
            transport: {
              mode: value(f, 'mode'),
              origin: value(f, 'origin'),
              destination: value(f, 'destination'),
              station: value(f, 'station'),
              lines: value(f, 'lines'),
              minutes: optionalNumber(f, 'minutes'),
              price: optionalNumber(f, 'transportPrice'),
              certainty: value(f, 'certainty'),
              notes: value(f, 'transportNotes'),
            },
          };
          const parsed = activitySchema.safeParse(candidate);
          if (!parsed.success) throw ValidationError(parsed.error);
          await store.update((s) => {
            const index = s.activities.findIndex((x) => x.id === a.id);
            if (index < 0) s.activities.push(parsed.data);
            else s.activities[index] = parsed.data;
            return s;
          });
          onClose();
        }}
      >
        <div className="form-grid">
          <Field label="Nome da atividade *" wide>
            <input name="title" defaultValue={a.title} required maxLength={200} />
          </Field>
          <Field label="Dia">
            <select name="date" defaultValue={a.date}>
              {tripDates.map((d) => (
                <option key={d} value={d}>
                  {dateLabel(d, { day: '2-digit', month: '2-digit', weekday: 'long' })}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Confirmação">
            <select name="confirmation" defaultValue={a.confirmation}>
              <option>Sugestão</option>
              <option>Confirmada</option>
            </select>
          </Field>
          <Field label="Início · horário de Atenas">
            <input type="time" name="start" defaultValue={a.start} />
          </Field>
          <Field label="Término · mesmo dia">
            <input type="time" name="end" defaultValue={a.end} />
          </Field>
          <Field label="Descrição" wide>
            <textarea name="description" defaultValue={a.description} />
          </Field>
          <Field label="Endereço" wide>
            <input name="address" defaultValue={a.address} />
          </Field>
          <Field label="Preço (€)">
            <input
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              name="price"
              defaultValue={a.price ?? ''}
            />
          </Field>
          <Field label="Natureza do preço">
            <select name="priceCertainty" defaultValue={a.priceCertainty}>
              <option>Não informado</option>
              <option>Confirmado</option>
              <option>Estimativa</option>
            </select>
          </Field>
          <Field label="Duração estimada (min)">
            <input
              type="number"
              min="0"
              max="1440"
              name="duration"
              defaultValue={a.duration ?? ''}
            />
          </Field>
          <Field label="Horário de funcionamento">
            <input name="openingHours" defaultValue={a.openingHours} />
          </Field>
          <Field label="Site oficial">
            <input type="url" name="website" defaultValue={a.website} placeholder="https://" />
          </Field>
          <Field label="Link de ingresso">
            <input type="url" name="ticketUrl" defaultValue={a.ticketUrl} placeholder="https://" />
          </Field>
          <Field label="Fotografia local (adicione em Documentos)" wide>
            <select name="photoDocumentId" defaultValue={a.photoDocumentId || ''}>
              <option value="">Sem fotografia</option>
              {store.documents
                .filter((d) => d.type.startsWith('image/'))
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </Field>
          <label className="check-label wide">
            <input type="checkbox" name="required" defaultChecked={a.required} />
            Atividade obrigatória
          </label>
          <h3 className="wide form-section">Deslocamento informado no cronograma</h3>
          <Field label="Meio de transporte">
            <select name="mode" defaultValue={a.transport.mode}>
              {['Não informado', 'A pé', 'Metrô', 'Transporte público', 'Outro'].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Estação mais próxima">
            <input name="station" defaultValue={a.transport.station} />
          </Field>
          <Field label="Origem">
            <input name="origin" defaultValue={a.transport.origin} />
          </Field>
          <Field label="Destino">
            <input name="destination" defaultValue={a.transport.destination} />
          </Field>
          <Field label="Linhas utilizadas">
            <input name="lines" defaultValue={a.transport.lines} />
          </Field>
          <Field label="Tempo de deslocamento (min)">
            <input
              type="number"
              name="minutes"
              min="0"
              max="1440"
              defaultValue={a.transport.minutes ?? ''}
            />
          </Field>
          <Field label="Valor do transporte (€)">
            <input
              type="number"
              name="transportPrice"
              min="0"
              max="1000000"
              step="0.01"
              defaultValue={a.transport.price ?? ''}
            />
          </Field>
          <Field label="Natureza do transporte">
            <select name="certainty" defaultValue={a.transport.certainty}>
              <option>Não informado</option>
              <option>Confirmado</option>
              <option>Estimativa</option>
            </select>
          </Field>
          <Field label="Observações do transporte" wide>
            <textarea name="transportNotes" defaultValue={a.transport.notes} />
          </Field>
          <Field label="Observações pessoais" wide>
            <textarea name="notes" defaultValue={a.notes} />
          </Field>
        </div>
      </AsyncForm>
    </Modal>
  );
}
export function Itinerary({ store, now }: { store: TravelStore; now: Date }) {
  const state = store.state!;
  const [day, setDay] = useState(() => {
    const requested = sessionStorage.getItem('selected-day');
    sessionStorage.removeItem('selected-day');
    return (
      state.days.find((d) => d.date === requested)?.date ||
      state.days.find((d) => d.date === athensNow(now).date)?.date ||
      tripDates[0]
    );
  });
  const [editing, setEditing] = useState<Activity | null>(null);
  const [removing, setRemoving] = useState<Activity | null>(null);
  const [dayNotes, setDayNotes] = useState(false);
  const activities = state.activities.filter((a) => a.date === day);
  const warnings = conflicts(activities);
  const act = (fn: Parameters<TravelStore['update']>[0]) => {
    void store.update(fn).catch(() => undefined);
  };
  const move = (id: string, delta: number) =>
    act((s) => {
      const list = s.activities.filter((a) => a.date === day);
      const i = list.findIndex((a) => a.id === id);
      const left = s.activities.findIndex((a) => a.id === id);
      const right = s.activities.findIndex((a) => a.id === list[i + delta]?.id);
      if (right >= 0)
        [s.activities[left], s.activities[right]] = [s.activities[right], s.activities[left]];
      return s;
    });
  return (
    <>
      <PageHeading
        eyebrow="CADA DIA, UMA DESCOBERTA"
        title="Meu roteiro"
        description="Quatro dias para viver Atenas. Organize tudo no seu ritmo."
        action={
          <button className="button" onClick={() => setEditing(emptyActivity(day))}>
            <Plus size={18} />
            Nova atividade
          </button>
        }
      />
      <div className="day-tabs" role="tablist" aria-label="Dias da viagem">
        {state.days.map((d, i) => (
          <button
            role="tab"
            aria-selected={d.date === day}
            key={d.date}
            className={d.date === day ? 'active' : ''}
            onClick={() => setDay(d.date)}
          >
            <span>
              DIA 0{i + 1}
              {athensNow(now).date === d.date ? ' · HOJE' : ''}
            </span>
            <strong>{dateLabel(d.date, { day: '2-digit', month: '2-digit' })}</strong>
            <small>{dateLabel(d.date, { weekday: 'long' })}</small>
          </button>
        ))}
      </div>
      <div className="section-title">
        <h2>
          {dateLabel(day, { weekday: 'long' })}
          <span className="count-badge">{activities.length}</span>
        </h2>
        <span className="small muted">Europe/Athens</span>
      </div>
      {warnings.length > 0 && (
        <div className="notice warning" role="status">
          <strong>Revise os horários</strong>
          {warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      )}
      {activities.length === 0 ? (
        <section className="card">
          <Empty
            title="Um dia de possibilidades"
            action={
              <button className="button secondary" onClick={() => setEditing(emptyActivity(day))}>
                <Plus size={17} />
                Adicionar primeira atividade
              </button>
            }
          >
            O cronograma definitivo será adicionado depois. Nenhum horário, reserva ou preço foi
            preenchido.
          </Empty>
        </section>
      ) : (
        <div className="timeline">
          {activities.map((a, i) => (
            <article className={`activity card ${a.completed ? 'completed' : ''}`} key={a.id}>
              <div className="activity-time">
                <Clock3 size={15} />
                <strong>{a.start || 'A definir'}</strong>
                {a.end && <small>até {a.end}</small>}
              </div>
              <div className="activity-main">
                <div className="activity-badges">
                  <span className={`badge ${a.confirmation === 'Sugestão' ? 'neutral' : ''}`}>
                    {a.confirmation}
                  </span>
                  {a.required && (
                    <span className="badge warm">
                      <Flag size={12} />
                      Obrigatória
                    </span>
                  )}
                  {a.completed && (
                    <span className="badge">
                      <Check size={12} />
                      Concluída
                    </span>
                  )}
                </div>
                <h3>{a.title}</h3>
                {a.address && (
                  <p className="muted small inline">
                    <MapPin size={14} />
                    {a.address}
                  </p>
                )}
                {a.description && <p>{a.description}</p>}
                <details>
                  <summary>Detalhes, transporte e observações</summary>
                  <div className="activity-details">
                    {a.photoDocumentId &&
                      store.documents.find((d) => d.id === a.photoDocumentId) && (
                        <LocalImage
                          blob={store.documents.find((d) => d.id === a.photoDocumentId)!.blob}
                          alt={`Fotografia de ${a.title}`}
                          className="activity-photo"
                        />
                      )}
                    <dl className="detail-grid">
                      <div>
                        <dt>Preço</dt>
                        <dd>
                          {a.price === null
                            ? 'Não informado'
                            : `${euro(a.price)} · ${a.priceCertainty}`}
                        </dd>
                      </div>
                      <div>
                        <dt>Duração estimada</dt>
                        <dd>{a.duration === null ? 'Não informada' : `${a.duration} min`}</dd>
                      </div>
                      <div>
                        <dt>Funcionamento</dt>
                        <dd>{a.openingHours || 'Não informado'}</dd>
                      </div>
                    </dl>
                    <TransportDetails activity={a} />
                    <MapsLinks
                      address={a.address || a.transport.destination}
                      origin={a.transport.origin}
                    />
                    {(a.website || a.ticketUrl) && (
                      <p className="external-links">
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
                        <small>Requer internet</small>
                      </p>
                    )}
                    <p className="notes">
                      {a.notes || 'Nenhuma observação. Use Editar para adicionar.'}
                    </p>
                  </div>
                </details>
                <div className="activity-actions">
                  <button
                    className={`button small-button ${a.completed ? 'secondary' : ''}`}
                    disabled={store.busy}
                    onClick={() =>
                      act((s) => {
                        s.activities.find((x) => x.id === a.id)!.completed = !a.completed;
                        return s;
                      })
                    }
                  >
                    <Check size={15} />
                    {a.completed ? 'Desmarcar visita' : 'Concluir visita'}
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Editar ${a.title}`}
                    onClick={() => setEditing(a)}
                  >
                    <Edit3 size={17} />
                  </button>
                  <button
                    className="icon-button"
                    disabled={i === 0 || store.busy}
                    aria-label={`Mover ${a.title} para cima`}
                    onClick={() => move(a.id, -1)}
                  >
                    <ArrowUp size={17} />
                  </button>
                  <button
                    className="icon-button"
                    disabled={i === activities.length - 1 || store.busy}
                    aria-label={`Mover ${a.title} para baixo`}
                    onClick={() => move(a.id, 1)}
                  >
                    <ArrowDown size={17} />
                  </button>
                  {!a.required && (
                    <button
                      className="icon-button danger"
                      aria-label={`Excluir ${a.title}`}
                      onClick={() => setRemoving(a)}
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <section className="card day-notes">
        <div>
          <h3>Anotações do dia</h3>
          <p className="muted notes">
            {state.days.find((d) => d.date === day)!.notes ||
              'Um espaço para suas ideias e lembretes.'}
          </p>
        </div>
        <button className="button secondary" onClick={() => setDayNotes(true)}>
          <Edit3 size={16} />
          Editar
        </button>
      </section>
      {editing && (
        <ActivityEditor activity={editing} store={store} onClose={() => setEditing(null)} />
      )}
      {dayNotes && (
        <Modal title="Anotações do dia" onClose={() => setDayNotes(false)}>
          <AsyncForm
            onSave={async (f) => {
              await store.update((s) => {
                s.days.find((d) => d.date === day)!.notes = value(f, 'notes');
                return s;
              });
              setDayNotes(false);
            }}
          >
            <Field label="Suas observações">
              <textarea
                name="notes"
                defaultValue={state.days.find((d) => d.date === day)!.notes}
                maxLength={10000}
              />
            </Field>
          </AsyncForm>
        </Modal>
      )}
      {removing && (
        <Modal title="Excluir atividade opcional?" onClose={() => setRemoving(null)}>
          <p>“{removing.title}” será removida deste dispositivo.</p>
          <AsyncForm
            label="Excluir atividade"
            onSave={async () => {
              await store.update((s) => ({
                ...s,
                activities: s.activities.filter((a) => a.id !== removing.id),
              }));
              setRemoving(null);
            }}
          >
            <p className="muted">Você pode exportar um backup antes de excluir.</p>
          </AsyncForm>
        </Modal>
      )}
    </>
  );
}
export function TransportDetails({ activity: a }: { activity: Activity }) {
  const t = a.transport;
  return (
    <div className="transport-detail">
      <h4>
        <TrainFront size={16} />
        Deslocamento
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
            {t.minutes === null ? 'A informar' : `${t.minutes} min`} ·{' '}
            {t.price === null ? 'A informar' : euro(t.price)}
            {t.certainty !== 'Não informado' && ` (${t.certainty})`}
          </dd>
        </div>
      </dl>
      {t.notes && <p className="notes">{t.notes}</p>}
    </div>
  );
}
