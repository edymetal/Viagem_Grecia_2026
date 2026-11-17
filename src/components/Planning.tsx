import { useState } from 'react';
import { CalendarCheck, Plus } from 'lucide-react';
import type { TravelStore } from '../hooks/useTravel';
import { ITINERARY_REVISION, suppliedItinerary } from '../data/itinerary';
import { mergeItinerary } from '../lib/itinerary';
import { AsyncForm, Modal } from './ui';

export function ItineraryImport({ store }: { store: TravelStore }) {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState(store.state!.expenses.length === 0);
  if (store.state!.itineraryRevision === ITINERARY_REVISION) return null;
  return (
    <>
      <div className="notice import-plan">
        <div>
          <strong>
            <CalendarCheck size={18} />
            Seu cronograma está disponível
          </strong>
          <p>
            Incorpore os sete dias em Atenas e Roma, preservando suas edições e arquivos locais.
          </p>
        </div>
        <button className="button" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Incorporar cronograma
        </button>
      </div>
      {open && (
        <Modal title="Incorporar cronograma recebido" onClose={() => setOpen(false)}>
          <p>
            {suppliedItinerary().activities.length} atividades, hospedagens, voos e checklist de
            pendências.
          </p>
          <p className="notice">
            O planejamento inclui compras informadas e itens a confirmar. A incorporação preserva
            seus arquivos, reservas e registros existentes.
          </p>
          <AsyncForm
            label="Incorporar planejamento"
            onSave={async () => {
              await store.update((s) => mergeItinerary(s, expenses));
              setOpen(false);
            }}
          >
            <label className="check-label">
              <input
                type="checkbox"
                checked={expenses}
                onChange={(e) => setExpenses(e.target.checked)}
              />
              Adicionar as despesas informadas e previstas no cronograma
            </label>
            <p className="small muted">
              Se você já cadastrou os mesmos gastos com outros nomes, deixe esta opção desmarcada
              para evitar duplicidade.
            </p>
          </AsyncForm>
        </Modal>
      )}
    </>
  );
}
export function PlanningNotice({ store }: { store: TravelStore }) {
  const s = store.state!;
  if (s.itineraryRevision !== ITINERARY_REVISION) return null;
  const pending = s.checklist.filter((item) => !item.done);
  if (!pending.length) return null;
  return (
    <details className="notice planning-notice">
      <summary>{pending.length} pendências da viagem</summary>
      <ul>
        {pending.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </details>
  );
}
