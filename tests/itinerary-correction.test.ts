import { describe, expect, it } from 'vitest';
import { correctItinerary, previousItinerary } from '../src/lib/itinerary';
import { suppliedItinerary, ITINERARY_REVISION } from '../src/data/itinerary';
import { emptyActivity } from '../src/data/factories';
import { conflicts, plannedRange, totals } from '../src/lib/domain';
import { stateSchema } from '../src/data/schema';

describe('correção enviada com acessos, saídas e margens', () => {
  it('transcreve horários corrigidos e não cria uma visita extra depois do museu', () => {
    const s = suppliedItinerary();
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
    const corrected = correctItinerary(before);
    expect(corrected.activities).toEqual(suppliedItinerary().activities);
    expect(corrected.activities).toHaveLength(89);
    expect(corrected.itineraryRevision).toBe(ITINERARY_REVISION);
    expect(before.activities).toHaveLength(60);
    expect(correctItinerary(corrected)).toBe(corrected);
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
    const next = correctItinerary(current);
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
    const next = correctItinerary(current);
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
    const next = correctItinerary(current);
    expect(stateSchema.safeParse(next).success).toBe(true);
    expect(next.activities.find((a) => a.id === visit.id)).toEqual(visit);
    expect(next.activities.find((a) => a.id === walk.id)).toEqual(walk);
  });

  it('não altera revisões desconhecidas nem estados pessoais sem cronograma', () => {
    const current = previousItinerary();
    delete current.itineraryRevision;
    expect(correctItinerary(current)).toBe(current);
    current.itineraryRevision = 'revisao-desconhecida';
    expect(correctItinerary(current)).toBe(current);
  });
});
