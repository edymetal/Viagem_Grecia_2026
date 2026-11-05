import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { deleteDB } from 'idb';
import {
  cachedWeather,
  celsius,
  fetchWeather,
  freshWeather,
  parseWeather,
  weatherDescription,
  WEATHER_TTL,
  WEATHER_URL,
} from '../src/lib/weather';
import { weatherFixture } from './weather-fixture';

afterEach(async () => {
  vi.unstubAllGlobals();
  await deleteDB('atenas-weather');
});

describe('tempo de Atenas', () => {
  it('valida a resposta, preserva Celsius, referência temporal e probabilidade zero', () => {
    const data = parseWeather(weatherFixture(), 1000000);
    expect(data.current.temperature).toBe(18.3);
    expect(data.days[1].rain).toBe(0);
    expect(data.days[2].rain).toBe(75);
    expect(data.days).toHaveLength(4);
    expect(freshWeather(data, 1000000 + WEATHER_TTL - 1)).toBe(true);
    expect(freshWeather(data, 1000000 + WEATHER_TTL)).toBe(false);
    expect(freshWeather(data, 999999)).toBe(false);
  });
  it('não transforma dados ausentes ou desconhecidos em sol ou temperatura zero', () => {
    const fixture = weatherFixture();
    const data = parseWeather({
      ...fixture,
      current: { ...fixture.current, temperature_2m: null, weather_code: null },
    });
    expect(data.current.temperature).toBeNull();
    expect(celsius(data.current.temperature)).toBe('Não informado');
    expect(weatherDescription(null)).toBe('Condição não informada');
    expect(weatherDescription(4)).toBe('Condição não informada');
    expect(weatherDescription(0)).toBe('Céu limpo');
    expect(weatherDescription(61)).toBe('Chuva');
    expect(weatherDescription(95)).toBe('Trovoadas');
  });
  it('rejeita unidades erradas, séries truncadas, valores inválidos e mínimo maior que máximo', () => {
    const fixture = weatherFixture();
    expect(() =>
      parseWeather({
        ...fixture,
        current_units: { ...fixture.current_units, temperature_2m: '°F' },
      }),
    ).toThrow();
    expect(() =>
      parseWeather({ ...fixture, daily: { ...fixture.daily, temperature_2m_min: [12] } }),
    ).toThrow();
    expect(() =>
      parseWeather({
        ...fixture,
        daily: { ...fixture.daily, temperature_2m_min: [25, 13, 11, 10] },
      }),
    ).toThrow();
    expect(() =>
      parseWeather({ ...fixture, current: { ...fixture.current, temperature_2m: Infinity } }),
    ).toThrow();
  });
  it('compartilha a consulta em andamento e guarda apenas o cache meteorológico no IndexedDB', async () => {
    const fetch = vi.fn(
      async () => new Response(JSON.stringify(weatherFixture()), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetch);
    const [a, b] = await Promise.all([fetchWeather(), fetchWeather()]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      WEATHER_URL,
      expect.objectContaining({ credentials: 'omit' }),
    );
    expect(a).toEqual(b);
    expect(await cachedWeather()).toEqual(a);
  });
  it('não substitui a última consulta válida quando o serviço falha', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(weatherFixture()), { status: 200 })),
    );
    const saved = await fetchWeather();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 503 })),
    );
    await expect(fetchWeather()).rejects.toThrow('Previsão indisponível');
    expect(await cachedWeather()).toEqual(saved);
  });
});
