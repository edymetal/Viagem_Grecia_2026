import { itineraryActivities } from '../data/itineraryActivities';
import points from '../data/map-points.json';
import type { Activity } from '../data/schema';
import { mapDestination } from './domain';

type MapPoint = {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  activityIds: string[];
  source: string;
  destination?: string;
  routeTo?: string;
  driving?: boolean;
  photoActivityId?: string;
  note?: string;
};

const mapPoints: MapPoint[] = points;
const originalDestinations = new Map(
  itineraryActivities().map((activity) => [activity.id, mapDestination(activity)]),
);

export function normalizeMapSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function matchingMapPoints(activities: Activity[], search = '') {
  const query = normalizeMapSearch(search);
  const unchangedActivities = new Map(
    activities
      .filter((activity) => mapDestination(activity) === originalDestinations.get(activity.id))
      .map((activity) => [activity.id, activity]),
  );

  return mapPoints.flatMap((point) => {
    const linked = point.activityIds.flatMap((id) => unchangedActivities.get(id) ?? []);
    const [activity] = linked;
    if (!activity) return [];

    const destination = point.destination ?? mapDestination(activity);
    const labels = [point.name, destination, ...linked.map((item) => item.title)];
    if (query && !labels.some((label) => normalizeMapSearch(label).includes(query))) return [];

    return [{ ...point, activity, destination }];
  });
}
