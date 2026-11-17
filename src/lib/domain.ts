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
function localNow(now: Date, timeZone: 'Europe/Athens' | 'Europe/Rome') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
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
export function athensNow(now = new Date()) {
  return localNow(now, 'Europe/Athens');
}
export function tripNow(now = new Date()) {
  const italy = localNow(now, 'Europe/Rome');
  return italy.date >= '2026-11-24' || (italy.date === '2026-11-23' && italy.time >= '13:55')
    ? italy
    : athensNow(now);
}
export function countdown(now = new Date()) {
  return Math.ceil(
    (Date.parse('2026-11-20T00:00:00Z') - Date.parse(`${athensNow(now).date}T00:00:00Z`)) /
      86400000,
  );
}
export function nextActivity(activities: Activity[], now = new Date()) {
  return activities
    .filter(
      (a) =>
        !a.completed &&
        a.confirmation !== 'Sugestão' &&
        a.start &&
        activityInstant(a, a.end ? 'end' : 'start') >= now.getTime(),
    )
    .sort((a, b) => activityInstant(a) - activityInstant(b))[0];
}
export function zoneLabel(a: Activity, part: 'start' | 'end' = 'start') {
  return (part === 'end' ? (a.endTimeZone ?? a.timeZone) : a.timeZone) === 'Europe/Rome'
    ? 'Itália'
    : 'Atenas';
}
export function mapDestination(a: Activity) {
  const destination = a.address || a.location || a.transport.destination;
  // A cerimônia acontece junto ao monumento, não no centro da praça.
  if (a.id === 'plan-3-06' && destination === 'Praça Syntagma, Atenas')
    return 'Túmulo do Soldado Desconhecido, Praça Syntagma, Atenas';
  return destination;
}
// Derive the offset from IANA rules rather than assuming the traveler's device timezone.
export function activityInstant(a: Activity, part: 'start' | 'end' = 'start') {
  const time = a[part];
  if (!time) return NaN;
  const guess = Date.parse(`${a.date}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: (part === 'end' ? (a.endTimeZone ?? a.timeZone) : a.timeZone) || 'Europe/Athens',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(guess));
  const n = (key: string) => Number(parts.find((p) => p.type === key)!.value);
  const local = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'));
  return guess - (local - guess);
}
export function moneyRange(min: number, max?: number | null) {
  return max == null || max === min ? euro(min) : `${euro(min)} – ${euro(max)}`;
}
export function plannedRange(state: AppState) {
  return {
    min: totals(state).planned,
    max:
      state.expenses
        .filter((e) => e.status === 'Previsto')
        .reduce((n, e) => n + Math.round((e.amountMax ?? e.amount) * 100), 0) / 100,
  };
}
export function conflicts(activities: Activity[]) {
  const timed = activities.filter((a) => a.start && a.end && !a.completed);
  const result: string[] = [];
  for (let i = 0; i < timed.length; i++)
    for (let j = i + 1; j < timed.length; j++) {
      const a = timed[i],
        b = timed[j];
      if (
        activityInstant(a) < activityInstant(b, 'end') &&
        activityInstant(b) < activityInstant(a, 'end')
      )
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
// Nomes testados no Google Maps. Place IDs evitam anúncios e resultados homônimos.
// A substituição só se aplica às strings originais; endereços editados seguem normalmente.
const verifiedMapPlaces: Record<string, { query: string; placeId?: string }> = {
  'Túmulo do Soldado Desconhecido, Praça Syntagma, Atenas': { query: 'Tomb of the Unknown Soldier Athens Greece' },
  'Ciao Termini, Via Bixio 71, Roma': { query: 'Via Bixio 71, Roma' },
  'Ágora Antiga, Adrianou 24, Atenas': { query: 'Ancient Agora entrance Adrianou 24 Athens' },
  'Igreja dos Santos Arcanjos e da Virgem Maria Vigilante, Taxiarchon 7, Atenas': {
    query: 'Holy Church of the All-Great Taxiarchs and the Virgin Mary Gregorousa, Athens',
  },
  'Estação de metrô do aeroporto de Atenas': { query: 'Athens Airport metro station Greece' },
  'Evangelismos, Atenas': { query: 'Evangelismos metro station Athens Greece' },
  'Estação Monastiraki, Atenas': { query: 'Monastiraki metro station Athens Greece' },
  'Estação Syngrou-Fix, Atenas': { query: 'Syngrou-Fix metro Athens', placeId: 'ChIJddlgsBq9oRQRmCsWlm96bHQ' },
  'Estação Manzoni, Roma': { query: 'Manzoni metro Roma', placeId: 'ChIJH167-JVhLxMRTtRrDi9lFao' },
  'Estação Ottaviano, Roma': { query: 'Ottaviano metro Roma', placeId: 'ChIJyRMjS2BgLxMRN-nw1lASGx8' },
  'Estação Flaminio, Roma': { query: 'Flaminio metro Roma', placeId: 'ChIJzczLaPlgLxMRgbHQxx9Oxuw' },
  'Roma Termini': { query: 'Estação Roma Termini', placeId: 'ChIJ7__AOaRhLxMRlKlh8r59MKQ' },
};

export function mapsLink(
  destination: string,
  mode?: 'walking' | 'transit' | 'driving',
  origin?: string,
) {
  const params = new URLSearchParams({ api: '1' });
  const destinationPlace = verifiedMapPlaces[destination] ?? { query: destination };
  if (!mode) {
    params.set('query', destinationPlace.query);
    if (destinationPlace.placeId) params.set('query_place_id', destinationPlace.placeId);
    return `https://www.google.com/maps/search/?${params}`;
  }
  params.set('destination', destinationPlace.query);
  if (destinationPlace.placeId) params.set('destination_place_id', destinationPlace.placeId);
  params.set('travelmode', mode);
  params.set('dir_action', 'navigate');
  if (origin) {
    const originPlace = verifiedMapPlaces[origin] ?? { query: origin };
    params.set('origin', originPlace.query);
    if (originPlace.placeId) params.set('origin_place_id', originPlace.placeId);
  }
  return `https://www.google.com/maps/dir/?${params}`;
}
