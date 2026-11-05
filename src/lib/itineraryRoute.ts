import { tripDates } from '../data/schema';

// Hash routes also work after reloads and offline on a GitHub Pages subdirectory.
export function itineraryRoute(route: string) {
  const [, date, encodedId] = route.split('/');
  const day = tripDates.find((d) => d === date);
  let activityId = '';
  try {
    activityId = encodedId ? decodeURIComponent(encodedId) : '';
  } catch {
    // Malformed links fall back to the day list without touching stored data.
  }
  return { day, activityId };
}

export const itineraryHref = (day: string, activityId?: string) =>
  `#roteiro/${day}${activityId ? `/${encodeURIComponent(activityId)}` : ''}`;
