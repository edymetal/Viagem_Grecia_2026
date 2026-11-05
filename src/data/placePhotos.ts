import photos from './place-photos.json';
import type { Activity } from './schema';

// Presentation assets only: never replace itinerary facts or personal photos.
const activityPlaces: Record<string, keyof typeof photos> = {
  'plan-2-03': 'hadrian-library',
  'plan-2-05': 'kotsanas',
  'plan-2-08': 'anafiotika',
  'plan-3-03': 'ancient-agora',
  'plan-3-05': 'syntagma',
  'plan-3-06': 'syntagma',
  'plan-3-07': 'national-garden',
  'plan-3-09': 'olympian-zeus',
  'plan-3-10': 'hadrian-arch',
  'plan-3-13': 'acropolis-museum',
};
export function activityPhoto(activity: Activity) {
  const key = activityPlaces[activity.id];
  if (!key) return null;
  const photo = photos[key];
  return { ...photo, src: `${import.meta.env.BASE_URL}images/${photo.file}` };
}
export const hasVisitDetails = (activity: Activity) =>
  !!activity.openingHours || !!activityPlaces[activity.id];
