import type { Activity, AppState } from '../data/schema';

export const euro = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(value);
export const dateLabel = (
  date: string,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' },
) =>
  new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'Europe/Athens' }).format(
    new Date(`${date}T12:00:00Z`),
  );
export function athensNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Athens',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (key: string) => parts.find((p) => p.type === key)!.value;
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  };
}
export function countdown(now = new Date()) {
  return Math.ceil(
    (Date.parse('2026-11-20T00:00:00Z') - Date.parse(`${athensNow(now).date}T00:00:00Z`)) /
      86400000,
  );
}
export function nextActivity(activities: Activity[], now = new Date()) {
  const current = athensNow(now);
  return activities
    .filter(
      (a) =>
        !a.completed &&
        a.confirmation === 'Confirmada' &&
        a.start &&
        (a.date > current.date || (a.date === current.date && (a.end || a.start) >= current.time)),
    )
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0];
}
export function conflicts(activities: Activity[]) {
  const timed = activities.filter((a) => a.start && a.end && !a.completed);
  const result: string[] = [];
  for (let i = 0; i < timed.length; i++)
    for (let j = i + 1; j < timed.length; j++) {
      const a = timed[i],
        b = timed[j];
      if (a.date === b.date && a.start < b.end && b.start < a.end)
        result.push(`${a.title} e ${b.title}: horários sobrepostos em ${dateLabel(a.date)}.`);
    }
  return result;
}
export function totals(state: AppState) {
  const actual =
    state.expenses
      .filter((e) => e.status === 'Realizado')
      .reduce((s, e) => s + Math.round(e.amount * 100), 0) / 100;
  const planned =
    state.expenses
      .filter((e) => e.status === 'Previsto')
      .reduce((s, e) => s + Math.round(e.amount * 100), 0) / 100;
  const paid =
    state.expenses.filter((e) => e.paid).reduce((s, e) => s + Math.round(e.amount * 100), 0) / 100;
  return {
    actual,
    planned,
    paid,
    balance:
      state.budget === null
        ? null
        : (Math.round(state.budget * 100) - Math.round(actual * 100)) / 100,
  };
}
export function mapsLink(destination: string, mode?: 'walking' | 'transit', origin?: string) {
  const params = new URLSearchParams({ api: '1' });
  if (!mode) {
    params.set('query', destination);
    return `https://www.google.com/maps/search/?${params}`;
  }
  params.set('destination', destination);
  params.set('travelmode', mode);
  params.set('dir_action', 'navigate');
  if (origin) params.set('origin', origin);
  return `https://www.google.com/maps/dir/?${params}`;
}
