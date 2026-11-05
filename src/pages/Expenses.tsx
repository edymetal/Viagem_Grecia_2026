import { useState } from 'react';
import {
  ArrowLeft,
  BedDouble,
  Check,
  Coins,
  Edit3,
  MoreHorizontal,
  Plus,
  Plane,
  ShoppingBag,
  Ticket,
  TrainFront,
  Trash2,
  Utensils,
  Wallet,
  Footprints,
  type LucideIcon,
} from 'lucide-react';
import { categories, expenseSchema, tripDates, type Expense } from '../data/schema';
import type { TravelStore } from '../hooks/useTravel';
import { athensNow, dateLabel, euro, totals, moneyRange, plannedRange } from '../lib/domain';
import {
  AsyncForm,
  Empty,
  Field,
  Modal,
  optionalNumber,
  ValidationError,
  value,
} from '../components/ui';

function ExpenseEditor({
  expense: e,
  store,
  onClose,
}: {
  expense: Expense;
  store: TravelStore;
  onClose: () => void;
}) {
  return (
    <Modal
      title={store.state!.expenses.some((x) => x.id === e.id) ? 'Editar despesa' : 'Nova despesa'}
      onClose={onClose}
    >
      <AsyncForm
        onSave={async (f) => {
          const parsed = expenseSchema.safeParse({
            ...e,
            title: value(f, 'title'),
            amount: optionalNumber(f, 'amount'),
            amountMax: optionalNumber(f, 'amountMax'),
            certainty: value(f, 'certainty'),
            category: value(f, 'category'),
            date: value(f, 'date'),
            status: value(f, 'status'),
            paid: f.has('paid'),
            notes: value(f, 'notes'),
          });
          if (!parsed.success) throw ValidationError(parsed.error);
          await store.update((s) => {
            const index = s.expenses.findIndex((x) => x.id === e.id);
            if (index < 0) s.expenses.push(parsed.data);
            else s.expenses[index] = parsed.data;
            return s;
          });
          onClose();
        }}
      >
        <div className="form-grid">
          <Field label="Descrição *" wide>
            <input name="title" defaultValue={e.title} maxLength={200} required />
          </Field>
          <Field label="Valor (€) *">
            <input
              name="amount"
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              defaultValue={store.state!.expenses.some((x) => x.id === e.id) ? e.amount : ''}
              required
            />
          </Field>
          <Field label="Categoria">
            <select name="category" defaultValue={e.category}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Valor máximo (€), se estimativa em faixa">
            <input
              name="amountMax"
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              defaultValue={e.amountMax ?? ''}
            />
          </Field>
          <Field label="Natureza do valor">
            <select name="certainty" defaultValue={e.certainty || 'Não informado'}>
              {['Não informado', 'Consultado', 'Estimativa', 'Confirmado'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <p className="small muted wide">
            O campo Valor é o mínimo quando houver uma faixa. Para marcar como realizado ou pago,
            informe o valor exato e remova o máximo.
          </p>
          <Field label="Data da despesa *">
            <input type="date" name="date" defaultValue={e.date} required />
          </Field>
          <Field label="Tipo de gasto">
            <select name="status" defaultValue={e.status}>
              <option>Previsto</option>
              <option>Realizado</option>
            </select>
          </Field>
          <label className="check-label wide">
            <input type="checkbox" name="paid" defaultChecked={e.paid} />
            Despesa paga
          </label>
          <Field label="Observações" wide>
            <textarea name="notes" defaultValue={e.notes} maxLength={10000} />
          </Field>
        </div>
      </AsyncForm>
    </Modal>
  );
}
const categoryStyle: Record<Expense['category'], { icon: LucideIcon; color: string }> = {
  'Passagens aéreas': { icon: Plane, color: 'purple' },
  Hotel: { icon: BedDouble, color: 'pink' },
  Transporte: { icon: TrainFront, color: 'blue' },
  Alimentação: { icon: Utensils, color: 'amber' },
  Ingressos: { icon: Ticket, color: 'red' },
  Passeios: { icon: Footprints, color: 'green' },
  Compras: { icon: ShoppingBag, color: 'purple' },
  Outros: { icon: MoreHorizontal, color: 'blue' },
};
export function Expenses({ store, now }: { store: TravelStore; now: Date }) {
  const state = store.state!;
  const total = totals(state);
  const planned = plannedRange(state);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [budget, setBudget] = useState(false);
  const [removing, setRemoving] = useState<Expense | null>(null);
  const [filter, setFilter] = useState('Todas');
  const [view, setView] = useState<'summary' | 'entries'>('summary');
  const [categoryKind, setCategoryKind] = useState<'Realizado' | 'Previsto'>('Realizado');
  const usage =
    state.budget === null
      ? null
      : state.budget > 0
        ? (total.actual / state.budget) * 100
        : total.actual > 0
          ? null
          : 0;
  const exceeded = state.budget !== null && total.actual > state.budget;
  const newExpense = () =>
    setEditing({
      id: crypto.randomUUID(),
      title: '',
      amount: 0,
      category: 'Outros',
      date: tripDates.find((d) => d === athensNow(now).date) || tripDates[0],
      status: 'Previsto',
      paid: false,
      notes: '',
    });
  const byCategory = categories.map((category) => {
    const expenses = state.expenses.filter(
      (e) => e.category === category && e.status === categoryKind,
    );
    return {
      label: category,
      amount: expenses.reduce((sum, e) => sum + Math.round(e.amount * 100), 0) / 100,
      max: expenses.reduce((sum, e) => sum + Math.round((e.amountMax ?? e.amount) * 100), 0) / 100,
    };
  });
  const byDay = [...new Set<string>([...tripDates, ...state.expenses.map((e) => e.date)])]
    .sort()
    .map((date) => ({
      label: dateLabel(date, { day: '2-digit', month: '2-digit', year: '2-digit' }),
      amount:
        state.expenses
          .filter((e) => e.date === date && e.status === 'Realizado')
          .reduce((n, e) => n + Math.round(e.amount * 100), 0) / 100,
    }));
  return (
    <section className="expenses-screen">
      <header className="route-heading">
        <a href="#inicio" className="icon-button" aria-label="Voltar ao início">
          <ArrowLeft size={23} />
        </a>
        <h1>Gastos</h1>
        <button className="icon-button new-expense" onClick={newExpense} aria-label="Nova despesa">
          <Plus size={25} />
        </button>
      </header>
      <div className="expense-tabs" role="tablist" aria-label="Controle de gastos">
        {(
          [
            { id: 'summary', label: 'Resumo' },
            { id: 'entries', label: 'Lançamentos' },
          ] as const
        ).map((tab, i) => (
          <button
            key={tab.id}
            id={`expense-tab-${tab.id}`}
            role="tab"
            aria-selected={view === tab.id}
            aria-controls={`expense-panel-${tab.id}`}
            tabIndex={view === tab.id ? 0 : -1}
            onClick={() => setView(tab.id)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 'summary'
                  : event.key === 'End'
                    ? 'entries'
                    : i === 0
                      ? 'entries'
                      : 'summary';
              setView(next);
              document.getElementById(`expense-tab-${next}`)?.focus();
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id="expense-panel-summary"
        role="tabpanel"
        aria-labelledby="expense-tab-summary"
        hidden={view !== 'summary'}
      >
        <section
          className={`trip-total-card ${exceeded ? 'budget-exceeded' : ''}`}
          aria-label="Resumo dos gastos realizados"
        >
          <h2>Total da viagem</h2>
          <div className="trip-total-value">
            <Coins size={34} />
            <strong>{euro(total.actual)}</strong>
          </div>
          <p>Gastos realizados</p>
          <progress
            className="budget-progress"
            max={100}
            value={state.budget === null ? 0 : exceeded ? 100 : (usage ?? 0)}
            aria-label="Orçamento consumido"
          />
          <div className="budget-caption">
            <span>Orçamento: {state.budget === null ? 'a definir' : euro(state.budget)}</span>
            <strong>{usage === null ? '—' : `${Math.round(usage)}%`}</strong>
          </div>
          {exceeded && (
            <p className="budget-alert" role="status">
              Orçamento excedido em {euro(total.actual - state.budget!)}.
            </p>
          )}
          <button className="text-button" onClick={() => setBudget(true)}>
            <Edit3 size={14} /> Definir orçamento
          </button>
        </section>
        <section className="category-summary" aria-label="Gastos por categoria">
          <div className="category-summary-heading">
            <h2>Por categoria</h2>
            <div className="category-kind" role="group" aria-label="Tipo dos valores por categoria">
              <button
                aria-pressed={categoryKind === 'Realizado'}
                onClick={() => setCategoryKind('Realizado')}
              >
                Realizados
              </button>
              <button
                aria-pressed={categoryKind === 'Previsto'}
                onClick={() => setCategoryKind('Previsto')}
              >
                Previstos
              </button>
            </div>
          </div>
          <div className="category-rows">
            {byCategory.map((category) => {
              const { icon: Icon, color } = categoryStyle[category.label];
              return (
                <button
                  className="category-row"
                  key={category.label}
                  onClick={() => {
                    setFilter(category.label);
                    setView('entries');
                  }}
                  aria-label={`Ver lançamentos de ${category.label}`}
                >
                  <Icon className={color} size={23} />
                  <span>{category.label}</span>
                  <strong>{moneyRange(category.amount, category.max)}</strong>
                </button>
              );
            })}
          </div>
          <p className="small muted category-hint">
            {categoryKind === 'Realizado'
              ? 'Somente despesas realizadas.'
              : 'Previsões adicionais; faixas de valores preservadas.'}{' '}
            Toque para ver os lançamentos.
          </p>
        </section>
        <div className="finance-stats">
          <section className="card stat">
            <span>
              Orçamento total <Wallet size={18} />
            </span>
            <strong>{state.budget === null ? 'A definir' : euro(state.budget)}</strong>
          </section>
          <section className="card stat">
            <span>Gastos realizados</span>
            <strong>{euro(total.actual)}</strong>
            <small>{euro(total.paid)} marcados como pagos</small>
          </section>
          <section className="card stat">
            <span>Gastos previstos</span>
            <strong className="planned-range">{moneyRange(planned.min, planned.max)}</strong>
            <small>Além dos valores realizados</small>
          </section>
          <section
            className={`card stat balance ${total.balance !== null && total.balance < 0 ? 'over-budget' : ''}`}
          >
            <span>Saldo disponível</span>
            <strong>{total.balance === null ? '—' : euro(total.balance)}</strong>
            <small>Orçamento menos realizados</small>
          </section>
        </div>
        <p className="small muted">
          Saldo após todos os gastos previstos:{' '}
          {state.budget === null
            ? 'defina um orçamento.'
            : moneyRange(
                Math.round((state.budget - total.actual - planned.max) * 100) / 100,
                Math.round((state.budget - total.actual - planned.min) * 100) / 100,
              )}{' '}
          Atividades e transportes não geram despesas automaticamente.
        </p>
        {state.itineraryRevision && (
          <details className="notice finance-reference">
            <summary>Referência do cronograma recebido · valores incompletos</summary>
            <p>
              Subtotal fornecido: €361,81 sem hotel, alimentação e guias. Alimentação global:
              €80–120. Com alimentação: €441,81–481,81, ainda sem hotel e dois guias.{' '}
              {state.budget === null
                ? 'O orçamento total permanece a definir.'
                : 'O orçamento definido por você aparece no resumo acima.'}
            </p>
            <p>
              Hotel por três noites e os dois guias ainda têm valor a confirmar; não foram lançados
              como despesas. As refeições do roteiro e os trajetos cobertos pelo passe não geram
              despesas extras automaticamente. Ao registrar gastos reais, ajuste as previsões
              correspondentes para evitar duplicidade.
            </p>
          </details>
        )}
        <div className="charts-grid">
          <Chart title="Por dia" values={byDay} />
        </div>
      </div>
      <div
        id="expense-panel-entries"
        role="tabpanel"
        aria-labelledby="expense-tab-entries"
        hidden={view !== 'entries'}
      >
        <div className="entries-toolbar">
          <button className="button" onClick={newExpense}>
            <Plus size={18} /> Nova despesa
          </button>
        </div>
        <div className="section-title">
          <h2>
            Despesas <span className="count-badge">{state.expenses.length}</span>
          </h2>
          <label className="filter-label">
            Categoria
            <select
              aria-label="Filtrar despesas por categoria"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>Todas</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        {!state.expenses.length ? (
          <section className="card">
            <Empty
              title="Suas contas começam aqui"
              action={
                <button className="button secondary" onClick={newExpense}>
                  <Plus size={16} />
                  Adicionar despesa
                </button>
              }
            >
              Cadastre o que está previsto e registre os gastos conforme a viagem acontece. Todos os
              valores são em euros.
            </Empty>
          </section>
        ) : (
          <div className="expense-list">
            {state.expenses
              .filter((e) => filter === 'Todas' || e.category === filter)
              .map((e) => (
                <article className="card expense" key={e.id}>
                  <CategoryIcon category={e.category} />
                  <div className="expense-description">
                    <h3>{e.title}</h3>
                    <p>
                      {e.category} · {dateLabel(e.date)}
                    </p>
                    {e.notes && <p className="notes">{e.notes}</p>}
                    <span className={`badge ${e.status === 'Previsto' ? 'neutral' : ''}`}>
                      {e.status}
                    </span>
                    {e.paid && <span className="badge">Pago</span>}
                    {e.certainty && e.certainty !== 'Não informado' && (
                      <span className="badge neutral">{e.certainty}</span>
                    )}
                  </div>
                  <strong>{moneyRange(e.amount, e.amountMax)}</strong>
                  <div className="expense-actions">
                    <button
                      className={`icon-button ${e.paid ? 'is-paid' : ''}`}
                      disabled={store.busy}
                      aria-label={`${e.paid ? 'Marcar como não paga' : 'Marcar como paga'}: ${e.title}`}
                      onClick={() => {
                        void store
                          .update((s) => {
                            s.expenses.find((x) => x.id === e.id)!.paid = !e.paid;
                            return s;
                          })
                          .catch(() => undefined);
                      }}
                    >
                      <Check size={17} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Editar ${e.title}`}
                      onClick={() => setEditing(e)}
                    >
                      <Edit3 size={17} />
                    </button>
                    <button
                      className="icon-button danger"
                      aria-label={`Excluir ${e.title}`}
                      onClick={() => setRemoving(e)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            {state.expenses.length > 0 &&
              !state.expenses.some((e) => filter === 'Todas' || e.category === filter) && (
                <p className="notice">Nenhuma despesa nesta categoria.</p>
              )}
          </div>
        )}
      </div>
      {editing && (
        <ExpenseEditor expense={editing} store={store} onClose={() => setEditing(null)} />
      )}
      {budget && (
        <Modal title="Orçamento da viagem" onClose={() => setBudget(false)}>
          <AsyncForm
            onSave={async (f) => {
              await store.update((s) => ({ ...s, budget: optionalNumber(f, 'budget') }));
              setBudget(false);
            }}
          >
            <Field label="Orçamento total em euros (vazio para remover)">
              <input
                name="budget"
                type="number"
                step="0.01"
                min="0"
                max="1000000"
                defaultValue={state.budget ?? ''}
              />
            </Field>
          </AsyncForm>
        </Modal>
      )}
      {removing && (
        <Modal title="Excluir despesa?" onClose={() => setRemoving(null)}>
          <p>
            “{removing.title}” · {moneyRange(removing.amount, removing.amountMax)}
          </p>
          <AsyncForm
            label="Excluir despesa"
            onSave={async () => {
              await store.update((s) => ({
                ...s,
                expenses: s.expenses.filter((e) => e.id !== removing.id),
              }));
              setRemoving(null);
            }}
          >
            <p className="muted">A despesa será removida do controle financeiro local.</p>
          </AsyncForm>
        </Modal>
      )}
    </section>
  );
}
function CategoryIcon({ category }: { category: Expense['category'] }) {
  const { icon: Icon, color } = categoryStyle[category];
  return (
    <span className={`icon-tile ${color}`}>
      <Icon size={23} />
    </span>
  );
}
function Chart({ title, values }: { title: string; values: { label: string; amount: number }[] }) {
  const max = Math.max(...values.map((v) => v.amount), 1);
  return (
    <section className="card chart">
      <div className="card-heading">
        <h2>{title}</h2>
        <span className="small muted">Realizados · €</span>
      </div>
      <div
        role="img"
        aria-label={`${title}. ${values.map((v) => `${v.label}: ${euro(v.amount)}`).join('; ')}`}
      >
        {values.map((v) => (
          <div className="chart-row" key={v.label}>
            <div>
              <span>{v.label}</span>
              <strong>{euro(v.amount)}</strong>
            </div>
            <div className="bar-track">
              <span style={{ width: `${(v.amount / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
