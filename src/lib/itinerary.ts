import { ITINERARY_REVISION, suppliedItinerary } from '../data/itinerary';
import { activitySchema, stateSchema, type AppState } from '../data/schema';
import previousData from '../data/itinerary-previous.json' with { type: 'json' };

// This snapshot contains only the public plan shipped with revision 1, never user data.
export const previousItinerary = () => stateSchema.parse(previousData);

function mergeUnchanged<T extends object>(local: T, previous: T, corrected: T): T {
  const result = structuredClone(local);
  for (const key of new Set([...Object.keys(previous), ...Object.keys(corrected)]) as Set<
    keyof T
  >) {
    const before = previous[key];
    const after = corrected[key];
    if (JSON.stringify(local[key]) === JSON.stringify(before)) {
      if (key in corrected) result[key] = structuredClone(after);
      else delete result[key];
    } else if (
      before &&
      after &&
      typeof before === 'object' &&
      typeof after === 'object' &&
      !Array.isArray(after) &&
      local[key] &&
      typeof local[key] === 'object'
    ) {
      result[key] = mergeUnchanged(
        local[key] as object,
        before as object,
        after as object,
      ) as T[keyof T];
    }
  }
  return result;
}

/** Upgrade only the known previous revision. Local edits, deletions and order win. */
export function correctItinerary(current: AppState): AppState {
  if (current.itineraryRevision !== previousData.itineraryRevision) return current;
  const previous = previousItinerary();
  const plan = suppliedItinerary();
  const next = structuredClone(current);
  next.activities = next.activities.map((local) => {
    const before = previous.activities.find((a) => a.id === local.id);
    const after = plan.activities.find((a) => a.id === local.id);
    if (!before || !after) return local;
    const merged = activitySchema.safeParse(mergeUnchanged(local, before, after));
    // A custom start can become later than the revised end, for example. Keep
    // that valid local record intact instead of making the whole app unreadable.
    return merged.success ? merged.data : local;
  });
  // Insert new margins/access stages beside the following known stage. Existing
  // records retain their relative order, including user-created extra activities.
  plan.activities.forEach((activity, index) => {
    if (
      previous.activities.some((a) => a.id === activity.id) ||
      next.activities.some((a) => a.id === activity.id)
    )
      return;
    const following = plan.activities
      .slice(index + 1)
      .find((a) => next.activities.some((b) => b.id === a.id));
    const position = following
      ? next.activities.findIndex((a) => a.id === following.id)
      : next.activities.length;
    next.activities.splice(position, 0, activity);
  });
  next.days = next.days.map((day) =>
    mergeUnchanged(
      day,
      previous.days.find((d) => d.date === day.date)!,
      plan.days.find((d) => d.date === day.date)!,
    ),
  );
  next.hotel = mergeUnchanged(next.hotel, previous.hotel, plan.hotel);
  next.useful = mergeUnchanged(next.useful, previous.useful, plan.useful);
  next.checklist = next.checklist.map((item) => {
    const before = previous.checklist.find((c) => c.id === item.id);
    const after = plan.checklist.find((c) => c.id === item.id);
    return before && after ? mergeUnchanged(item, before, after) : item;
  });
  next.alternatives = next.alternatives?.map((item) => {
    const before = previous.alternatives?.find((a) => a.id === item.id);
    const after = plan.alternatives?.find((a) => a.id === item.id);
    return before && after ? mergeUnchanged(item, before, after) : item;
  });
  // Expenses, budget, reservations, documents and personal visit flags stay local.
  next.itineraryRevision = ITINERARY_REVISION;
  return stateSchema.parse(next);
}

// Add the supplied plan once, preserving local edits, documents and existing expenses.
export function mergeItinerary(current: AppState, includeExpenses = current.expenses.length === 0) {
  if (current.itineraryRevision === previousData.itineraryRevision)
    return correctItinerary(current);
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
