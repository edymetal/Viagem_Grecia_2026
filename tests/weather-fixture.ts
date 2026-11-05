// Deliberately synthetic temperatures for automated tests; never imported by the app.
export function weatherFixture() {
  return {
    timezone: 'Europe/Athens',
    current_units: { time: 'unixtime', temperature_2m: '°C' },
    daily_units: { time: 'unixtime', temperature_2m_min: '°C', temperature_2m_max: '°C' },
    current: {
      time: Math.floor(Date.now() / 1000),
      temperature_2m: 18.3,
      weather_code: 2,
      is_day: 1,
    },
    daily: {
      time: [1793916000, 1794002400, 1794088800, 1794175200],
      temperature_2m_min: [12, 13, 11, 10],
      temperature_2m_max: [21, 22, 18, 19],
      weather_code: [2, 0, 61, 3],
      precipitation_probability_max: [10, 0, 75, 20],
    },
  };
}
