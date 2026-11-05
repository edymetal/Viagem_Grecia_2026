import { describe, expect, it } from 'vitest';
import { emptyState as initialState, emptyActivity } from '../src/data/initial';
import { activitySchema, stateSchema } from '../src/data/schema';
import { athensNow, conflicts, countdown, mapsLink, nextActivity, totals } from '../src/lib/domain';

describe('roteiro e horário de Atenas', () => {
  it('começa com quatro dias vazios, sem dados turísticos inventados', () => {
    const s = initialState();
    expect(stateSchema.parse(s)).toEqual(s);
    expect(s.activities).toHaveLength(0);
    expect(s.days).toHaveLength(4);
    expect(s.budget).toBeNull();
  });
  it('usa o dia de Atenas quando a Itália ainda está no dia anterior', () => {
    expect(athensNow(new Date('2026-11-19T22:30:00Z'))).toEqual({
      date: '2026-11-20',
      time: '00:30',
    });
    expect(countdown(new Date('2026-11-19T22:30:00Z'))).toBe(0);
    expect(countdown(new Date('2026-11-05T12:00:00Z'))).toBe(15);
  });
  it('também respeita o horário de verão da Grécia', () => {
    expect(athensNow(new Date('2026-07-01T21:15:00Z'))).toEqual({
      date: '2026-07-02',
      time: '00:15',
    });
  });
  it('escolhe apenas atividades confirmadas, futuras ou em andamento', () => {
    const a = {
      ...emptyActivity('2026-11-20'),
      title: 'Teste',
      confirmation: 'Confirmada' as const,
      start: '10:00',
      end: '11:00',
    };
    const b = { ...a, id: 'b', start: '12:00', end: '13:00' };
    expect(
      nextActivity([{ ...a, confirmation: 'Sugestão' }, b], new Date('2026-11-20T08:30Z'))?.id,
    ).toBe('b');
    expect(nextActivity([b, a], new Date('2026-11-20T08:30Z'))?.id).toBe(a.id);
    expect(
      nextActivity([{ ...a, completed: true }], new Date('2026-11-20T08:30Z')),
    ).toBeUndefined();
  });
  it('valida horários e detecta sobreposição sem alterar os dados', () => {
    const a = { ...emptyActivity('2026-11-20'), title: 'A', start: '10:00', end: '11:00' };
    const b = { ...a, id: 'b', title: 'B', start: '10:30', end: '12:00' };
    expect(conflicts([a, b])).toHaveLength(1);
    expect(a.end).toBe('11:00');
    expect(activitySchema.safeParse({ ...a, start: '25:00' }).success).toBe(false);
    expect(activitySchema.safeParse({ ...a, end: '09:00' }).success).toBe(false);
    expect(activitySchema.safeParse({ ...a, website: 'javascript:alert(1)' }).success).toBe(false);
  });
  it('não confunde pagos com realizados e calcula centavos sem resíduos', () => {
    const s = initialState();
    s.budget = 100;
    s.expenses = [0.1, 0.2].map((amount, i) => ({
      id: String(i),
      title: 'Teste',
      amount,
      category: 'Outros',
      date: '2026-11-20',
      status: 'Realizado',
      paid: false,
      notes: '',
    }));
    s.expenses.push({
      ...s.expenses[0],
      id: 'previsto',
      amount: 20,
      status: 'Previsto',
      paid: true,
    });
    expect(totals(s)).toEqual({ actual: 0.3, planned: 20, paid: 20, balance: 99.7 });
  });
  it('codifica destinos e deixa a rota para o Google Maps calcular', () => {
    const url = new URL(mapsLink('Endereço & teste #1', 'transit', 'Origem'));
    expect(url.searchParams.get('destination')).toBe('Endereço & teste #1');
    expect(url.searchParams.get('travelmode')).toBe('transit');
    expect(url.searchParams.get('origin')).toBe('Origem');
  });
});
