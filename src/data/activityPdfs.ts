import type { Activity } from './schema';

// Regras genéricas; nomes e caminhos reais são lidos apenas no dispositivo.
export type TripPdfRule = { label: string; terms: string[]; exclude?: string[] };
const flightOut = { label: 'Passagem de ida', terms: ['palermo', 'atenas'] };
const flightRome = { label: 'Passagem para Roma', terms: ['atenas', 'roma'] };
const parking = { label: 'Documento do estacionamento', terms: ['aeroporto', 'palermo'] };
const athensHotel = { label: 'Documento do hotel', terms: ['ilissos'] };
const romeHotel = { label: 'Documento do hotel', terms: ['ciao', 'termini'] };
const tour = { label: 'Documento do tour', terms: ['acropoli'] };
const kotsanasTicket = { label: 'Ingresso do museu', terms: ['kotsanas'], exclude: ['pagamento'] };
const kotsanasPayment = { label: 'Comprovante do museu', terms: ['kotsanas', 'pagamento'] };
const library = { label: 'Ingresso da biblioteca', terms: ['biblioteca', 'adriano'] };
const zeus = { label: 'Ingresso do templo', terms: ['templo', 'zeus'] };
const agora = { label: 'Ingresso da Ágora', terms: ['agora', 'antiga'] };
const freeTour = { label: 'Documento do passeio', terms: ['free', 'tour'] };
const vatican = { label: 'Documento dos museus', terms: ['museus', 'vaticanos'] };
const borghese = { label: 'Ingresso da galeria', terms: ['borghese'] };
const returnFlight = { label: 'Documento do voo', terms: ['ryanair', 'roma', 'palermo'] };
const documents: Record<string, TripPdfRule[]> = {
  'nov-20-parking': [parking], 'nov-26-luggage': [parking],
  'plan-1-06': [flightOut], 'plan-1-07': [flightOut], 'nov-20-az718': [flightOut],
  'plan-1-13': [athensHotel], 'plan-4-02': [athensHotel],
  'plan-2-11': [tour], 'plan-2-05': [kotsanasTicket, kotsanasPayment],
  'plan-2-03': [library], 'plan-3-09': [zeus], 'plan-3-03': [agora],
  'nov-22-checkin': [freeTour], 'nov-22-free-tour': [freeTour],
  'corr-4-airport': [flightRome], 'plan-4-06': [flightRome],
  'nov-23-checkin': [romeHotel], 'nov-26-checkout': [romeHotel],
  'nov-24-meet': [vatican], 'nov-24-vatican': [vatican],
  'nov-25-borghese': [borghese], 'nov-26-airport': [returnFlight], 'nov-26-flight': [returnFlight],
};
export const activityPdfs = (activity: Pick<Activity, 'id'>) => documents[activity.id] ?? [];
export const normalizePdfPath = (path: string) => path.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
export function matchesPdfRule(path: string, rule: TripPdfRule) {
  const name = normalizePdfPath(path.split('/').pop() ?? path);
  return rule.terms.every(term => name.includes(term)) && !(rule.exclude ?? []).some(term => name.includes(term));
}
