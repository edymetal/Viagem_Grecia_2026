import {
  Clock3,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Droplets,
  Moon,
  Snowflake,
  Sun,
} from 'lucide-react';
import type { useAthensWeather } from '../hooks/useAthensWeather';
import { celsius, freshWeather, weatherDescription } from '../lib/weather';
import { Modal } from './ui';

function WeatherIcon({
  code,
  isDay = true,
  size = 20,
}: {
  code: number | null;
  isDay?: boolean;
  size?: number;
}) {
  const Icon =
    code === 0 || code === 1
      ? isDay
        ? Sun
        : Moon
      : code === 2
        ? isDay
          ? CloudSun
          : CloudMoon
        : code === 45 || code === 48
          ? CloudFog
          : [95, 96, 99].includes(code ?? -1)
            ? CloudLightning
            : [71, 73, 75, 77, 85, 86].includes(code ?? -1)
              ? Snowflake
              : [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code ?? -1)
                ? CloudRain
                : Cloud;
  return <Icon size={size} aria-hidden="true" />;
}
const athensDate = (seconds: number, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'Europe/Athens' }).format(
    new Date(seconds * 1000),
  );

export function AthensConditions({
  time,
  forecast,
  onOpen,
}: {
  time: string;
  forecast: ReturnType<typeof useAthensWeather>;
  onOpen: () => void;
}) {
  const { weather, loading, error, online } = forecast;
  const stale =
    !!weather &&
    (!online ||
      error ||
      !freshWeather(weather) ||
      Date.now() - weather.current.time * 1000 > 45 * 60_000);
  return (
    <>
      <div className="athens-conditions" aria-label="Horário e tempo em Atenas">
        <span className="athens-time">
          <Clock3 size={15} />
          <strong>{time}</strong>
          <span>Atenas</span>
        </span>
        <button
          className="weather-summary"
          onClick={onOpen}
          aria-label="Ver previsão do tempo de Atenas"
        >
          <WeatherIcon code={weather?.current.code ?? null} isDay={weather?.current.isDay} />
          <strong>
            {weather?.current.temperature != null ? celsius(weather.current.temperature) : '— °C'}
          </strong>
          <span className="weather-condition">
            {weather
              ? weatherDescription(weather.current.code)
              : loading
                ? 'Consultando tempo…'
                : 'Tempo indisponível'}
          </span>
          {stale && <small className="weather-stale">Salvo</small>}
          {!online && !weather && <small className="weather-stale">Offline</small>}
        </button>
      </div>
    </>
  );
}
export function AthensWeatherDetails({
  forecast,
  onClose,
}: {
  forecast: ReturnType<typeof useAthensWeather>;
  onClose: () => void;
}) {
  const { weather, loading, error, online } = forecast;
  const stale =
    !!weather &&
    (!online ||
      error ||
      !freshWeather(weather) ||
      Date.now() - weather.current.time * 1000 > 45 * 60_000);
  return (
    <Modal title="Tempo em Atenas" onClose={onClose}>
      <div className="weather-details">
        {weather ? (
          <>
            {(stale || !online) && (
              <p className="notice" role="status">
                {!online ? 'Sem conexão. ' : 'Sem atualização recente. '}Exibindo dados salvos em{' '}
                {athensDate(weather.fetchedAt / 1000, {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                , horário de Atenas.
              </p>
            )}
            <div className="weather-current">
              <WeatherIcon code={weather.current.code} isDay={weather.current.isDay} size={46} />
              <div>
                <span>{stale ? 'Último dado salvo' : 'Condição atual'}</span>
                <strong>{celsius(weather.current.temperature)}</strong>
                <p>{weatherDescription(weather.current.code)}</p>
              </div>
            </div>
            <p className="small muted">
              Referência dos dados:{' '}
              {athensDate(weather.current.time, {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              · Atenas.
            </p>
            <h3>Previsão por dia</h3>
            <div className="weather-days">
              {weather.days.map((day) => (
                <article key={day.time}>
                  <div className="weather-day-date">
                    <strong>{athensDate(day.time, { weekday: 'short' })}</strong>
                    <span>{athensDate(day.time, { day: '2-digit', month: '2-digit' })}</span>
                  </div>
                  <WeatherIcon code={day.code} size={25} />
                  <div className="weather-day-description">
                    <strong>{weatherDescription(day.code)}</strong>
                    <span>
                      Mín. {celsius(day.min)} · máx. {celsius(day.max)}
                    </span>
                    <small>
                      <Droplets size={12} />
                      {day.rain === null
                        ? 'Chance de chuva não informada'
                        : `${day.rain}% de chance de chuva`}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="notice" role="status">
            {loading
              ? 'Consultando o tempo de Atenas…'
              : !online
                ? 'Sem conexão e sem previsão salva neste dispositivo.'
                : 'Não foi possível consultar o tempo. A consulta será tentada novamente ao retomar o aplicativo ou na próxima atualização.'}
          </p>
        )}
        <p className="weather-source">
          Dados de{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>{' '}
          ·{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
            CC BY 4.0
          </a>
          . Temperaturas em Celsius; fuso Europe/Athens. Atualizações precisam de internet.
        </p>
      </div>
    </Modal>
  );
}
