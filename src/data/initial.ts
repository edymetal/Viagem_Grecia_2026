import { type Activity, type AppState, tripDates } from './schema';

// Only information supplied by the traveler. No sample bookings, prices or times.
// Later itinerary integration should update this module and follow docs/CRONOGRAMA.md.
export function initialState(): AppState {
  return {
    tripId: 'atenas-2026',
    days: tripDates.map((date) => ({ date, notes: '' })),
    activities: [],
    expenses: [],
    budget: null,
    hotel: { name: '', address: '', checkIn: '', checkOut: '', notes: '', website: '' },
    useful: {
      phones: '',
      emergencies: '',
      publicTransport: '',
      safety: '',
      tickets: '',
      importantTimes: '',
      personalNotes: '',
      phrasesPt: '',
      phrasesIt: '',
      phrasesEl: '',
    },
    checklist: [],
    flights: [],
    reservations: [],
  };
}
export function emptyActivity(date: Activity['date']): Activity {
  return {
    id: crypto.randomUUID(),
    date,
    title: '',
    start: '',
    end: '',
    description: '',
    address: '',
    price: null,
    priceCertainty: 'Não informado',
    duration: null,
    openingHours: '',
    website: '',
    ticketUrl: '',
    notes: '',
    transport: {
      mode: 'Não informado',
      origin: '',
      destination: '',
      station: '',
      lines: '',
      minutes: null,
      price: null,
      certainty: 'Não informado',
      notes: '',
    },
    required: false,
    confirmation: 'Sugestão',
    completed: false,
    photoDocumentId: null,
  };
}
