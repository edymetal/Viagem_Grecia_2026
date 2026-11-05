import { useEffect, useState } from 'react';
import {
  cachedWeather,
  fetchWeather,
  freshWeather,
  WEATHER_TTL,
  type AthensWeather,
} from '../lib/weather';

export function useAthensWeather(online: boolean) {
  const [weather, setWeather] = useState<AthensWeather | null>(null);
  const [loading, setLoading] = useState(online);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    let running = false;
    async function update() {
      if (running) return;
      running = true;
      try {
        const cached = await cachedWeather();
        if (!active) return;
        if (cached) setWeather(cached);
        if (!online || (cached && freshWeather(cached))) {
          setLoading(false);
          setError(false);
          return;
        }
        setLoading(true);
        const latest = await fetchWeather();
        if (active) {
          setWeather(latest);
          setError(false);
        }
      } catch {
        if (active) setError(true);
      } finally {
        running = false;
        if (active) setLoading(false);
      }
    }
    void update();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void update();
    }, WEATHER_TTL);
    const resume = () => {
      if (document.visibilityState === 'visible') void update();
    };
    document.addEventListener('visibilitychange', resume);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [online]);
  return { weather, loading, error, online };
}
