import { describe, expect, it } from 'vitest';
import { suppliedItinerary, ITINERARY_REVISION } from '../src/data/itinerary';
import { emptyActivity, emptyState } from '../src/data/factories';
import { activityInstant, conflicts, nextActivity, plannedRange, totals } from '../src/lib/domain';
import { mergeItinerary } from '../src/lib/itinerary';
import { createBackup, parseBackup } from '../src/lib/backup';
import { expenseSchema, stateSchema } from '../src/data/schema';

describe('cronograma fornecido de 20 a 23/11', () => {
  it('preserva as 89 etapas corrigidas e horários, sem compras ou reservas inventadas', () => {
    const s = suppliedItinerary();
    expect(stateSchema.parse(s)).toEqual(s);
    expect(s.activities).toHaveLength(89);
    expect(s.days.map((d) => s.activities.filter((a) => a.date === d.date).length)).toEqual([
      19, 24, 27, 19,
    ]);
    expect(s.reservations).toEqual([]);
    expect(s.expenses.every((e) => e.status === 'Previsto' && !e.paid)).toBe(true);
    expect(s.activities.every((a) => a.confirmation !== 'Confirmada' && !a.completed)).toBe(true);
    expect(s.activities.find((a) => a.id === 'plan-1-02')).toMatchObject({
      start: '07:04',
      end: '08:51',
      timeZone: 'Europe/Rome',
    });
    expect(s.activities.find((a) => a.id === 'plan-4-13')).toMatchObject({
      start: '21:35',
      end: '22:59',
      timeZone: 'Europe/Rome',
    });
    expect(s.activities.some((a) => a.title.includes('Panatenaico'))).toBe(false);
    expect(
      s.activities.filter((a) => a.guideUrl).map((a) => [a.start, a.end, a.timeCertainty]),
    ).toEqual([
      ['14:30', '16:30', 'Proposto'],
      ['14:30', '16:30', 'Proposto'],
    ]);
  });
  it('preserva preços exatos e faixas sem duplicar ingressos, alimentação ou passe', () => {
    const s = suppliedItinerary();
    expect(s.expenses).toHaveLength(11);
    expect(
      s.expenses.filter((e) => e.category === 'Ingressos').reduce((n, e) => n + e.amount, 0),
    ).toBe(107);
    expect(plannedRange(s)).toEqual({ min: 441.81, max: 481.81 });
    expect(totals(s).actual).toBe(0);
    expect(s.budget).toBeNull();
    expect(s.expenses.some((e) => e.category === 'Hotel' || e.category === 'Passeios')).toBe(false);
    expect(s.activities.find((a) => a.id === 'plan-1-14')).toMatchObject({
      price: 12,
      priceMax: 20,
      priceCertainty: 'Estimativa',
    });
    expect(s.hotel.notes).toContain('Preço final');
  });
  it('compara corretamente Itália e Atenas para próxima atividade e conflitos', () => {
    const train = suppliedItinerary().activities.find((a) => a.id === 'plan-1-02')!;
    expect(new Date(activityInstant(train)).toISOString()).toBe('2026-11-20T06:04:00.000Z');
    const greece = {
      ...emptyActivity('2026-11-20'),
      id: 'gr',
      title: 'Teste GR',
      start: '07:30',
      end: '08:00',
      confirmation: 'Planejada' as const,
    };
    expect(nextActivity([train, greece], new Date('2026-11-20T05:00Z'))?.id).toBe('gr');
    const italy = {
      ...greece,
      id: 'it',
      title: 'Teste IT',
      start: '06:45',
      end: '07:15',
      timeZone: 'Europe/Rome' as const,
    };
    expect(conflicts([italy, greece])).toHaveLength(1);
    expect(conflicts(suppliedItinerary().activities)).toHaveLength(0);
  });
  it('incorpora uma vez e preserva edições, orçamento e despesas já cadastradas', () => {
    const current = emptyState();
    current.budget = 800;
    current.hotel.name = 'Hotel já editado';
    current.days[0].notes = 'Anotação local';
    current.useful.personalNotes = 'Nota privada';
    current.activities.push({
      ...emptyActivity('2026-11-20'),
      title: 'Minha atividade',
      completed: true,
    });
    current.expenses.push({
      ...suppliedItinerary().expenses[0],
      id: 'local',
      title: 'Meu gasto',
      status: 'Realizado',
      paid: true,
    });
    const merged = mergeItinerary(current);
    expect(merged.activities).toHaveLength(90);
    expect(merged.expenses).toEqual(current.expenses);
    expect(merged.budget).toBe(800);
    expect(merged.days[0].notes).toBe('Anotação local');
    expect(merged.hotel).toEqual(current.hotel);
    expect(merged.useful.personalNotes).toBe('Nota privada');
    expect(mergeItinerary(merged)).toEqual(merged);
    expect(current.itineraryRevision).toBeUndefined();
    expect(merged.itineraryRevision).toBe(ITINERARY_REVISION);
  });
  it('mantém compatibilidade com dados v1 e valida faixas em despesas pagas/realizadas', () => {
    const e = suppliedItinerary().expenses.find((e) => e.amountMax)!;
    expect(expenseSchema.safeParse({ ...e, status: 'Realizado' }).success).toBe(false);
    expect(expenseSchema.safeParse({ ...e, paid: true }).success).toBe(false);
    expect(expenseSchema.safeParse({ ...e, amountMax: null, paid: true }).success).toBe(true);
    const legacy = emptyState();
    delete legacy.itineraryRevision;
    delete legacy.alternatives;
    expect(stateSchema.safeParse(legacy).success).toBe(true);
  });
  it('restaura fusos, faixas, alternativas e pendências pelo backup', async () => {
    const s = suppliedItinerary();
    s.activities[0].favorite = true;
    const backup = await createBackup(s, { theme: 'dark' });
    const restored = await parseBackup(JSON.stringify(backup));
    expect(restored.data).toEqual(s);
  });
});
