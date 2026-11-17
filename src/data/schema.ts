import { z } from 'zod';

export const tripDates = [
  '2026-11-20',
  '2026-11-21',
  '2026-11-22',
  '2026-11-23',
  '2026-11-24',
  '2026-11-25',
  '2026-11-26',
] as const;
export const activityZones = ['Europe/Athens', 'Europe/Rome'] as const;
export const categories = [
  'Passagens aéreas',
  'Hotel',
  'Transporte',
  'Alimentação',
  'Ingressos',
  'Passeios',
  'Compras',
  'Outros',
] as const;
export const documentCategories = [
  'Passagem aérea',
  'Hotel',
  'Ingresso',
  'Transporte',
  'Comprovante',
  'Código QR',
  'Outros',
] as const;
const text = z.string().max(10000);
const id = z.string().min(1).max(100);
const money = z.number().finite().min(0).max(1_000_000);
const time = z.union([z.literal(''), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)]);
const date = z.enum(tripDates);
const url = z.union([
  z.literal(''),
  z
    .url()
    .max(2000)
    .refine((v) => /^https?:\/\//.test(v), 'Use um endereço http ou https.'),
]);
export const transportSchema = z
  .object({
    mode: z.enum([
      'Não informado',
      'A pé',
      'Metrô',
      'Trem',
      'Avião',
      'Carro',
      'Transporte público',
      'Outro',
    ]),
    origin: text,
    destination: text,
    station: text,
    lines: text,
    minutes: z.number().int().min(0).max(1440).nullable(),
    minutesMax: z.number().int().min(0).max(1440).nullable().optional(),
    price: money.nullable(),
    certainty: z.enum(['Não informado', 'Confirmado', 'Estimativa']),
    notes: text,
  })
  .refine((v) => v.minutesMax == null || (v.minutes !== null && v.minutesMax >= v.minutes), {
    message: 'O tempo máximo deve ser maior ou igual ao mínimo.',
    path: ['minutesMax'],
  });
export const activitySchema = z
  .object({
    id,
    date,
    title: z.string().trim().min(1).max(200),
    start: time,
    end: time,
    timeZone: z.enum(activityZones).optional(),
    endTimeZone: z.enum(activityZones).optional(),
    timeCertainty: z
      .enum(['Planejado', 'Consultado', 'Estimativa', 'Proposto', 'Confirmado'])
      .optional(),
    timeNote: text.optional(),
    location: text.optional(),
    description: text,
    address: text,
    price: money.nullable(),
    priceMax: money.nullable().optional(),
    priceCertainty: z.enum(['Não informado', 'Confirmado', 'Consultado', 'Estimativa']),
    duration: z.number().int().min(0).max(1440).nullable(),
    openingHours: text,
    website: url,
    ticketUrl: url,
    guideUrl: url.optional(),
    notes: text,
    transport: transportSchema,
    required: z.boolean(),
    confirmation: z.enum(['Confirmada', 'Planejada', 'Pendente', 'Sugestão']),
    completed: z.boolean(),
    favorite: z.boolean().optional(),
    photoDocumentId: id.nullable(),
  })
  .refine(
    (v) => {
      if (!v.start || !v.end) return true;
      const minutes = (time: string, zone: (typeof activityZones)[number]) =>
        Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) - (zone === 'Europe/Athens' ? 60 : 0);
      const startZone = v.timeZone ?? 'Europe/Athens';
      return minutes(v.end, v.endTimeZone ?? startZone) >= minutes(v.start, startZone);
    },
    {
      message: 'O término deve ser posterior ao início (no mesmo dia).',
      path: ['end'],
    },
  )
  .refine((v) => v.priceMax == null || (v.price !== null && v.priceMax >= v.price), {
    message: 'O preço máximo deve ser maior ou igual ao mínimo.',
    path: ['priceMax'],
  });
