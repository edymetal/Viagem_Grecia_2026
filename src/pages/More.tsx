import { useState } from 'react';
import {
  Archive,
  Check,
  ChevronRight,
  ClipboardCheck,
  Edit3,
  FileText,
  Hotel,
  Info,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react';
import type { AppState, Preferences } from '../data/schema';
import type { TravelStore } from '../hooks/useTravel';
import { AsyncForm, Empty, Field, MapsLinks, Modal, PageHeading, value } from '../components/ui';
import { Documents } from './Documents';
import { BackupPage } from './Backup';

const menu = [
  {
    id: 'documentos',
    label: 'Documentos',
    icon: FileText,
    description: 'Passagens, ingressos e arquivos offline',
  },
  {
    id: 'hotel',
    label: 'Hotel e reservas',
    icon: Hotel,
    description: 'Sua base e os detalhes da viagem',
  },
  {
    id: 'checklist',
    label: 'Checklist',
    icon: ClipboardCheck,
    description: 'Para não deixar nada para trás',
  },
  {
    id: 'informacoes',
    label: 'Informações úteis',
    icon: Info,
    description: 'Contatos, transporte e suas anotações',
  },
  {
    id: 'backup',
    label: 'Backup e restauração',
    icon: Archive,
    description: 'Uma cópia segura dos seus dados',
  },
  {
    id: 'preferencias',
    label: 'Preferências',
    icon: Settings,
    description: 'Deixe o aplicativo do seu jeito',
  },
];
export function More({
  section,
  navigate,
  store,
  preferences,
  setPreferences,
}: {
  section: string;
  navigate: (page: string) => void;
  store: TravelStore;
  preferences: Preferences;
  setPreferences: (p: Preferences) => void;
}) {
  const current = menu.find((m) => m.id === section);
  return (
    <>
      <PageHeading
        eyebrow="ESPAÇO DO VIAJANTE"
        title={current?.label || 'Tudo para sua viagem'}
        description={current?.description || 'Os detalhes que fazem a viagem acontecer.'}
      />
      {section === 'mais' ? (
        <div className="more-menu">
          {menu.map((m) => (
            <button className="card menu-item" key={m.id} onClick={() => navigate(m.id)}>
              <span className="icon-tile">
                <m.icon size={22} />
              </span>
              <div>
                <h3>{m.label}</h3>
                <p className="muted">{m.description}</p>
              </div>
              <ChevronRight size={20} />
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="subnav" aria-label="Mais opções">
            {menu.map((m) => (
              <button
                key={m.id}
                className={section === m.id ? 'active' : ''}
                onClick={() => navigate(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          {section === 'documentos' && <Documents store={store} />}
          {section === 'hotel' && <HotelPage store={store} />}
          {section === 'checklist' && <Checklist store={store} />}
          {section === 'informacoes' && <Useful store={store} />}
          {section === 'backup' && (
            <BackupPage store={store} preferences={preferences} setPreferences={setPreferences} />
          )}
          {section === 'preferencias' && (
            <section className="card preferences">
              <h2>Aparência</h2>
              <Field label="Tema do aplicativo">
                <select
                  value={preferences.theme}
                  onChange={(e) =>
                    setPreferences({ theme: e.target.value as Preferences['theme'] })
                  }
                >
                  <option value="system">Seguir o dispositivo</option>
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </Field>
              <h2>Sobre esta viagem</h2>
              <dl className="detail-grid">
                <div>
                  <dt>Destino</dt>
                  <dd>Atenas, Grécia</dd>
                </div>
                <div>
                  <dt>Origem</dt>
                  <dd>Palermo, Itália</dd>
                </div>
                <div>
                  <dt>Período</dt>
                  <dd>20 a 23 de novembro de 2026</dd>
                </div>
                <div>
                  <dt>Fuso do roteiro</dt>
                  <dd>Europe/Athens</dd>
                </div>
                <div>
                  <dt>Moeda / idioma</dt>
                  <dd>Euro (€) / Português brasileiro</dd>
                </div>
                <div>
                  <dt>Versão dos dados</dt>
                  <dd>1 · Armazenamento local</dd>
                </div>
              </dl>
              <p className="notice">
                O navegador armazena seus dados por endereço do site, perfil e dispositivo. Não há
                sincronização. Use o backup para transferir sua viagem.
              </p>
            </section>
          )}
        </>
      )}
    </>
  );
}
function HotelPage({ store }: { store: TravelStore }) {
  const s = store.state!,
    h = s.hotel;
  const [editing, setEditing] = useState(false);
  const [record, setRecord] = useState<{ type: 'flight' | 'reservation'; id: string } | null>(null);
  const [removing, setRemoving] = useState<{ type: 'flight' | 'reservation'; id: string } | null>(
    null,
  );
  return (
    <>
      <section className="card hotel-card">
        <span className="icon-tile warm">
          <Hotel size={24} />
        </span>
        <div className="section-title">
          <h2>{h.name || 'Seu hotel em Atenas'}</h2>
          <button className="button secondary" onClick={() => setEditing(true)}>
            <Edit3 size={16} />
            Editar hotel
          </button>
        </div>
        <p className="muted">
          {h.address ||
            'Endereço ainda não informado. Os dados serão preenchidos com o cronograma definitivo.'}
        </p>
        <dl className="detail-grid">
          <div>
            <dt>Entrada</dt>
            <dd>{h.checkIn || 'A informar'}</dd>
          </div>
          <div>
            <dt>Saída</dt>
            <dd>{h.checkOut || 'A informar'}</dd>
          </div>
        </dl>
        {h.notes && <p className="notes">{h.notes}</p>}
        <MapsLinks address={h.address} />
        {h.website && (
          <a className="text-button" href={h.website} target="_blank" rel="noreferrer">
            Site do hotel ↗ · Requer internet
          </a>
        )}
      </section>
      <div className="section-title">
        <h2>Voos</h2>
        <button
          className="button secondary"
          onClick={() => setRecord({ type: 'flight', id: crypto.randomUUID() })}
        >
          <Plus size={16} />
          Adicionar voo
        </button>
      </div>
      {!s.flights.length && (
        <p className="notice">Nenhum voo cadastrado. Não há horários ou reservas presumidos.</p>
      )}
      {s.flights.map((f) => (
        <section className="card record" key={f.id}>
          <div>
            <span className="badge neutral">{f.confirmation}</span>
            <h3>
              {f.origin || 'Origem a informar'} → {f.destination || 'Destino a informar'}
            </h3>
            <p>
              Saída: {f.departure || 'A informar'} · Chegada: {f.arrival || 'A informar'}
            </p>
            <p className="notes muted">{f.notes}</p>
          </div>
          <div className="inline">
            <button
              className="icon-button"
              aria-label="Editar voo"
              onClick={() => setRecord({ type: 'flight', id: f.id })}
            >
              <Edit3 size={18} />
            </button>
            <button
              className="icon-button danger"
              aria-label="Excluir voo"
              onClick={() => setRemoving({ type: 'flight', id: f.id })}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </section>
      ))}
      <div className="section-title">
        <h2>Reservas</h2>
        <button
          className="button secondary"
          onClick={() => setRecord({ type: 'reservation', id: crypto.randomUUID() })}
        >
          <Plus size={16} />
          Adicionar reserva
        </button>
      </div>
      {!s.reservations.length && (
        <p className="notice">
          Guarde códigos e referências apenas aqui no dispositivo, nunca no código-fonte.
        </p>
      )}
      {s.reservations.map((r) => (
        <section className="card record" key={r.id}>
          <div>
            <h3>{r.title}</h3>
            <p>{r.reference || 'Sem código de referência'}</p>
            <p className="notes muted">{r.notes}</p>
            {r.documentId && (
              <p className="small">
                Documento:{' '}
                {store.documents.find((d) => d.id === r.documentId)?.name || 'Arquivo ausente'}
              </p>
            )}
          </div>
          <div className="inline">
            <button
              className="icon-button"
              aria-label={`Editar reserva ${r.title}`}
              onClick={() => setRecord({ type: 'reservation', id: r.id })}
            >
              <Edit3 size={18} />
            </button>
            <button
              className="icon-button danger"
              aria-label={`Excluir reserva ${r.title}`}
              onClick={() => setRemoving({ type: 'reservation', id: r.id })}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </section>
      ))}
      {editing && (
        <Modal title="Dados do hotel" onClose={() => setEditing(false)}>
          <AsyncForm
            onSave={async (f) => {
              await store.update((state) => ({
                ...state,
                hotel: {
                  name: value(f, 'name'),
                  address: value(f, 'address'),
                  checkIn: value(f, 'checkIn'),
                  checkOut: value(f, 'checkOut'),
                  notes: value(f, 'notes'),
                  website: value(f, 'website'),
                },
              }));
              setEditing(false);
            }}
          >
            <div className="form-grid">
              {Object.entries({
                name: 'Nome do hotel',
                address: 'Endereço',
                checkIn: 'Entrada (data, horário e fuso)',
                checkOut: 'Saída (data, horário e fuso)',
                website: 'Site oficial',
              }).map(([key, label]) => (
                <Field label={label} key={key} wide>
                  <input
                    name={key}
                    defaultValue={h[key as keyof typeof h]}
                    type={key === 'website' ? 'url' : 'text'}
                    maxLength={key === 'website' ? 2000 : 10000}
                  />
                </Field>
              ))}
              <Field label="Observações" wide>
                <textarea name="notes" defaultValue={h.notes} maxLength={10000} />
              </Field>
            </div>
          </AsyncForm>
        </Modal>
      )}
      {record && <RecordEditor store={store} record={record} onClose={() => setRecord(null)} />}
      {removing && (
        <Modal
          title={`Excluir ${removing.type === 'flight' ? 'voo' : 'reserva'}?`}
          onClose={() => setRemoving(null)}
        >
          <AsyncForm
            label="Excluir registro"
            onSave={async () => {
              await store.update((state) => {
                if (removing.type === 'flight')
                  state.flights = state.flights.filter((f) => f.id !== removing.id);
                else state.reservations = state.reservations.filter((r) => r.id !== removing.id);
                return state;
              });
              setRemoving(null);
            }}
          >
            <p>
              O registro local será removido. Documentos anexados serão mantidos na área de
              documentos.
            </p>
          </AsyncForm>
        </Modal>
      )}
    </>
  );
}
function RecordEditor({
  store,
  record,
  onClose,
}: {
  store: TravelStore;
  record: { type: 'flight' | 'reservation'; id: string };
  onClose: () => void;
}) {
  const flight = store.state!.flights.find((f) => f.id === record.id);
  const reservation = store.state!.reservations.find((r) => r.id === record.id);
  return (
    <Modal title={record.type === 'flight' ? 'Dados do voo' : 'Dados da reserva'} onClose={onClose}>
      <AsyncForm
        onSave={async (f) => {
          await store.update((s) => {
            if (record.type === 'flight') {
              const next = {
                id: record.id,
                origin: value(f, 'origin'),
                destination: value(f, 'destination'),
                departure: value(f, 'departure'),
                arrival: value(f, 'arrival'),
                confirmation: value(f, 'confirmation') as 'Confirmado' | 'Estimativa',
                notes: value(f, 'notes'),
              };
              const i = s.flights.findIndex((x) => x.id === record.id);
              if (i < 0) s.flights.push(next);
              else s.flights[i] = next;
            } else {
              const next = {
                id: record.id,
                title: value(f, 'title'),
                reference: value(f, 'reference'),
                notes: value(f, 'notes'),
                documentId: value(f, 'documentId') || null,
              };
              const i = s.reservations.findIndex((x) => x.id === record.id);
              if (i < 0) s.reservations.push(next);
              else s.reservations[i] = next;
            }
            return s;
          });
          onClose();
        }}
      >
        <div className="form-grid">
          {record.type === 'flight' ? (
            <>
              {Object.entries({
                origin: 'Origem',
                destination: 'Destino',
                departure: 'Saída (data, horário e fuso local)',
                arrival: 'Chegada (data, horário e fuso local)',
              }).map(([key, label]) => (
                <Field key={key} label={label} wide>
                  <input
                    name={key}
                    defaultValue={flight?.[key as keyof typeof flight]}
                    maxLength={10000}
                    required={key === 'origin' || key === 'destination'}
                  />
                </Field>
              ))}
              <Field label="Confirmação">
                <select name="confirmation" defaultValue={flight?.confirmation || 'Estimativa'}>
                  <option>Estimativa</option>
                  <option>Confirmado</option>
                </select>
              </Field>
            </>
          ) : (
            <>
              <Field label="Nome da reserva *" wide>
                <input name="title" defaultValue={reservation?.title} required maxLength={10000} />
              </Field>
              <Field label="Código ou referência (privado, somente local)" wide>
                <input name="reference" defaultValue={reservation?.reference} maxLength={10000} />
              </Field>
              <Field label="Documento local" wide>
                <select name="documentId" defaultValue={reservation?.documentId || ''}>
                  <option value="">Sem documento</option>
                  {store.documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}
          <Field label="Observações" wide>
            <textarea
              name="notes"
              defaultValue={flight?.notes || reservation?.notes}
              maxLength={10000}
            />
          </Field>
        </div>
      </AsyncForm>
    </Modal>
  );
}
const usefulLabels: Record<keyof AppState['useful'], string> = {
  phones: 'Telefones úteis',
  emergencies: 'Emergências',
  publicTransport: 'Transporte público',
  safety: 'Dicas de segurança',
  tickets: 'Informações sobre ingressos',
  importantTimes: 'Horários importantes',
  personalNotes: 'Observações pessoais',
  phrasesPt: 'Frases em português',
  phrasesIt: 'Frases em italiano',
  phrasesEl: 'Frases em grego',
};
function Useful({ store }: { store: TravelStore }) {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <div className="section-title">
        <h2>Seu guia pessoal</h2>
        <button className="button" onClick={() => setEditing(true)}>
          <Edit3 size={17} />
          Editar informações
        </button>
      </div>
      <p className="notice">
        Estes espaços serão preenchidos com as informações fornecidas no cronograma. Nenhum
        telefone, tarifa ou orientação turística foi presumido.
      </p>
      <div className="useful-grid">
        {Object.entries(usefulLabels).map(([key, label]) => (
          <section className="card useful-card" key={key}>
            <h3>{label}</h3>
            <p className="notes muted">
              {store.state!.useful[key as keyof AppState['useful']] || 'Ainda não informado.'}
            </p>
          </section>
        ))}
      </div>
      {editing && (
        <Modal title="Informações úteis" onClose={() => setEditing(false)}>
          <AsyncForm
            onSave={async (f) => {
              await store.update((s) => {
                for (const key of Object.keys(usefulLabels) as (keyof AppState['useful'])[])
                  s.useful[key] = value(f, key);
                return s;
              });
              setEditing(false);
            }}
          >
            <div className="form-grid">
              {Object.entries(usefulLabels).map(([key, label]) => (
                <Field key={key} label={label} wide>
                  <textarea
                    name={key}
                    defaultValue={store.state!.useful[key as keyof AppState['useful']]}
                    maxLength={10000}
                  />
                </Field>
              ))}
            </div>
          </AsyncForm>
        </Modal>
      )}
    </>
  );
}
function Checklist({ store }: { store: TravelStore }) {
  const [editing, setEditing] = useState<{ id: string; title: string; done: boolean } | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const items = store.state!.checklist;
  return (
    <>
      <div className="section-title">
        <h2>
          {items.filter((i) => i.done).length} de {items.length} prontos
        </h2>
        <button
          className="button"
          onClick={() => setEditing({ id: crypto.randomUUID(), title: '', done: false })}
        >
          <Plus size={17} />
          Adicionar item
        </button>
      </div>
      <div className="card checklist">
        {!items.length ? (
          <Empty title="Viajar com a cabeça leve">
            Crie sua lista de preparativos. Tudo funciona offline.
          </Empty>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`checklist-item ${item.done ? 'checked' : ''}`}>
              <button
                className="check-toggle"
                aria-label={`${item.done ? 'Desmarcar' : 'Concluir'} ${item.title}`}
                aria-pressed={item.done}
                disabled={store.busy}
                onClick={() => {
                  void store
                    .update((s) => {
                      s.checklist.find((i) => i.id === item.id)!.done = !item.done;
                      return s;
                    })
                    .catch(() => undefined);
                }}
              >
                {item.done && <Check size={18} />}
              </button>
              <span>{item.title}</span>
              <button
                className="icon-button"
                aria-label={`Editar ${item.title}`}
                onClick={() => setEditing(item)}
              >
                <Edit3 size={17} />
              </button>
              <button
                className="icon-button danger"
                aria-label={`Excluir ${item.title}`}
                onClick={() => setRemoving(item.id)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))
        )}
      </div>
      {editing && (
        <Modal title="Item do checklist" onClose={() => setEditing(null)}>
          <AsyncForm
            onSave={async (f) => {
              await store.update((s) => {
                const next = { ...editing, title: value(f, 'title') };
                const index = s.checklist.findIndex((i) => i.id === editing.id);
                if (index < 0) s.checklist.push(next);
                else s.checklist[index] = next;
                return s;
              });
              setEditing(null);
            }}
          >
            <Field label="O que precisa ser feito? *">
              <input name="title" defaultValue={editing.title} maxLength={300} required />
            </Field>
          </AsyncForm>
        </Modal>
      )}
      {removing && (
        <Modal title="Excluir item?" onClose={() => setRemoving(null)}>
          <AsyncForm
            label="Excluir item"
            onSave={async () => {
              await store.update((s) => ({
                ...s,
                checklist: s.checklist.filter((i) => i.id !== removing),
              }));
              setRemoving(null);
            }}
          >
            <p>Este item será removido do checklist.</p>
          </AsyncForm>
        </Modal>
      )}
    </>
  );
}
