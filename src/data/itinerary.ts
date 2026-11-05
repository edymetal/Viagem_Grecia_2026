import rows from './itinerary-activities.json' with { type: 'json' };
import { emptyActivity, emptyState } from './factories';
import { stateSchema, tripDates, type Activity, type AppState, type Expense } from './schema';

// Supplied planning data. Prices/availability have not been independently rechecked.
// No booking codes, age, personal documents or paid reservations are embedded.
export const ITINERARY_REVISION = 'cronograma-2026-11-05';
const hh = 'https://hhticket.gr/';
const museum = 'https://www.theacropolismuseum.gr/en/plan-your-visit';
const museumTickets = 'https://etickets.theacropolismuseum.gr/';
const kotsanas = 'https://kotsanas.com/athens/';
const hotel = 'https://www.adamshotel.gr/location';
const hotelAddress = 'Cherefodos, 6, Plaka, Atenas';
const acropolisGuide =
  'https://www.getyourguide.com/athens-l91/full-athens-acropolis-pnyx-philopappou-agora-anafiotik-t1239169/';
const museumGuide =
  'https://www.getyourguide.com/pt-br/atenas-l91/excursao-pelas-obras-primas-do-museu-da-acropole-t1167645/';

const details: Record<string, Partial<Activity>> = {
  'plan-1-01': { location: 'Estação Santo Stefano di Camastra–Mistretta' },
  'plan-1-02': {
    location: 'Palermo Centrale',
    notes:
      'Regional 12863. Consulta de €14,40 para o conjunto dos dois trens de ida até o aeroporto; não por trem. Não comprado.',
  },
  'plan-1-03': { location: 'Palermo Centrale', duration: 21 },
  'plan-1-04': {
    location: 'Palermo Aeroporto',
    notes: 'Regional 21721, incluído nos €14,40 consultados para toda a ida ferroviária.',
  },
  'plan-1-05': { location: 'Aeroporto de Palermo' },
  'plan-1-06': { location: 'Aeroporto de Palermo' },
  'plan-1-07': {
    location: 'Aeroporto de Palermo',
    notes:
      'ITA Airways, Economy Light. Chegada às 18h35 de Atenas; duração total fornecida: 5h. Ida e volta consultadas por €206,01, sem compra realizada.',
  },
  'plan-1-08': {
    location: 'Roma–Fiumicino',
    duration: 105,
    notes: 'Espera de 1h45; horários intermediários não fornecidos.',
  },
  'plan-1-09': { location: 'Aeroporto de Atenas' },
  'plan-1-10': { timeCertainty: 'Estimativa', location: 'Estação de metrô do aeroporto de Atenas' },
  'plan-1-11': {
    price: 20,
    priceCertainty: 'Consultado',
    location: 'Estação de metrô do aeroporto de Atenas',
    website: 'https://www.oasa.gr/en/tickets/prices-of-products/',
    notes:
      '72h de transporte urbano ilimitado e ida/volta do aeroporto dentro da validade. Guardar e validar o mesmo bilhete na entrada e saída. Exemplo fornecido, não uma ativação realizada: sexta 19h30 → segunda 19h30.',
  },
  'plan-1-12': {
    timeCertainty: 'Estimativa',
    address: hotelAddress,
    website: hotel,
    notes:
      'Linha 3 azul → Syntagma; linha 2 vermelha sentido Elliniko → Akropoli. Caminhar 5–8 min; hotel a aproximadamente 350 m da estação. Rota indicada pelo hotel. Intervalo inclui espera. Passe de €20 cadastrado separadamente.',
  },
  'plan-1-13': {
    timeCertainty: 'Estimativa',
    address: hotelAddress,
    website: hotel,
    notes:
      'Hotel escolhido, ainda não reservado. Janela de chegada 20h30–21h se sobrepõe ao deslocamento previsto até 20h40; revisar sem alterar os horários originais.',
  },
  'plan-1-14': { location: 'Plaka, Atenas' },
  'plan-2-02': { location: 'Monastiraki, Atenas' },
  'plan-2-03': {
    location: 'Biblioteca de Adriano, Atenas',
    openingHours: 'Inverno: 08h–15h; última entrada 14h40 (conforme cronograma).',
    website:
      'https://www.visitgreece.gr/en/experiences/culture/archaeological-sites-monuments/the-roman-agora-and-hadrians-library',
    ticketUrl: hh,
  },
  'plan-2-04': { location: 'Museu Kotsanas, Atenas' },
  'plan-2-05': {
    location: 'Museu Kotsanas, Atenas',
    openingHours: 'Diariamente: 10h–18h (conforme cronograma).',
    website: kotsanas,
    ticketUrl: kotsanas,
    notes:
      '€7 é a exposição principal, mantida no orçamento. Alternativa de três exposições: €12, substituindo o ingresso de €7 e acrescentando €5 e mais tempo.',
  },
  'plan-2-06': { location: 'Plaka, Atenas' },
  'plan-2-07': { location: 'Plaka, Atenas' },
  'plan-2-08': { location: 'Anafiotika, Atenas' },
  'plan-2-09': { address: hotelAddress },
  'plan-2-10': {
    timeCertainty: 'Proposto',
    notes:
      'Por volta de 14h10, a confirmar. Local exato depende do voucher da Carlimar; não presumir ponto de encontro.',
  },
  'plan-2-11': {
    timeCertainty: 'Proposto',
    location: 'Acrópole de Atenas',
    openingHours: 'Inverno: 08h–17h (conforme cronograma).',
    website: hh,
    ticketUrl: hh,
    guideUrl: acropolisGuide,
    notes:
      'Proposta de 14h30–16h30, sem vaga garantida; substitui o horário anterior de 15h. €30 é somente ingresso; guia tem preço pendente. Reservar somente guia Carlimar/GetYourGuide e depois ingresso oficial compatível. Partenon incluído no sítio, sem ingresso separado. Teatro de Dionísio, Erechtheion e demais monumentos dependem do guia e dos acessos abertos.',
  },
  'plan-2-12': { location: 'Plaka, Atenas' },
  'plan-2-13': { location: 'Plaka / Monastiraki, Atenas' },
  'plan-2-14': { location: 'Plaka, Atenas' },
  'plan-3-02': { location: 'Ágora Antiga, Atenas' },
  'plan-3-03': {
    location: 'Ágora Antiga, Atenas',
    openingHours: 'Inverno: 08h–17h (conforme cronograma).',
    website: 'https://www.hh.gr/en/destinations/ancient-agora-athens/',
    ticketUrl: hh,
    notes:
      'Templo de Hefesto e Museu da Ágora na Estoa de Átalo incluídos no ingresso do sítio. Visita sem guia humano.',
  },
  'plan-3-04': { location: 'Praça Syntagma, Atenas' },
  'plan-3-05': { location: 'Parlamento, Praça Syntagma, Atenas' },
  'plan-3-06': {
    location: 'Parlamento, Praça Syntagma, Atenas',
    notes: 'Cerimônia dominical especial informada para 11h.',
  },
  'plan-3-07': { location: 'Jardim Nacional, Atenas' },
  'plan-3-08': { location: 'Templo de Zeus Olímpico, Atenas' },
  'plan-3-09': {
    location: 'Templo de Zeus Olímpico, Atenas',
    openingHours: 'Inverno: fecha 15h; última entrada 14h40 (conforme cronograma).',
    website: 'https://accessible.thisisathens.org/place/1742',
    ticketUrl: hh,
  },
  'plan-3-10': { location: 'Arco de Adriano, Atenas' },
  'plan-3-11': { location: 'Akropoli / Museu da Acrópole, Atenas' },
  'plan-3-12': {
    timeCertainty: 'Proposto',
    notes: 'Ponto exato a conferir no voucher; depende da confirmação do guia.',
  },
  'plan-3-13': {
    timeCertainty: 'Proposto',
    location: 'Museu da Acrópole, Atenas',
    openingHours:
      'Domingos: 09h–20h. Escavação: fecha 17h, última entrada 16h30 (conforme cronograma).',
    website: museum,
    ticketUrl: museumTickets,
    guideUrl: museumGuide,
    notes:
      'Carlimar/GetYourGuide, somente guia. Horário e preço final pendentes: o dia 22 apareceu selecionável em português, mas os detalhes não carregaram na consulta anterior. €20 é somente ingresso do museu e escavação. Domingo precisa ser reorganizado se o horário do guia mudar.',
  },
  'plan-3-14': {
    confirmation: 'Sugestão',
    location: 'Museu da Acrópole, Atenas',
    website: museum,
    notes:
      'Incluído no ingresso existente: não somar outra entrada. Escavação fecha 17h e última entrada às 16h30, exatamente quando o tour proposto termina. Verificar visita antes do guia ou reorganizar conforme a reserva; acesso após o tour não está garantido.',
  },
  'plan-3-15': { address: hotelAddress },
  'plan-3-16': { location: 'Plaka, Atenas' },
  'plan-4-02': { address: hotelAddress },
  'plan-4-03': { location: 'Estação Akropoli, Atenas' },
  'plan-4-04': {
    timeCertainty: 'Estimativa',
    location: 'Aeroporto de Atenas',
    website: 'https://www.stasy.gr/en/contact/faq/',
    notes:
      'Conferir letreiro Airport: nem todos os trens da linha 3 vão ao aeroporto. Frequência aeroportuária informada: 36 min. Usar o mesmo passe, dentro da validade; não somar nova tarifa.',
  },
  'plan-4-05': { timeCertainty: 'Estimativa', location: 'Aeroporto de Atenas' },
  'plan-4-06': { location: 'Aeroporto de Atenas' },
  'plan-4-07': {
    location: 'Roma–Fiumicino',
    duration: 200,
    notes: 'Conexão de 3h20. Horários intermediários não fornecidos.',
  },
  'plan-4-08': { location: 'Aeroporto de Palermo' },
  'plan-4-09': { timeCertainty: 'Estimativa', location: 'Aeroporto de Palermo' },
  'plan-4-10': {
    location: 'Aeroporto de Palermo',
    notes: 'Preço não informado; não foi presumido.',
  },
  'plan-4-11': {
    location: 'Palermo Centrale',
    notes:
      'Regional 5628. €14,40 consultados para o conjunto dos dois trens da volta, não por trem; sem compra realizada.',
  },
  'plan-4-12': { location: 'Palermo Centrale', duration: 18 },
  'plan-4-13': {
    location: 'Santo Stefano di Camastra–Mistretta',
    notes: 'Regional 12928, incluído nos €14,40 da volta ferroviária.',
  },
  'plan-4-14': { location: 'Santo Stefano di Camastra–Mistretta' },
};
type Route = [Activity['transport']['mode'], string, string, string?];
const routes: Record<string, Route> = {
  'plan-1-02': [
    'Trem',
    'Santo Stefano di Camastra–Mistretta',
    'Palermo Centrale',
    'Regional 12863',
  ],
  'plan-1-04': ['Trem', 'Palermo Centrale', 'Palermo Aeroporto', 'Regional 21721'],
  'plan-1-05': ['A pé', 'Estação Palermo Aeroporto', 'Embarques do aeroporto de Palermo'],
  'plan-1-12': [
    'Metrô',
    'Aeroporto de Atenas',
    'Adam’s Hotel, Plaka',
    '3 azul → Syntagma; 2 vermelha, sentido Elliniko → Akropoli',
  ],
  'plan-2-02': ['A pé', 'Adam’s Hotel, Plaka', 'Monastiraki, Atenas'],
  'plan-2-04': ['A pé', 'Biblioteca de Adriano, Atenas', 'Museu Kotsanas, Atenas'],
  'plan-2-06': ['A pé', 'Museu Kotsanas, Atenas', 'Plaka, Atenas'],
  'plan-2-12': ['A pé', 'Acrópole de Atenas', 'Plaka, Atenas'],
  'plan-3-02': ['A pé', 'Adam’s Hotel, Plaka', 'Ágora Antiga, Atenas'],
  'plan-3-04': ['A pé', 'Ágora Antiga, Atenas', 'Praça Syntagma, Atenas'],
  'plan-3-08': ['A pé', 'Jardim Nacional / Zappeion, Atenas', 'Templo de Zeus Olímpico, Atenas'],
  'plan-3-15': ['A pé', 'Museu da Acrópole, Atenas', 'Adam’s Hotel, Plaka'],
  'plan-4-03': ['A pé', 'Adam’s Hotel, Plaka', 'Estação Akropoli, Atenas'],
  'plan-4-04': ['Metrô', 'Akropoli, Atenas', 'Aeroporto de Atenas', '2 → Syntagma; 3 → Airport'],
  'plan-4-11': ['Trem', 'Palermo Aeroporto', 'Palermo Centrale', 'Regional 5628'],
  'plan-4-13': [
    'Trem',
    'Palermo Centrale',
    'Santo Stefano di Camastra–Mistretta',
    'Regional 12928',
  ],
};
function activities(): Activity[] {
  return rows.map((row) => {
    const base = emptyActivity(tripDates[row.day]);
    const price = (row.cost || row.details).match(/€([\d.,]+)(?:[–-]€?([\d.,]+))?/);
    const isFood = /Café|Almoço|Jantar|jantar/.test(row.title);
    const a: Activity = {
      ...base,
      id: row.id,
      title: row.title,
      start: row.start,
      end: row.end,
      timeZone:
        (row.day === 0 && Number(row.id.slice(-2)) <= 8) ||
        (row.day === 3 && Number(row.id.slice(-2)) >= 7)
          ? 'Europe/Rome'
          : 'Europe/Athens',
      timeNote: row.timeNote,
      timeCertainty: /Trem|Voo|Chegada prevista|Chegada a Santo/.test(row.title)
        ? 'Consultado'
        : 'Planejado',
      confirmation: 'Planejada',
      description: row.details,
      notes: '',
      price: price ? Number(price[1].replace(',', '.')) : row.cost === 'Grátis' ? 0 : null,
      priceMax: price?.[2] ? Number(price[2].replace(',', '.')) : null,
      priceCertainty: isFood
        ? 'Estimativa'
        : price || row.cost === 'Grátis'
          ? 'Consultado'
          : 'Não informado',
      ...details[row.id],
    };
    if (isFood)
      a.notes += `${a.notes ? '\n' : ''}Estimativa incluída na faixa global de alimentação (€80–120); não somada novamente em Gastos.${row.title.startsWith('Café') ? ' Café da manhã só é pago à parte se não incluído no hotel, o que ainda está pendente.' : ''}`;
    if (routes[row.id]) {
      const [mode, origin, destination, lines = ''] = routes[row.id];
      a.transport = {
        ...a.transport,
        mode,
        origin,
        destination,
        lines,
        station: mode === 'Metrô' ? 'Akropoli' : '',
        certainty: mode === 'Trem' ? 'Não informado' : 'Estimativa',
        notes: `${row.details}${a.notes ? '\n' + a.notes : ''}`,
      };
      const minutes = mode === 'A pé' ? row.details.match(/(\d+)[–-](\d+)\s*min/) : null;
      if (minutes) {
        a.transport.minutes = Number(minutes[1]);
        a.transport.minutesMax = Number(minutes[2]);
      }
    }
    return a;
  });
}
function expense(
  key: string,
  title: string,
  category: Expense['category'],
  amount: number,
  day: number,
  notes = '',
  amountMax?: number,
): Expense {
  return {
    id: `plan-exp-${key}`,
    title,
    category,
    amount,
    amountMax,
    date: tripDates[day],
    status: 'Previsto',
    paid: false,
    certainty: amountMax ? 'Estimativa' : 'Consultado',
    notes:
      `${notes}\nValor fornecido no planejamento, sem compra ou pagamento confirmado. A data é referência no roteiro, não data de compra.`.trim(),
  };
}
export function suppliedItinerary(): AppState {
  const s = emptyState();
  s.itineraryRevision = ITINERARY_REVISION;
  s.activities = activities();
  const notes = [
    'Trem desde Santo Stefano di Camastra, via Palermo; ITA com conexão em Roma. Horários locais da Itália e de Atenas estão identificados. Revisar janela de check-in 20h30–21h: o deslocamento está previsto até 20h40.',
    'Guia da Acrópole em português: solicitar 14h30–16h30, ainda sem vaga garantida. Reservar somente guia e depois ingresso oficial compatível. Partenon incluído no sítio, sem entrada separada.',
    'Todo o domingo permanece ajustável até confirmar horário e preço do guia do Museu da Acrópole (proposta 14h30–16h30). Última entrada na escavação às 16h30, exatamente no fim proposto do tour: verificar visita antes do guia ou reorganizar. Ágora Antiga sem guia humano.',
    'Saída do hotel antes do limite de 11h. Conferir letreiro Airport no metrô. Atenas está uma hora à frente da Itália. Voos e trens apenas consultados, ainda não comprados.',
  ];
  s.days.forEach((d, i) => {
    d.notes = notes[i];
  });
  s.expenses = [
    expense(
      'flights',
      'ITA Economy Light · ida e volta',
      'Passagens aéreas',
      206.01,
      0,
      'Último total consultado diretamente na ITA; não valor por trecho.',
    ),
    expense(
      'train-out',
      'Trens na Sicília · ida',
      'Transporte',
      14.4,
      0,
      'Consulta Trainline: regionais 12863 e 21721 em conjunto.',
    ),
    expense(
      'train-home',
      'Trens na Sicília · volta',
      'Transporte',
      14.4,
      3,
      'Consulta Trainline: regionais 5628 e 12928 em conjunto.',
    ),
    expense(
      'pass',
      'Passe turístico de 3 dias',
      'Transporte',
      20,
      0,
      '72h de transporte urbano e ida/volta do aeroporto dentro da validade.',
    ),
    expense('hadrian', 'Biblioteca de Adriano · ingresso', 'Ingressos', 10, 1),
    expense(
      'kotsanas',
      'Kotsanas · exposição principal',
      'Ingressos',
      7,
      1,
      'Alternativa de €12 não incluída.',
    ),
    expense(
      'acropolis',
      'Acrópole e Partenon · ingresso',
      'Ingressos',
      30,
      1,
      'Guia separado, preço pendente.',
    ),
    expense('agora', 'Ágora Antiga e museu · ingresso', 'Ingressos', 20, 2),
    expense('zeus', 'Templo de Zeus Olímpico · ingresso', 'Ingressos', 20, 2),
    expense(
      'museum',
      'Museu da Acrópole e escavação · ingresso',
      'Ingressos',
      20,
      2,
      'Guia separado, preço pendente. Tempo adicional não gera nova entrada.',
    ),
    expense(
      'food',
      'Alimentação · estimativa global dos quatro dias',
      'Alimentação',
      80,
      0,
      'Faixa global €80–120. Não é gasto de um único dia. As refeições do roteiro não são somadas novamente. Ao registrar refeições realizadas, reduza/substitua esta previsão para evitar duplicidade.',
      120,
    ),
  ];
  s.hotel = {
    name: 'Adam’s Hotel',
    address: hotelAddress,
    checkIn: '20/11/2026 · a partir de 15h (Atenas); chegada estimada 20h30–21h',
    checkOut: '23/11/2026 · até 11h (Atenas); saída planejada 08h–08h15',
    website: hotel,
    notes:
      'Escolhido em Plaka, três noites, um adulto. Ainda não reservado. Preço final, taxas, café da manhã e cancelamento pendentes. €240 pelas três noites é apenas uma simulação com limite de €80/noite, não uma cotação. Akropoli a aproximadamente 350 m.\nInformações: https://adamshotel.reserve-online.net/about\nOpção de reserva: https://www.booking.com/hotel/gr/adams-athens.pt-pt.html?checkin=2026-11-20&checkout=2026-11-23&group_adults=1&no_rooms=1',
  };
  s.hotel.notes +=
    '\nCaptura enviada pelo viajante: anúncio da Booking.com, sem comprovante de reserva ou preço final. Café da manhã destacado no anúncio não comprova inclusão na tarifa. A captura e os dados da conta não são incorporados ao repositório.';
  s.flights = [
    {
      id: 'plan-flight-out',
      origin: 'Palermo (via Roma–Fiumicino)',
      destination: 'Atenas',
      departure: '20/11/2026 12h35 · Itália (Europe/Rome)',
      arrival: '20/11/2026 18h35 · Grécia (Europe/Athens)',
      confirmation: 'Consultado',
      notes:
        'ITA Airways · Economy Light. Não comprado. Conexão 1h45; duração total fornecida 5h. Ida e volta juntas €206,01. Números dos voos e horários intermediários não fornecidos.',
    },
    {
      id: 'plan-flight-home',
      origin: 'Atenas (via Roma)',
      destination: 'Palermo',
      departure: '23/11/2026 12h45 · Grécia (Europe/Athens)',
      arrival: '23/11/2026 18h20 · Itália (Europe/Rome)',
      confirmation: 'Consultado',
      notes:
        'ITA Airways · Economy Light. Não comprado. Conexão 3h20. Incluído no total de ida e volta de €206,01. Números dos voos e horários intermediários não fornecidos.',
    },
  ];
  s.useful = {
    ...s.useful,
    publicTransport:
      'Metrô e caminhadas. Passe 3-day Tourist Ticket: €20; 72h de transporte urbano e ida/volta do aeroporto dentro da validade. Guardar o mesmo bilhete e validar entrada/saída. Exemplo de validade: sexta 19h30 → segunda 19h30, não ativação confirmada.\nIda: linha 3 azul → Syntagma; linha 2 vermelha sentido Elliniko → Akropoli; 5–8 min a pé ao hotel.\nVolta: linha 2 → Syntagma; linha 3 com letreiro Airport. Nem todos os trens vão ao aeroporto. Frequência aeroportuária informada: 36 min.\nFontes do texto: https://www.oasa.gr/en/tickets/prices-of-products/ e https://www.stasy.gr/en/contact/faq/',
    tickets:
      'Primeiro reservar os dois guias Carlimar/GetYourGuide em português, SOMENTE GUIA. Depois comprar ingressos oficiais com horários compatíveis; não comprar modalidade GetYourGuide com entrada incluída.\nIntegrais: Acrópole/Partenon €30; Ágora Antiga/museu €20; Biblioteca de Adriano €10; Zeus €20; Museu da Acrópole/escavação €20; Kotsanas principal €7. Total €107 sem guias. Sem desconto por idade no orçamento.\nhttps://hhticket.gr/\nhttps://etickets.theacropolismuseum.gr/\nhttps://kotsanas.com/athens/',
    importantTimes:
      'Horários locais: Atenas uma hora à frente da Itália em novembro. Guias propostos, não confirmados: Acrópole sábado 14h30–16h30; Museu domingo 14h30–16h30.\nBiblioteca de Adriano 08h–15h, última entrada 14h40. Acrópole 08h–17h. Ágora Antiga 08h–17h. Kotsanas 10h–18h. Zeus fecha 15h, última entrada 14h40. Museu domingo 09h–20h; escavação fecha 17h, última entrada 16h30. Guarda dominical às 11h. Horários conforme texto fornecido, não revalidados pelo app.',
    personalNotes:
      'Planejamento fornecido, nenhuma compra ou reserva realizada. Escadas, entradas dos sítios e pausas podem acrescentar minutos aos deslocamentos estimados. Estádio Panatenaico removido do roteiro.\nSubtotal fornecido €361,81 sem hotel, alimentação e guias; com alimentação €441,81–481,81. Hotel e dois guias pendentes. Se o hotel custar €240: simulação €681,81–721,81 MAIS guias, compras e taxas eventuais; não é orçamento fechado.',
  };
  s.checklist = [
    'Comprar voos ITA após conferir condições e disponibilidade',
    'Comprar os trens de ida e volta na Sicília',
    'Reservar Adam’s Hotel e confirmar preço, taxas, café e cancelamento',
    'Confirmar horário e preço do guia da Acrópole em português, somente guia',
    'Confirmar horário e preço do guia do Museu da Acrópole, somente guia',
    'Comprar ingressos oficiais somente após compatibilizar os guias',
    'Verificar visita à escavação antes do tour de domingo',
    'Fazer check-in online quando disponível',
    'Comprar e validar o passe turístico na chegada; guardar o mesmo bilhete',
    'Adicionar documentos e bilhetes localmente e exportar backup',
  ].map((title, i) => ({ id: `plan-check-${i + 1}`, title, done: false }));
  s.alternatives = [
    {
      id: 'alt-kotsanas',
      title: 'Kotsanas completo · três exposições',
      description:
        'Trocar ingresso de €7 pelo de €12, acrescentando €5 e mais tempo. Não somar dois ingressos.',
      price: 12,
      location: 'Museu Kotsanas, Atenas',
      notes:
        'Editar/substituir atividade e despesa existentes ao escolher. Sem alteração automática no orçamento.',
      website: kotsanas,
      ticketUrl: kotsanas,
    },
    {
      id: 'alt-roman-agora',
      title: 'Ágora Romana',
      description:
        'Perto da Biblioteca de Adriano. Substituir Kotsanas ou parte do sábado para não correr.',
      price: 10,
      location: 'Ágora Romana, Atenas',
      notes: 'Inverno 08h–15h; não deixar para o fim da tarde. Horário da visita não definido.',
      website: 'https://www.hh.gr/en/destinations/roman-agora-athens/',
      ticketUrl: hh,
    },
    {
      id: 'alt-hills',
      title: 'Colinas de Filopapo/Pnyx',
      description:
        'Caminhada opcional com luz do dia, substituindo outro bloco. Não acrescentar após a Acrópole ao anoitecer.',
      price: null,
      location: 'Filopapo / Pnyx, Atenas',
      notes: 'Preço e duração não fornecidos.',
      website: '',
      ticketUrl: '',
    },
    {
      id: 'alt-more-museum',
      title: 'Mais tempo no Museu da Acrópole',
      description: 'Permanecer após o guia; útil se chover. Escavação tem fechamento diferente.',
      price: null,
      location: 'Museu da Acrópole, Atenas',
      notes:
        'Incluído no ingresso existente; não criar outra despesa. Verificar entrada na escavação antes do limite de 16h30.',
      website: museum,
      ticketUrl: museumTickets,
    },
  ];
  return stateSchema.parse(s);
}