export const expenseSchema = z
  .object({
    id,
    title: z.string().trim().min(1).max(200),
    category: z.enum(categories),
    amount: money,
    amountMax: money.nullable().optional(),
    certainty: z.enum(['Não informado', 'Consultado', 'Estimativa', 'Confirmado']).optional(),
    date: z.iso.date(),
    status: z.enum(['Previsto', 'Realizado']),
    paid: z.boolean(),
    notes: text,
  })
  .refine((v) => v.amountMax == null || v.amountMax >= v.amount, {
    message: 'O valor máximo deve ser maior ou igual ao mínimo.',
    path: ['amountMax'],
  })
  .refine(
    (v) => (v.status !== 'Realizado' && !v.paid) || v.amountMax == null || v.amountMax === v.amount,
    {
      message:
        'Uma despesa paga ou realizada precisa ter um valor exato. Remova a faixa antes de salvar.',
      path: ['amountMax'],
    },
  );
export const alternativeSchema = z.object({
  id,
  title: text,
  description: text,
  price: money.nullable(),
  notes: text,
  location: text,
  website: url,
  ticketUrl: url,
});
export const hotelSchema = z.object({
  name: text,
  address: text,
  checkIn: text,
  checkOut: text,
  notes: text,
  website: url,
});
export const usefulSchema = z.object({
  phones: text,
  emergencies: text,
  publicTransport: text,
  safety: text,
  tickets: text,
  importantTimes: text,
  personalNotes: text,
  phrasesPt: text,
  phrasesIt: text,
  phrasesEl: text,
});
const daysSchema = z
  .array(z.object({ date, notes: text }))
  .refine((days) => {
    const expected = days.length === 4 ? tripDates.slice(0, 4) : tripDates;
    return (
      days.length === expected.length &&
      expected.every((date) => days.some((day) => day.date === date))
    );
  }, 'Datas do roteiro inválidas.')
  .transform((days) =>
    tripDates.map((date) => days.find((day) => day.date === date) ?? { date, notes: '' }),
  );
export const stateSchema = z
  .object({
    tripId: z.literal('atenas-2026'),
    itineraryRevision: z.string().max(100).optional(),
    alternatives: z.array(alternativeSchema).max(30).optional(),
    days: daysSchema,
    activities: z.array(activitySchema).max(500),
    expenses: z.array(expenseSchema).max(5000),
    budget: money.nullable(),
    hotel: hotelSchema,
    romeHotel: hotelSchema.optional(),
    useful: usefulSchema,
    checklist: z
      .array(z.object({ id, title: z.string().trim().min(1).max(300), done: z.boolean() }))
      .max(500),
    flights: z
      .array(
        z.object({
          id,
          origin: text,
          destination: text,
          departure: text,
          arrival: text,
          notes: text,
          confirmation: z.enum(['Confirmado', 'Consultado', 'Estimativa']),
        }),
      )
      .max(30),
    reservations: z
      .array(z.object({ id, title: text, reference: text, notes: text, documentId: id.nullable() }))
      .max(200),
  })
  .superRefine((v, ctx) => {
    const unique = (values: string[], path: string) => {
      if (new Set(values).size !== values.length)
        ctx.addIssue({ code: 'custom', message: 'Identificadores duplicados.', path: [path] });
    };
    if (v.alternatives)
      unique(
        v.alternatives.map((a) => a.id),
        'alternatives',
      );
    for (const key of ['activities', 'expenses', 'checklist', 'flights', 'reservations'] as const)
      unique(
        v[key].map((x) => x.id),
        key,
      );
  });
export const preferencesSchema = z.object({ theme: z.enum(['system', 'light', 'dark']) });
export const MAX_LOCAL_DOCUMENTS = 100;
export const MAX_LOCAL_DOCUMENT_BYTES = 50 * 1024 * 1024;
export const documentMetaSchema = z.object({
  id,
  name: z.string().min(1).max(255),
  category: z.enum(documentCategories),
  type: z.enum(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
  createdAt: z.iso.datetime(),
});
export const backupSchema = z.object({
  format: z.literal('atenas-2026-backup'),
  version: z.literal(1),
  exportedAt: z.iso.datetime(),
  data: stateSchema,
  preferences: preferencesSchema,
  documents: z
    .array(documentMetaSchema.extend({ base64: z.string().max(14_000_000) }))
    .max(MAX_LOCAL_DOCUMENTS)
    .optional(),
});
export type AppState = z.infer<typeof stateSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type DocumentMeta = z.infer<typeof documentMetaSchema>;
export type LocalDocument = DocumentMeta & { blob: Blob };
export type Backup = z.infer<typeof backupSchema>;
