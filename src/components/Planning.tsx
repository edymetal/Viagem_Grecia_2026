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
          <p>Incorpore os quatro dias recebidos, preservando suas edições e arquivos locais.</p>
        </div>
        <button className="button" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Incorporar cronograma
        </button>
      </div>
      {open && (
        <Modal title="Incorporar cronograma recebido" onClose={() => setOpen(false)}>
          <p>
            {suppliedItinerary().activities.length} atividades, hotel escolhido, dois voos
            consultados, alternativas e checklist de pendências.
          </p>
          <p className="notice">
            Nada está comprado ou reservado no texto fornecido. Seus arquivos, orçamento, reservas e
            registros existentes serão mantidos. Atividades com o mesmo ID ou nome/dia serão
            preservadas. Campos informativos já preenchidos não serão substituídos.
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
              Adicionar as 11 despesas previstas do cronograma
            </label>
            <p className="small muted">
              Se você já cadastrou os mesmos gastos com outros nomes, deixe esta opção desmarcada
              para evitar duplicidade. Nenhuma despesa será marcada como paga. Recomendamos exportar
              um backup antes da incorporação.
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
  const acropolis = s.activities.find((a) => a.id === 'plan-2-11');
  const museum = s.activities.find((a) => a.id === 'plan-3-13');
  return (
    <details className="notice planning-notice">
      <summary>Cronograma corrigido · confira as pendências</summary>
      <p>
        Correção de 20 a 23/11 incorporada em 89 etapas, com acesso e saída das atrações separados.
        Edições locais são mantidas. Horários, valores e fontes transcritos sem nova consulta de
        disponibilidade. “Consultado” não significa comprado ou reservado.
      </p>
      <ul>
        {acropolis && acropolis.confirmation !== 'Confirmada' && (
          <li>
            Proposta original para Acrópole: 14h30–16h30, sem vaga garantida; confirmar guia e preço
            antes do ingresso.
          </li>
        )}
        {museum && museum.confirmation !== 'Confirmada' && (
          <li>
            Proposta original para o museu: 14h30–16h30. O domingo é ajustável; confirmar guia,
            preço e ponto de encontro.
          </li>
        )}
        {museum && !museum.completed && (!museum.end || museum.end >= '16:30') && (
          <li>
            A escavação tem última entrada informada às 16h30 no cronograma anterior. Coordenar com
            o operador; não há visita extra garantida depois do tour. O bloco 16h30–16h40 é somente
            para finalizar e sair.
          </li>
        )}
        <li>
          Hotel e dois guias continuam com preço pendente. Trens e voos precisam ser reconferidos
          antes da compra. As janelas do metrô incluem margem e não são partidas confirmadas.
          Percursos casa → estação e estação → casa ainda não foram definidos.
        </li>
      </ul>
    </details>
  );
}
