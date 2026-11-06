import type { Activity } from '../data/schema';
import { activityInstant } from './domain';

// Each connector spans the two times shown beside its endpoints, in their own zones.
export function timelinePosition(activity: Activity, next: Activity | undefined, now: Date) {
  const start = activityInstant(activity);
  if (!Number.isFinite(start)) return { progress: 0, state: 'untimed' } as const;
  const nextStart = next ? activityInstant(next) : NaN;
  const end = nextStart > start ? nextStart : activityInstant(activity, 'end');
  const duration = end > start ? end - start : 0;
  const elapsed = now.getTime() - start;
  const progress = duration ? Math.max(0, Math.min(1, elapsed / duration)) : Number(elapsed >= 0);
  const state = elapsed < 0 ? 'upcoming' : duration && elapsed < duration ? 'current' : 'elapsed';
  return { progress, state } as const;
}
