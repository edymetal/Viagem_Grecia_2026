import { openDB } from 'idb';
import { z } from 'zod';

export const WEATHER_TTL = 15 * 60_000;
export const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=37.98&longitude=23.73&current=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=4&timezone=Europe%2FAthens&timeformat=unixtime&temperature_unit=celsius';
const temperature = z.number().finite().min(-100).max(70).nullable();
const code = z.number().int().min(0).max(99).nullable();
const timestamp = z.number().int().positive().max(8_640_000_000_000);
const probability = z.number().min(0).max(100).nullable();
const weatherSchema = z.object({
  fetchedAt: timestamp,
  current: z.object({ time: timestamp, temperature, code, isDay: z.boolean() }),
  days: z
    .array(
      z
        .object({ time: timestamp, min: temperature, max: temperature, code, rain: probability })
        .refine((d) => d.min === null || d.max === null || d.min <= d.max),
    )
    .min(1)
    .max(4),
});
export type AthensWeather = z.infer<typeof weatherSchema>;
const responseSchema = z
  .object({
    timezone: z.literal('Europe/Athens'),
    current_units: z.object({ time: z.literal('unixtime'), temperature_2m: z.literal('°C') }),
    daily_units: z.object({
      time: z.literal('unixtime'),
      temperature_2m_max: z.literal('°C'),
      temperature_2m_min: z.literal('°C'),
    }),
    current: z.object({
      time: timestamp,
      temperature_2m: temperature,
      weather_code: code,
      is_day: z.union([z.literal(0), z.literal(1)]),
    }),
    daily: z.object({
      time: z.array(timestamp).min(1).max(4),
      temperature_2m_min: z.array(temperature),
      temperature_2m_max: z.array(temperature),
      weather_code: z.array(code),
      precipitation_probability_max: z.array(probability),
    }),
  })
  .refine((r) =>
    [
      r.daily.temperature_2m_min,
      r.daily.temperature_2m_max,
      r.daily.weather_code,
      r.daily.precipitation_probability_max,
    ].every((a) => a.length === r.daily.time.length),
  );

export function parseWeather(input: unknown, fetchedAt = Date.now()): AthensWeather {
  const r = responseSchema.parse(input);
  return weatherSchema.parse({
    fetchedAt,
    current: {
      time: r.current.time,
      temperature: r.current.temperature_2m,
      code: r.current.weather_code,
      isDay: r.current.is_day === 1,
    },
    days: r.daily.time.map((time, i) => ({
      time,
      min: r.daily.temperature_2m_min[i],
      max: r.daily.temperature_2m_max[i],
      code: r.daily.weather_code[i],
      rain: r.daily.precipitation_probability_max[i],
    })),
  });
}
export const freshWeather = (weather: AthensWeather, now = Date.now()) =>
  now >= weather.fetchedAt && now - weather.fetchedAt < WEATHER_TTL;
export const celsius = (n: number | null) =>
  n === null
    ? 'Não informado'
    : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(n)} °C`;
export function weatherDescription(code: number | null) {
  if (code === 0) return 'Céu limpo';
  if (code === 1) return 'Predominantemente limpo';
  if (code === 2) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if (code === 45 || code === 48) return 'Nevoeiro';
  if ([51, 53, 55, 56, 57].includes(code ?? -1)) return 'Garoa';
  if ([61, 63, 65, 66, 67].includes(code ?? -1)) return 'Chuva';
  if ([71, 73, 75, 77, 85, 86].includes(code ?? -1)) return 'Neve';
  if ([80, 81, 82].includes(code ?? -1)) return 'Pancadas de chuva';
  if ([95, 96, 99].includes(code ?? -1)) return 'Trovoadas';
  return 'Condição não informada';
}

// Independent, disposable cache: never touches trip records, documents or backups.
const weatherDB = () =>
  openDB('atenas-weather', 1, {
    upgrade(db) {
      db.createObjectStore('forecast');
    },
  });
export async function cachedWeather(): Promise<AthensWeather | null> {
  try {
    const db = await weatherDB();
    try {
      const parsed = weatherSchema.safeParse(await db.get('forecast', 'athens'));
      return parsed.success ? parsed.data : null;
    } finally {
      db.close();
    }
  } catch {
    return null;
  }
}
let pending: Promise<AthensWeather> | null = null;
export function fetchWeather(): Promise<AthensWeather> {
  if (pending) return pending;
  pending = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(WEATHER_URL, { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) throw new Error('Previsão indisponível');
      const weather = parseWeather(await response.json());
      try {
        const db = await weatherDB();
        try {
          await db.put('forecast', weather, 'athens');
        } finally {
          db.close();
        }
      } catch {
        /* Weather stays usable if local cache is blocked or full. */
      }
      return weather;
    } finally {
      clearTimeout(timeout);
    }
  })().finally(() => {
    pending = null;
  });
  return pending;
}
