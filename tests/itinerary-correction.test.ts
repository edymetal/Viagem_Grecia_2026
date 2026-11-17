import { describe, expect, it } from 'vitest';
import {
  correctAthensItinerary,
  correctedAthensItinerary,
  correctItinerary,
  previousItinerary,
} from '../src/lib/itinerary';
import { suppliedItinerary } from '../src/data/itinerary';
import { emptyActivity } from '../src/data/factories';
import { conflicts, plannedRange, totals } from '../src/lib/domain';
import { stateSchema } from '../src/data/schema';
import beforeParking from '../src/data/itinerary-before-parking.json' with { type: 'json' };
import beforeReturn from '../src/data/itinerary-before-return-confirmation.json' with { type: 'json' };

describe('correção enviada com acessos, saídas e margens', () => {
  it('transcreve horários corrigidos e não cria uma visita extra depois do museu', () => {
    const s = correctedAthensItinerary();
    for (const [id, start, end] of [
      ['plan-1-11', '19:20', '19:35'],
      ['plan-1-12', '19:35', '20:45'],
      ['corr-1-hotel-walk', '20:45', '20:55'],
      ['plan-1-13', '20:55', '21:15'],
      ['plan-1-14', '21:25', '22:10'],
      ['plan-2-03', '09:00', '09:35'],
      ['corr-2-library-exit', '09:35', '09:45'],
      ['plan-2-05', '10:25', '11:25'],
      ['plan-2-08', '13:05', '13:25'],
      ['corr-2-guide-walk', '13:50', '14:10'],
      ['plan-2-10', '14:10', '14:30'],
      ['plan-2-14', '19:10', '20:20'],
      ['plan-3-03', '08:15', '09:45'],
      ['corr-3-agora-exit', '09:45', '09:55'],
      ['plan-3-04', '09:55', '10:30'],
      ['plan-3-07', '11:30', '12:05'],
      ['plan-3-09', '12:15', '12:50'],
      ['plan-3-10', '13:05', '13:15'],
      ['plan-3-14', '16:30', '16:40'],
      ['corr-3-hotel-walk', '16:40', '16:50'],
      ['plan-3-15', '16:50', '19:00'],
      ['plan-3-17', '20:30', ''],
      ['corr-4-room-check', '07:40', '08:00'],
      ['plan-4-05', '10:00', '10:15'],
      ['corr-4-airport', '10:15', '11:45'],
      ['plan-4-10', '19:15', '19:55'],
      ['corr-4-station-walk', '19:55', '20:10'],
      ['corr-4-platform', '20:10', '20:26'],
    ])
      expect(
        s.activities.find((a) => a.id === id),
        id,
      ).toMatchObject({ start, end });
    expect(s.activities.find((a) => a.id === 'plan-3-14')!.title).toContain('sair');
    expect(s.activities.some((a) => /Tempo adicional/.test(a.title))).toBe(false);
    expect(conflicts(s.activities)).toEqual([]);
    expect(
      s.activities
        .filter((a) => a.id.startsWith('corr-1') && a.start < '18:00')
        .every((a) => a.timeZone === 'Europe/Rome'),
    ).toBe(true);
    expect(s.activities.find((a) => a.id === 'corr-4-platform')!.timeZone).toBe('Europe/Rome');
    expect(s.activities.find((a) => a.id === 'plan-4-14')!.notes).toContain(
      'horário final em casa desconhecido',
    );
  });

  it('atualiza os 60 registros antigos e insere 29 etapas uma única vez', () => {
    const before = previousItinerary();
    const corrected = correctAthensItinerary(before);
    expect(corrected.activities).toEqual(correctedAthensItinerary().activities);
    expect(corrected.activities).toHaveLength(89);
    expect(corrected.itineraryRevision).toBe(correctedAthensItinerary().itineraryRevision);
    expect(before.activities).toHaveLength(60);
    expect(correctAthensItinerary(corrected)).toBe(corrected);
    expect(plannedRange(corrected)).toEqual({ min: 441.81, max: 481.81 });
    expect(totals(corrected).actual).toBe(0);
  });

  it('preserva notas, foto pessoal, favorito, conclusão, gastos e reservas locais', () => {
    const current = previousItinerary();
    const visit = current.activities.find((a) => a.id === 'plan-2-03')!;
    visit.notes = 'Minha anotação pessoal';
    visit.favorite = true;
    visit.completed = true;
    visit.photoDocumentId = 'minha-foto';
    visit.confirmation = 'Confirmada';
    current.days[0].notes = 'Observação do viajante';
    current.budget = 950;
    current.expenses[0].amount = 250;
    current.expenses[0].paid = true;
    current.expenses[0].status = 'Realizado';
    current.hotel.notes = 'Reserva particular';
    current.useful.personalNotes = 'Lembrete particular';
    current.reservations.push({
      id: 'local',
      title: 'Reserva local',
      reference: 'APENAS-TESTE',
      notes: '',
      documentId: 'local-doc',
    });
    current.checklist[6].done = true;
    const next = correctAthensItinerary(current);
    expect(next.activities.find((a) => a.id === visit.id)).toMatchObject({
      end: '09:35',
      notes: visit.notes,
      favorite: true,
      completed: true,
      photoDocumentId: 'minha-foto',
      confirmation: 'Confirmada',
    });
    expect(next.expenses).toEqual(current.expenses);
    expect(next.reservations).toEqual(current.reservations);
    expect(next.budget).toBe(950);
    expect(next.days[0].notes).toBe('Observação do viajante');
    expect(next.hotel.notes).toBe('Reserva particular');
    expect(next.hotel.checkIn).toContain('20h55');
    expect(next.useful.personalNotes).toBe('Lembrete particular');
    expect(next.checklist[6].done).toBe(true);
    expect(next.checklist[6].title).toContain('Coordenar');
  });

  it('respeita exclusões, novas atividades e reordenação feita pelo viajante', () => {
    const current = previousItinerary();
    current.activities = current.activities.filter((a) => a.id !== 'plan-2-08');
    const x = current.activities.findIndex((a) => a.id === 'plan-2-03');
    const y = current.activities.findIndex((a) => a.id === 'plan-2-05');
    [current.activities[x], current.activities[y]] = [current.activities[y], current.activities[x]];
    const extra = { ...emptyActivity('2026-11-21'), title: 'Atividade particular' };
    current.activities.splice(x + 1, 0, extra);
    const ids = current.activities.map((a) => a.id);
    const next = correctAthensItinerary(current);
    expect(next.activities.some((a) => a.id === 'plan-2-08')).toBe(false);
    expect(next.activities.filter((a) => ids.includes(a.id)).map((a) => a.id)).toEqual(ids);
    expect(next.activities.find((a) => a.id === extra.id)).toEqual(extra);
  });

  it('mantém registros locais válidos quando uma alteração de horário conflita com a correção', () => {
    const current = previousItinerary();
    const visit = current.activities.find((a) => a.id === 'plan-2-03')!;
    visit.start = '09:40'; // Valid with the old end, but after the corrected 09:35 end.
    const walk = current.activities.find((a) => a.id === 'plan-2-04')!;
    walk.transport.minutesMax = 26; // Local range conflicts with the new 30-minute stage.
    expect(stateSchema.safeParse(current).success).toBe(true);
    const next = correctAthensItinerary(current);
    expect(stateSchema.safeParse(next).success).toBe(true);
    expect(next.activities.find((a) => a.id === visit.id)).toEqual(visit);
    expect(next.activities.find((a) => a.id === walk.id)).toEqual(walk);
  });

  it('não altera revisões desconhecidas nem estados pessoais sem cronograma', () => {
    const current = previousItinerary();
    delete current.itineraryRevision;
    expect(correctAthensItinerary(current)).toBe(current);
    current.itineraryRevision = 'revisao-desconhecida';
    expect(correctAthensItinerary(current)).toBe(current);
  });
});

