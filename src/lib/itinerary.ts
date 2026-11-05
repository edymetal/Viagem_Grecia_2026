import { ITINERARY_REVISION, suppliedItinerary } from '../data/itinerary';
import { stateSchema, type AppState } from '../data/schema';

// Add the supplied plan once, preserving local edits, documents and existing expenses.
export function mergeItinerary(current: AppState, includeExpenses = current.expenses.length === 0) {
  const next = structuredClone(current);
  if (current.itineraryRevision === ITINERARY_REVISION) return next;
  const plan = suppliedItinerary();
  const norm = (s: string) => s.trim().toLocaleLowerCase('pt-BR');
  next.activities.push(
    ...plan.activities.filter(
      (a) =>
        !next.activities.some(
          (b) => b.id === a.id || (b.date === a.date && norm(b.title) === norm(a.title)),
        ),
    ),
  );
  if (includeExpenses)
    next.expenses.push(
      ...plan.expenses.filter(
        (a) => !next.expenses.some((b) => b.id === a.id || norm(b.title) === norm(a.title)),
      ),
    );
  next.flights.push(...plan.flights.filter((a) => !next.flights.some((b) => b.id === a.id)));
  next.checklist.push(
    ...plan.checklist.filter(
      (a) => !next.checklist.some((b) => b.id === a.id || norm(b.title) === norm(a.title)),
    ),
  );
  next.alternatives = [
    ...(next.alternatives || []),
    ...plan.alternatives!.filter((a) => !next.alternatives?.some((b) => b.id === a.id)),
  ];
  next.days.forEach((d) => {
    if (!d.notes) d.notes = plan.days.find((p) => p.date === d.date)!.notes;
  });
  if (!next.hotel.name && !next.hotel.address) next.hotel = plan.hotel;
  for (const key of Object.keys(next.useful) as (keyof AppState['useful'])[])
    if (!next.useful[key]) next.useful[key] = plan.useful[key];
  next.itineraryRevision = ITINERARY_REVISION;
  return stateSchema.parse(next);
}
