import { describe, expect, it } from 'vitest';
import { suppliedItinerary, ITINERARY_REVISION } from '../src/data/itinerary';
import { emptyActivity, emptyState } from '../src/data/factories';
import {
  activityInstant,
  conflicts,
  nextActivity,
  plannedRange,
  totals,
  tripNow,
} from '../src/lib/domain';
import { mergeItinerary } from '../src/lib/itinerary';
import { createBackup, parseBackup } from '../src/lib/backup';
import { expenseSchema, stateSchema } from '../src/data/schema';
import beforeVicusConfirmation from '../src/data/itinerary-before-vicus-confirmation.json';

describe('cronograma de Atenas e Roma de 20 a 26/11', () => {
  it('incorpora os sete dias com horários, estados e faixas de entrada', () => {
    const plan = suppliedItinerary();
    expect(stateSchema.parse(plan)).toEqual(plan);
    expect(
      plan.days.map((day) => plan.activities.filter((a) => a.date === day.date).length),
    ).toEqual([12, 13, 18, 10, 14, 16, 8]);
    expect(plan.reservations).toEqual([]);
    expect(plan.activities.every((activity) => !activity.completed)).toBe(true);
    expect(plan.activities.find((a) => a.id === 'plan-2-03')).toMatchObject({
      date: '2026-11-22',
      start: '09:05',
      confirmation: 'Confirmada',
      price: 10,
    });
    expect(plan.activities.find((a) => a.id === 'nov-24-vicus')).toMatchObject({
      start: '15:00',
      end: '15:30',
      confirmation: 'Confirmada',
      timeCertainty: 'Confirmado',
      description: expect.stringContaining('15h20 e 15h30'),
    });
    expect(plan.activities.find((a) => a.id === 'nov-24-gamm-walk')).toMatchObject({
      transport: { minutes: 21 },
      description: expect.stringContaining('15h41 e 15h51'),
    });
    expect(plan.activities.find((a) => a.id === 'nov-24-gamm')).toMatchObject({
      start: '16:15',
      end: '18:10',
      confirmation: 'Planejada',
      description: expect.stringContaining('entra mais cedo'),
    });
    expect(plan.activities.find((a) => a.id === 'nov-25-voyager')).toMatchObject({
      start: '17:00',
      confirmation: 'Pendente',
      timeZone: 'Europe/Rome',
    });
    expect(plan.activities.find((a) => a.id === 'nov-26-flight')).toMatchObject({
      start: '13:50',
      end: '15:00',
      confirmation: 'Confirmada',
      timeCertainty: 'Confirmado',
      price: 64.89,
      description: expect.stringContaining('40 × 30 × 20 cm'),
    });
    expect(plan.flights.find((flight) => flight.id === 'plan-flight-ryanair')).toMatchObject({
      origin: 'Roma Fiumicino (FCO)',
      confirmation: 'Confirmado',
    });
    expect(plan.activities.find((a) => a.id === 'nov-20-parking')).toMatchObject({
      end: '10:00',
      confirmation: 'Confirmada',
      timeCertainty: 'Estimativa',
      timeNote: expect.stringContaining('09h00'),
    });
    expect(plan.activities.find((a) => a.id === 'nov-26-luggage')).toMatchObject({
      end: '16:00',
      timeCertainty: 'Estimativa',
      timeNote: expect.stringContaining('23h00'),
    });
  });

  it('preserva valores informados sem somar entradas do tour combinado em duplicidade', () => {
    const s = suppliedItinerary();
    expect(s.expenses).toHaveLength(37);
    expect(s.expenses.filter((e) => e.id.includes('acropolis')).map((e) => e.amount)).toEqual([
      110,
    ]);
    expect(plannedRange(s)).toEqual({ min: 359.70, max: 497.70 });
    expect(totals(s).paid).toBe(969.59);
    expect(totals(s).actual).toBe(969.59);
    expect(s.expenses.find((e) => e.id === 'plan-exp-ryanair')).toMatchObject({
      amount: 64.89,
      paid: true,
      status: 'Realizado',
      category: 'Passagens aéreas',
    });
    expect(s.checklist.find((item) => item.id === 'trip-check-ryanair')).toMatchObject({
      title: 'Fazer o check-in da Ryanair e salvar o cartão de embarque do FR3946',
      done: false,
    });
    expect(s.expenses.find((e) => e.id === 'plan-exp-parking')).toMatchObject({
      amount: 65,
      paid: true,
      status: 'Realizado',
      category: 'Transporte',
    });
    expect(s.checklist.find((item) => item.id === 'trip-check-parking')?.done).toBe(true);
    expect(s.expenses.find((e) => e.id === 'plan-exp-ciao')).toMatchObject({
      amount: 206.55,
      paid: true,
      status: 'Realizado',
    });
    expect(s.expenses.find((e) => e.id === 'plan-exp-ciao-tax')).toMatchObject({
      amount: 18,
      paid: false,
      status: 'Previsto',
    });
    expect(s.hotel.name).toBe('Ilissos Hotel');
    expect(s.romeHotel?.name).toBe('Ciao Termini');
  });

  it('compara os fusos dos voos e a troca de dia em Roma', () => {
    const plan = suppliedItinerary();
    const outbound = plan.activities.find((a) => a.id === 'nov-20-az718')!;
    expect(new Date(activityInstant(outbound)).toISOString()).toBe('2026-11-20T14:35:00.000Z');
    expect(new Date(activityInstant(outbound, 'end')).toISOString()).toBe(
      '2026-11-20T16:35:00.000Z',
    );
    const returnFlight = plan.activities.find((a) => a.id === 'plan-4-06')!;
    expect(new Date(activityInstant(returnFlight, 'end')).toISOString()).toBe(
      '2026-11-23T12:55:00.000Z',
    );
    expect(nextActivity(plan.activities, new Date('2026-11-23T12:00Z'))?.id).toBe(returnFlight.id);
    expect(conflicts(plan.activities)).toHaveLength(0);
    expect(tripNow(new Date('2026-11-24T22:30Z')).date).toBe('2026-11-24');
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
    expect(merged.activities).toHaveLength(suppliedItinerary().activities.length + 1);
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

  it('atualiza a confirmação e os horários de Roma no roteiro salvo', () => {
    const saved = suppliedItinerary();
    saved.itineraryRevision = beforeVicusConfirmation.itineraryRevision;
    for (const activity of beforeVicusConfirmation.activities)
      Object.assign(saved.activities.find(({ id }) => id === activity.id)!, activity);
    Object.assign(
      saved.days.find(({ date }) => date === beforeVicusConfirmation.days[0].date)!,
      beforeVicusConfirmation.days[0],
    );
    Object.assign(
      saved.expenses.find(({ id }) => id === beforeVicusConfirmation.expenses[0].id)!,
      beforeVicusConfirmation.expenses[0],
    );
    Object.assign(
      saved.checklist.find(({ id }) => id === beforeVicusConfirmation.checklist[0].id)!,
      beforeVicusConfirmation.checklist[0],
    );
    Object.assign(saved.useful, beforeVicusConfirmation.useful);
    const vicus = saved.activities.find(({ id }) => id === 'nov-24-vicus')!;
    vicus.favorite = true;
    vicus.notes = 'Anotação pessoal sobre a visita';

    const updated = mergeItinerary(saved);
    const expected = suppliedItinerary();
    Object.assign(expected.activities.find(({ id }) => id === vicus.id)!, {
      favorite: vicus.favorite,
      notes: vicus.notes,
    });
    expect(updated).toEqual(expected);
    expect(mergeItinerary(updated)).toEqual(updated);
  });
  it('restaura fusos, faixas, alternativas e pendências pelo backup', async () => {
    const s = suppliedItinerary();
    s.activities[0].favorite = true;
    const backup = await createBackup(s, { theme: 'dark' });
    const restored = await parseBackup(JSON.stringify(backup));
    expect(restored.data).toEqual(s);
  });
});