describe('atualização para Atenas e Roma', () => {
  it('confirma o P1 na revisão de Roma e aproveita uma despesa manual sem duplicar o valor', () => {
    const baseline = suppliedItinerary();
    const parking = baseline.expenses.find((e) => e.id === 'plan-exp-parking')!;
    const prior = stateSchema.parse({
      ...baseline,
      itineraryRevision: beforeParking.itineraryRevision,
      activities: baseline.activities.map(
        (a) => beforeParking.activities.find((old) => old.id === a.id) ?? a,
      ),
      checklist: baseline.checklist.map(
        (item) => beforeParking.checklist.find((old) => old.id === item.id) ?? item,
      ),
      expenses: baseline.expenses.filter((e) => e.id !== parking.id),
    });
    prior.activities.find((a) => a.id === 'nov-20-parking')!.notes = 'Minha nota de estacionamento';
    const saved = correctItinerary(prior);
    expect(saved.activities.map((a) => a.id)).toEqual(prior.activities.map((a) => a.id));
    expect(saved.activities.find((a) => a.id === 'nov-20-parking')).toMatchObject({
      confirmation: 'Confirmada',
      notes: 'Minha nota de estacionamento',
    });
    expect(saved.checklist.find((item) => item.id === 'trip-check-parking')?.done).toBe(true);
    expect(saved.expenses.filter((e) => e.id === parking.id)).toEqual([parking]);
    expect(correctItinerary(saved)).toBe(saved);

    prior.expenses.push({
      ...parking,
      id: 'local-p1',
      title: 'P1 Lunga Sosta',
      status: 'Previsto',
      paid: false,
      amount: 50,
      amountMax: 70,
      notes: 'Minha previsão',
    });
    const withManualExpense = correctItinerary(prior);
    expect(withManualExpense.expenses.find((e) => e.id === 'local-p1')).toMatchObject({
      amount: 65,
      amountMax: undefined,
      status: 'Realizado',
      paid: true,
      notes: 'Minha previsão',
    });
    expect(withManualExpense.expenses.some((e) => e.id === parking.id)).toBe(false);
    expect(totals(withManualExpense).actual).toBe(694.04);
  });

  it('confirma o FR3946 em dados salvos sem duplicar a passagem nem apagar notas', () => {
    const plan = suppliedItinerary();
    const payment = plan.expenses.find((e) => e.id === 'plan-exp-ryanair')!;
    const prior = stateSchema.parse({
      ...plan,
      itineraryRevision: beforeReturn.itineraryRevision,
      activities: plan.activities.map(
        (activity) => beforeReturn.activities.find((old) => old.id === activity.id) ?? activity,
      ),
      flights: plan.flights.map(
        (flight) => beforeReturn.flights.find((old) => old.id === flight.id) ?? flight,
      ),
      days: plan.days.map((day) => beforeReturn.days.find((old) => old.date === day.date) ?? day),
      checklist: plan.checklist.map(
        (item) => beforeReturn.checklist.find((old) => old.id === item.id) ?? item,
      ),
      expenses: plan.expenses.filter((item) => item.id !== payment.id),
    });
    prior.activities.find((activity) => activity.id === 'nov-26-flight')!.notes =
      'Minha nota para o voo';
    prior.expenses.push({
      ...payment,
      id: 'local-fr3946',
      title: 'FR 3946',
      paid: false,
      status: 'Previsto',
      amount: 70,
    });
    const updated = correctItinerary(prior);
    expect(updated.activities.find((activity) => activity.id === 'nov-26-flight')).toMatchObject({
      timeCertainty: 'Confirmado',
      notes: 'Minha nota para o voo',
    });
    expect(updated.flights).toEqual(plan.flights);
    expect(updated.days).toEqual(plan.days);
    expect(updated.checklist).toEqual(plan.checklist);
    expect(updated.expenses.find((expense) => expense.id === 'local-fr3946')).toMatchObject({
      amount: 64.89,
      paid: true,
      status: 'Realizado',
    });
    expect(updated.expenses.some((expense) => expense.id === payment.id)).toBe(false);
    expect(totals(updated).actual).toBe(694.04);
    expect(correctItinerary(updated)).toBe(updated);
  });

  it('migra backups de quatro dias das duas revisões conhecidas', () => {
    for (const old of [previousItinerary(), correctedAthensItinerary()]) {
      const parsed = stateSchema.parse({ ...old, days: old.days.slice(0, 4) });
      const upgraded = correctItinerary(parsed);
      const plan = suppliedItinerary();
      expect(upgraded.activities).toEqual(plan.activities);
      expect(upgraded.expenses).toEqual(plan.expenses);
      expect(upgraded.days).toEqual(plan.days);
      expect(upgraded.romeHotel).toEqual(plan.romeHotel);
      expect(correctItinerary(upgraded)).toBe(upgraded);
    }
  });

  it('move a Biblioteca para domingo mantendo a nota e conserva despesas pagas localmente', () => {
    const before = correctedAthensItinerary();
    const library = before.activities.find((a) => a.id === 'plan-2-03')!;
    library.notes = 'Minha nota local';
    library.photoDocumentId = 'foto-particular';
    library.favorite = true;
    const airfare = before.expenses.find((e) => e.id === 'plan-exp-flights')!;
    airfare.paid = true;
    airfare.status = 'Realizado';
    const updated = correctItinerary(before);
    expect(updated.activities.find((a) => a.id === library.id)).toMatchObject({
      date: '2026-11-22',
      start: '09:05',
      notes: library.notes,
      photoDocumentId: library.photoDocumentId,
      favorite: true,
    });
    expect(updated.expenses.filter((e) => e.category === 'Passagens aéreas')).toEqual([
      airfare,
      suppliedItinerary().expenses.find((e) => e.id === 'plan-exp-ryanair'),
    ]);
  });
});
