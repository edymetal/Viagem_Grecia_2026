import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronRight,
  Edit3,
  Flag,
  Heart,
  Plus,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import type { Activity } from '../data/schema';
import { activitySchema, tripDates } from '../data/schema';
import { emptyActivity } from '../data/initial';
import type { TravelStore } from '../hooks/useTravel';
import { athensNow, conflicts, dateLabel, euro, zoneLabel } from '../lib/domain';
import { itineraryHref, itineraryRoute } from '../lib/itineraryRoute';
import { PlanningNotice } from '../components/Planning';
import { ActivityVisual } from '../components/ActivityVisual';
import { ActivityDetails } from './ActivityDetails';
import {
  AsyncForm,
  Empty,
  Field,
  LocalImage,
  Modal,
  optionalNumber,
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
            timeZone: value(f, 'timeZone'),
            timeCertainty: value(f, 'timeCertainty'),
            timeNote: value(f, 'timeNote'),
            location: value(f, 'location'),
            description: value(f, 'description'),
            address: value(f, 'address'),
            price: optionalNumber(f, 'price'),
            priceMax: optionalNumber(f, 'priceMax'),
            priceCertainty: value(f, 'priceCertainty'),
            duration: optionalNumber(f, 'duration'),
            openingHours: value(f, 'openingHours'),
            website: value(f, 'website'),
            ticketUrl: value(f, 'ticketUrl'),
            guideUrl: value(f, 'guideUrl'),
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
              minutesMax: optionalNumber(f, 'minutesMax'),
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
              <option>Planejada</option>
              <option>Confirmada</option>
            </select>
          </Field>
          <Field label="Início · horário local">
            <input type="time" name="start" defaultValue={a.start} />
          </Field>
          <Field label="Fuso dos horários">
            <select name="timeZone" defaultValue={a.timeZone || 'Europe/Athens'}>
              <option value="Europe/Athens">Atenas · Europe/Athens</option>
              <option value="Europe/Rome">Itália · Europe/Rome</option>
            </select>
          </Field>
          <Field label="Natureza dos horários">
            <select name="timeCertainty" defaultValue={a.timeCertainty || 'Planejado'}>
              {['Planejado', 'Consultado', 'Estimativa', 'Proposto'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Observação do horário" wide>
            <input name="timeNote" defaultValue={a.timeNote} maxLength={10000} />
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
          <Field label="Local para buscar no mapa (se endereço não informado)" wide>
            <input name="location" defaultValue={a.location} maxLength={10000} />
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
              <option>Consultado</option>
              <option>Estimativa</option>
            </select>
          </Field>
          <Field label="Preço máximo (€), somente se for uma faixa">
            <input
              name="priceMax"
              type="number"
              step="0.01"
              min="0"
              max="1000000"
              defaultValue={a.priceMax ?? ''}
            />
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
          <Field label="Link para reservar somente o guia" wide>
            <input name="guideUrl" type="url" defaultValue={a.guideUrl} placeholder="https://" />
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
              {[
                'Não informado',
                'A pé',
                'Metrô',
                'Trem',
                'Avião',
                'Transporte público',
                'Outro',
              ].map((m) => (
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
          <Field label="Tempo máximo de deslocamento (min), se faixa">
            <input
              name="minutesMax"
              type="number"
              min="0"
              max="1440"
              defaultValue={a.transport.minutesMax ?? ''}
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
export function Itinerary({ store, now, route }: { store: TravelStore; now: Date; route: string }) {
  const state = store.state!;
  const [initialDay] = useState(() => {
    const requested = sessionStorage.getItem('selected-day');
    sessionStorage.removeItem('selected-day');
    return (
      state.days.find((d) => d.date === requested)?.date ||
      state.days.find((d) => d.date === athensNow(now).date)?.date ||
      tripDates[0]
    );
  });
  const { day: routeDay, activityId } = itineraryRoute(route);
  const day = routeDay || initialDay;
  const selected = state.activities.find((a) => a.id === activityId);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [removing, setRemoving] = useState<Activity | null>(null);
  const [dayNotes, setDayNotes] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const lastOpened = useRef('');
  const activities = state.activities.filter((a) => a.date === day);
  const visible = favoritesOnly ? activities.filter((a) => a.favorite) : activities;
  const warnings = conflicts(activities);
  const dayIndex = state.days.findIndex((d) => d.date === day);
  const act = (fn: Parameters<TravelStore['update']>[0]) => {
    void store.update(fn).catch(() => undefined);
  };
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (activityId) {
        lastOpened.current = activityId;
        document.querySelector<HTMLElement>('.activity-screen h1')?.focus();
      } else if (lastOpened.current) {
        document.getElementById(`open-${lastOpened.current}`)?.focus();
        lastOpened.current = '';
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [activityId]);
  const setDay = (date: string) => {
    location.hash = itineraryHref(date);
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
      {selected ? (
        <ActivityDetails activity={selected} store={store} onEdit={() => setEditing(selected)} />
      ) : (
        <section className="itinerary-screen">
          <header className="route-heading">
            <a href="#inicio" className="icon-button" aria-label="Voltar ao início">
              <ArrowLeft size={23} />
            </a>
            <h1>Roteiro</h1>
            <button
              className="icon-button"
              aria-label="Escolher dia do roteiro"
              onClick={() => setCalendar(true)}
            >
              <CalendarDays size={23} />
            </button>
          </header>
          {activityId && (
            <p className="notice" role="status">
              Atividade não encontrada. Escolha uma atividade do roteiro.
            </p>
          )}
          <div className="day-tabs compact-day-tabs" role="tablist" aria-label="Dias da viagem">
            {state.days.map((d, i) => (
              <button
                role="tab"
                id={`day-${d.date}`}
                aria-controls="day-panel"
                aria-selected={d.date === day}
                tabIndex={d.date === day ? 0 : -1}
                key={d.date}
                className={d.date === day ? 'active' : ''}
                onClick={() => setDay(d.date)}
                onKeyDown={(e) => {
                  let next = i;
                  if (e.key === 'ArrowRight') next = (i + 1) % state.days.length;
                  else if (e.key === 'ArrowLeft')
                    next = (i + state.days.length - 1) % state.days.length;
                  else if (e.key === 'Home') next = 0;
                  else if (e.key === 'End') next = state.days.length - 1;
                  else return;
                  e.preventDefault();
                  setDay(state.days[next].date);
                  document.getElementById(`day-${state.days[next].date}`)?.focus();
                }}
              >
                <strong>Dia {i + 1}</strong>
                <span>{dateLabel(d.date)}</span>
                <small>
                  {athensNow(now).date === d.date
                    ? 'Hoje'
                    : dateLabel(d.date, { weekday: 'short' })}
                </small>
              </button>
            ))}
          </div>
          <div id="day-panel" role="tabpanel" aria-labelledby={`day-${day}`}>
            <div className="day-section-heading">
              <h2>
                Dia {dayIndex + 1} · {dateLabel(day, { weekday: 'long' })}
              </h2>
              <span>
                {activities.filter((a) => a.completed).length}/{activities.length} concluídas
              </span>
            </div>
            <div className="itinerary-tools">
              <button
                className={`text-button ${favoritesOnly ? 'selected-tool' : ''}`}
                aria-pressed={favoritesOnly}
                onClick={() => setFavoritesOnly(!favoritesOnly)}
              >
                <Heart size={16} fill={favoritesOnly ? 'currentColor' : 'none'} /> Favoritos
              </button>
              <button
                className="text-button"
                aria-pressed={organizing}
                onClick={() => setOrganizing(!organizing)}
              >
                <SlidersHorizontal size={16} /> {organizing ? 'Finalizar organização' : 'Organizar'}
              </button>
              <button className="text-button" onClick={() => setEditing(emptyActivity(day))}>
                <Plus size={17} /> Nova atividade
              </button>
            </div>
            {warnings.length > 0 && (
              <details className="notice warning schedule-warning">
                <summary>Revise os horários</summary>
                {warnings.map((w) => (
                  <p key={w}>{w}</p>
                ))}
              </details>
            )}
            {visible.length === 0 ? (
              <section className="card">
                <Empty
                  title={favoritesOnly ? 'Nenhum favorito neste dia' : 'Um dia de possibilidades'}
                  action={
                    !favoritesOnly && (
                      <button
                        className="button secondary"
                        onClick={() => setEditing(emptyActivity(day))}
                      >
                        <Plus size={17} /> Adicionar primeira atividade
                      </button>
                    )
                  }
                >
                  {favoritesOnly
                    ? 'Toque no coração nos detalhes de uma atividade para salvá-la aqui.'
                    : 'Nenhuma atividade neste dia. Adicione uma atividade quando quiser.'}
                </Empty>
              </section>
            ) : (
              <div className="timeline compact-timeline">
                {visible.map((a) => {
                  const i = activities.findIndex((x) => x.id === a.id);
                  const photo = store.documents.find(
                    (d) => d.id === a.photoDocumentId && d.type.startsWith('image/'),
                  );
                  return (
                    <article
                      className={`activity compact-activity ${a.completed ? 'completed' : ''}`}
                      key={a.id}
                    >
                      <a
                        className="timeline-row"
                        id={`open-${a.id}`}
                        href={itineraryHref(day, a.id)}
                        aria-label={`Ver detalhes: ${a.title}`}
                      >
                        <span className="activity-time">
                          <strong>{a.start || 'A definir'}</strong>
                          {a.end && <small>até {a.end}</small>}
                          <small>{zoneLabel(a)}</small>
                        </span>
                        {photo ? (
                          <LocalImage blob={photo.blob} alt="" className="activity-thumb" />
                        ) : (
                          <ActivityVisual activity={a} />
                        )}
                        <div className="timeline-identity">
                          <h3>{a.title}</h3>
                          <div className="timeline-meta">
                            <span>{a.confirmation}</span>
                            {a.timeCertainty && a.timeCertainty !== 'Planejado' && (
                              <span>{a.timeCertainty}</span>
                            )}
                            {a.required && (
                              <span className="required-mark">
                                <Flag size={10} />
                                Obrigatória
                              </span>
                            )}
                            {a.completed && (
                              <span>
                                <Check size={11} />
                                Concluída
                              </span>
                            )}
                          </div>
                        </div>
                        {a.favorite && (
                          <Heart
                            size={13}
                            className="row-favorite"
                            fill="currentColor"
                            aria-label="Favorita"
                          />
                        )}
                        <ChevronRight className="row-chevron" size={18} />
                      </a>
                      {organizing && (
                        <div className="organize-actions">
                          <button
                            className="icon-button"
                            aria-label={`Editar ${a.title}`}
                            onClick={() => setEditing(a)}
                          >
                            <Edit3 size={17} />
                          </button>
                          <button
                            className="icon-button"
                            disabled={i === 0 || store.busy || favoritesOnly}
                            aria-label={`Mover ${a.title} para cima`}
                            onClick={() => move(a.id, -1)}
                          >
                            <ArrowUp size={17} />
                          </button>
                          <button
                            className="icon-button"
                            disabled={i === activities.length - 1 || store.busy || favoritesOnly}
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
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          {organizing && favoritesOnly && (
            <p className="small muted">
              Desative o filtro Favoritos para reordenar o dia completo.
            </p>
          )}
          <PlanningNotice store={store} />
          {!!state.alternatives?.length && (
            <section className="card alternatives">
              <h2>Alternativas para acrescentar ou trocar</h2>
              <p className="small muted">
                Ficam fora da linha do tempo e dos gastos até você escolher. Revise o bloco a
                substituir e a despesa correspondente.
              </p>
              {state.alternatives.map((a) => (
                <article key={a.id}>
                  <h3>{a.title}</h3>
                  <p>{a.description}</p>
                  <p className="muted small">
                    {a.notes}{' '}
                    {a.price === null
                      ? 'Sem preço adicional informado.'
                      : `Ingresso: ${euro(a.price)}.`}
                  </p>
                  <button
                    className="text-button"
                    onClick={() =>
                      setEditing({
                        ...emptyActivity(day),
                        title: a.title,
                        description: a.description,
                        notes: a.notes,
                        price: a.price,
                        priceCertainty: a.price === null ? 'Não informado' : 'Consultado',
                        location: a.location,
                        website: a.website,
                        ticketUrl: a.ticketUrl,
                      })
                    }
                  >
                    <Plus size={15} />
                    Preparar para {dateLabel(day)}
                  </button>
                </article>
              ))}
            </section>
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
        </section>
      )}
      {calendar && (
        <Modal title="Escolher dia do roteiro" onClose={() => setCalendar(false)}>
          <p className="muted small">Atenas · 20 a 23 de novembro de 2026</p>
          <div className="trip-date-picker">
            {state.days.map((d, i) => (
              <button
                key={d.date}
                className="button secondary"
                aria-pressed={d.date === day}
                onClick={() => {
                  setDay(d.date);
                  setCalendar(false);
                }}
              >
                <CalendarDays size={19} />
                <span>
                  Dia {i + 1} ·{' '}
                  {dateLabel(d.date, { day: '2-digit', month: 'long', weekday: 'long' })}
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </Modal>
      )}
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
