import { describe, expect, it } from 'vitest';
import { emptyActivity } from '../src/data/factories';
import { timelinePosition } from '../src/lib/timeline';

describe('avanço do relógio na linha do tempo', () => {
  const activity = {
    ...emptyActivity('2026-11-20'),
    start: '10:00',
    end: '11:00',
    timeZone: 'Europe/Rome' as const,
  };
  const next = { ...activity, start: '12:00', end: '' };

  it('preenche proporcionalmente entre os horários, sem alterar a conclusão da visita', () => {
    expect(timelinePosition(activity, next, new Date('2026-11-20T08:59Z'))).toEqual({
      progress: 0,
      state: 'upcoming',
    });
    expect(timelinePosition(activity, next, new Date('2026-11-20T09:00Z'))).toEqual({
      progress: 0,
      state: 'current',
    });
    expect(timelinePosition(activity, next, new Date('2026-11-20T10:00Z'))).toEqual({
      progress: 0.5,
      state: 'current',
    });
    expect(timelinePosition(activity, next, new Date('2026-11-20T11:00Z'))).toEqual({
      progress: 1,
      state: 'elapsed',
    });
    expect(activity.completed).toBe(false);
  });

  it('usa o fuso de cada ponta no deslocamento Itália → Atenas', () => {
    const arrival = { ...next, start: '13:00', timeZone: 'Europe/Athens' as const };
    expect(timelinePosition(activity, arrival, new Date('2026-11-20T10:00Z')).progress).toBe(0.5);
  });

  it('limita o avanço ao dia e usa o término na última etapa', () => {
    expect(timelinePosition(activity, undefined, new Date('2026-11-20T09:30Z')).progress).toBe(0.5);
    expect(timelinePosition(activity, next, new Date('2026-11-19T10:00Z')).progress).toBe(0);
    expect(timelinePosition(activity, next, new Date('2026-11-21T10:00Z')).progress).toBe(1);
  });

  it('trata horários iguais, ordem invertida e ausência de horário sem divisões inválidas', () => {
    const point = { ...activity, end: '' };
    for (const following of [point, { ...point, start: '09:00' }, undefined]) {
      expect(timelinePosition(point, following, new Date('2026-11-20T09:00Z'))).toEqual({
        progress: 1,
        state: 'elapsed',
      });
    }
    expect(timelinePosition({ ...point, start: '' }, next, new Date())).toEqual({
      progress: 0,
      state: 'untimed',
    });
  });
});
