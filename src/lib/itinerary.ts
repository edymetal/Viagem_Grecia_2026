import {
  ITINERARY_REVISION,
  PARKING_EXPENSE_ID,
  RETURN_FLIGHT_EXPENSE_ID,
  suppliedItinerary,
} from '../data/itinerary';
import {
  activitySchema,
  expenseSchema,
  stateSchema,
  type Activity,
  type AppState,
  type Expense,
} from '../data/schema';
import previousData from '../data/itinerary-previous.json' with { type: 'json' };
import correctedAthensData from '../data/itinerary-athens-corrected.json' with { type: 'json' };
import beforeParkingData from '../data/itinerary-before-parking.json' with { type: 'json' };
import beforeReturnData from '../data/itinerary-before-return-confirmation.json' with { type: 'json' };

// This snapshot contains only the public plan shipped with revision 1, never user data.
export const previousItinerary = () => stateSchema.parse(previousData);
export const correctedAthensItinerary = () => stateSchema.parse(correctedAthensData);

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

function mergeActivity(local: Activity, previous: Activity, revised: Activity) {
  const merged = activitySchema.safeParse(mergeUnchanged(local, previous, revised));
  // A local start time can be later than the revised end time.
  return merged.success ? merged.data : local;
}

/** Upgrade only the known previous revision. Local edits, deletions and order win. */
export function correctAthensItinerary(current: AppState): AppState {
  if (current.itineraryRevision !== previousData.itineraryRevision) return current;
  const previous = previousItinerary();
  const plan = correctedAthensItinerary();
  const next = structuredClone(current);
  next.activities = next.activities.map((local) => {
    const before = previous.activities.find((a) => a.id === local.id);
    const after = plan.activities.find((a) => a.id === local.id);
    if (!before || !after) return local;
    return mergeActivity(local, before, after);
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
  next.itineraryRevision = plan.itineraryRevision;
  return stateSchema.parse(next);
}

const isBookingPayment = (item: Expense) =>
  item.id === PARKING_EXPENSE_ID || item.id === RETURN_FLIGHT_EXPENSE_ID;

function withBookingPayment(expenses: Expense[], payment: Expense) {
  const index = expenses.findIndex((item) => {
    if (item.id === payment.id) return true;
    const title = item.title.toLocaleLowerCase('pt-BR');
    if (payment.id === RETURN_FLIGHT_EXPENSE_ID)
      return (
        /\bfr\s*3946\b/.test(title) ||
        (item.category === 'Passagens aéreas' &&
          /\bryanair\b/.test(title) &&
          (title.includes('palermo') ||
            item.amount === payment.amount ||
            title.trim() === 'ryanair'))
      );
    return (
      title.includes('p1 lunga sosta') ||
      (item.category === 'Transporte' &&
        /estacionamento|parcheggio|parking/.test(title) &&
        (title.includes('palermo') || item.amount === payment.amount))
    );
  });
  if (index < 0) return [...expenses, payment];
  return expenses.map((item, position) =>
    position === index
      ? {
          ...item,
          amount: payment.amount,
          amountMax: undefined,
          certainty: payment.certainty,
          status: payment.status,
          paid: payment.paid,
        }
      : item,
  );
}

function applyRomeUpdate(
  local: AppState,
  plan: AppState,
  baseline: typeof beforeParkingData | typeof beforeReturnData,
  paymentId: string,
) {
  const activities = baseline.activities.map((activity) => activitySchema.parse(activity));
  const flights =
    'flights' in baseline
      ? baseline.flights.map((flight) => stateSchema.shape.flights.element.parse(flight))
      : [];
  const revised = plan.activities.filter((activity) =>
    activities.some((old) => old.id === activity.id),
  );
  const payment = plan.expenses.find((item) => item.id === paymentId)!;
  return stateSchema.parse({
    ...local,
    itineraryRevision: ITINERARY_REVISION,
    activities: reviseRecords(local.activities, activities, revised, mergeActivity),
    flights: flights.length
      ? reviseRecords(
          local.flights,
          flights,
          plan.flights.filter((flight) => flights.some((old) => old.id === flight.id)),
        )
      : local.flights,
    days: local.days.map((day) =>
      baseline.days.some((old) => old.date === day.date && old.notes === day.notes)
        ? plan.days.find((updated) => updated.date === day.date)!
        : day,
    ),
    checklist: reviseRecords(
      local.checklist,
      baseline.checklist,
      plan.checklist.filter((item) => baseline.checklist.some((old) => old.id === item.id)),
    ),
    useful: {
      ...local.useful,
      personalNotes:
        local.useful.personalNotes === baseline.personalNotes
          ? plan.useful.personalNotes
          : local.useful.personalNotes,
    },
    expenses: withBookingPayment(local.expenses, payment),
  });
}

function reviseRecords<T extends { id: string }>(
  local: T[],
  previous: T[],
  revised: T[],
  merge = mergeUnchanged<T>,
) {
  const before = new Map(previous.map((record) => [record.id, record]));
  const after = new Map(revised.map((record) => [record.id, record]));
  const saved = new Map(local.map((record) => [record.id, record]));
  const retain = (record: T) => {
    const old = before.get(record.id);
    const updated = after.get(record.id);
    if (old && updated) return merge(record, old, updated);
    if (!old || JSON.stringify(record) !== JSON.stringify(old)) return record;
  };
  const result = revised.flatMap((record) => {
    const existing = saved.get(record.id);
    if (existing) return [retain(existing)!];
    return before.has(record.id) ? [] : [record];
  });
  const knownOrder = previous.filter((record) => saved.has(record.id)).map((record) => record.id);
  const localOrder = local.filter((record) => before.has(record.id)).map((record) => record.id);
  if (knownOrder.some((id, index) => id !== localOrder[index])) {
    const retained = new Map(result.map((record) => [record.id, record]));
    const reordered = localOrder.flatMap((id) => (retained.has(id) ? [retained.get(id)!] : []));
    let position = 0;
    result.forEach((record, index) => {
      if (before.has(record.id)) result[index] = reordered[position++];
    });
  }
  for (let index = local.length - 1; index >= 0; index--) {
    const record = local[index];
    if (after.has(record.id) || !retain(record)) continue;
    const following = local.slice(index + 1).find((item) => result.some((r) => r.id === item.id));
    const position = following ? result.findIndex((r) => r.id === following.id) : result.length;
    result.splice(position, 0, record);
  }
  return result;
}

/** Apply each known revision in order, while allowing local records and edits to win. */
export function correctItinerary(current: AppState): AppState {
  if (current.itineraryRevision === beforeParkingData.itineraryRevision) {
    const plan = suppliedItinerary();
    const withParking = applyRomeUpdate(current, plan, beforeParkingData, PARKING_EXPENSE_ID);
    return applyRomeUpdate(withParking, plan, beforeReturnData, RETURN_FLIGHT_EXPENSE_ID);
  }
  if (current.itineraryRevision === beforeReturnData.itineraryRevision)
    return applyRomeUpdate(
      current,
      suppliedItinerary(),
      beforeReturnData,
      RETURN_FLIGHT_EXPENSE_ID,
    );
  const local = correctAthensItinerary(current);
  if (local.itineraryRevision !== correctedAthensData.itineraryRevision) return local;
  const previous = correctedAthensItinerary();
  const plan = suppliedItinerary();
  const priorExpenses =
    current.itineraryRevision === previousData.itineraryRevision
      ? previousItinerary().expenses
      : previous.expenses;
  const originalAirfare = priorExpenses.find((expense) => expense.id === 'plan-exp-flights');
  const localAirfare = local.expenses.find((expense) => expense.id === 'plan-exp-flights');
  const keepAirfare =
    localAirfare && JSON.stringify(localAirfare) !== JSON.stringify(originalAirfare);
  const expensePlan = plan.expenses.filter(
    (expense) =>
      !isBookingPayment(expense) &&
      (!keepAirfare || !['plan-exp-ita-out', 'plan-exp-ita-athens-rome'].includes(expense.id)),
  );
  const expenses = reviseRecords(
    local.expenses,
    priorExpenses,
    expensePlan,
    (record, old, revised) => {
      if (record.paid || record.status === 'Realizado') return record;
      const merged = expenseSchema.safeParse(mergeUnchanged(record, old, revised));
      return merged.success ? merged.data : record;
    },
  );

  return stateSchema.parse({
    ...local,
    itineraryRevision: ITINERARY_REVISION,
    days: plan.days.map((day) => {
      const existing = local.days.find((item) => item.date === day.date);
      const old = previous.days.find((item) => item.date === day.date);
      return existing && old ? mergeUnchanged(existing, old, day) : day;
    }),
    activities: reviseRecords(
      local.activities,
      previous.activities,
      plan.activities,
      mergeActivity,
    ),
    expenses: plan.expenses.filter(isBookingPayment).reduce(withBookingPayment, expenses),
    hotel: mergeUnchanged(local.hotel, previous.hotel, plan.hotel),
    romeHotel: local.romeHotel ?? plan.romeHotel,
    useful: mergeUnchanged(local.useful, previous.useful, plan.useful),
    flights: reviseRecords(local.flights, previous.flights, plan.flights),
    checklist: reviseRecords(local.checklist, previous.checklist, plan.checklist),
    alternatives: reviseRecords(
      local.alternatives ?? [],
      previous.alternatives ?? [],
      plan.alternatives ?? [],
    ),
  });
}

// Add the supplied plan once, preserving local edits, documents and existing expenses.
export function mergeItinerary(current: AppState, includeExpenses = current.expenses.length === 0) {
  const corrected = correctItinerary(current);
  if (corrected !== current) return corrected;
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
  if (includeExpenses) {
    next.expenses.push(
      ...plan.expenses.filter(
        (a) =>
          !isBookingPayment(a) &&
          !next.expenses.some((b) => b.id === a.id || norm(b.title) === norm(a.title)),
      ),
    );
    next.expenses = plan.expenses
      .filter(isBookingPayment)
      .reduce(withBookingPayment, next.expenses);
  }
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
  next.romeHotel ??= plan.romeHotel;
  for (const key of Object.keys(next.useful) as (keyof AppState['useful'])[])
    if (!next.useful[key]) next.useful[key] = plan.useful[key];
  next.itineraryRevision = ITINERARY_REVISION;
  return stateSchema.parse(next);
}
