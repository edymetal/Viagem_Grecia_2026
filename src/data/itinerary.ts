import { emptyState } from './factories';
import {
  itineraryActivities,
  PALERMO_PARKING_PRICE,
  RYANAIR_RETURN_BAG,
  RYANAIR_RETURN_PRICE,
  sources,
} from './itineraryActivities';
import { stateSchema, tripDates, type AppState, type Expense } from './schema';

export const ITINERARY_REVISION = 'cronograma-2026-11-17-atenas-roma-retorno-confirmado';
const parkingKey = 'parking';
const ryanairKey = 'ryanair';
export const PARKING_EXPENSE_ID = 'plan-exp-' + parkingKey;
export const RETURN_FLIGHT_EXPENSE_ID = 'plan-exp-' + ryanairKey;

const dayNotes = [
  'Palermo de carro. P1 Lunga Sosta pago, com entrada reservada às 09h00. Levar o QR code do e-mail. Atenas está uma hora à frente da Itália. Comprar e validar o passe de 72h ao chegar ao aeroporto. Chegada estimada ao Ilissos Hotel entre 20h30 e 21h.',
  'Café no hotel. Tour combinado em italiano às 09h30, com entradas incluídas e encontro até 09h15. Se o tour atrasar, encurtar Filopapo para chegar ao Kotsanas, que fecha às 18h. Licabeto à noite é opcional.',
  'Acompanhar as faixas de entrada da Biblioteca (08h30–09h30), Zeus (11h30–12h30) e Ágora (14h–15h). Troca da guarda às 11h. Conferir a mensagem do guia antes de ir ao free tour das 18h35.',
  'Check-out do Ilissos até 08h por causa do voo. Pegar um metrô da linha 3 identificado como Airport. Voo para Roma às 12h45 na Grécia e chegada às 13h55 na Itália. Ciao Termini faz check-in até 19h.',
  'Vaticano às 10h15, com encontro na Via Germanico 8 até 10h. Vicus Caprarius às 15h solicitado à secretaria. Ajustar almoço ou GAMM se o passeio anterior atrasar ou o Vicus mudar de horário.',
  'Chegar à Galleria Borghese por volta das 09h, com ingresso e documento. Sair de Flaminio às 14h30. As sessões das 16h e 17h constam no programa oficial. Ingressos a comprar.',
  'Voo Ryanair FR3946 confirmado de Fiumicino às 13h50 a Palermo às 15h00. Leonardo Express planejado para 10h05. P1 Lunga Sosta com saída reservada às 23h00 e retirada estimada entre 16h30 e 17h. Chegada a Santo Stefano estimada entre 17h30 e 19h.',
];

const checklist: [key: string, title: string, done?: boolean][] = [
  [parkingKey, 'Estacionamento P1 Lunga Sosta em Palermo reservado e pago', true],
  [
    'athens-pass',
    'Comprar e validar o passe turístico na chegada a Atenas e guardar para o retorno',
  ],
  [
    'athens-free-tour',
    'Conferir horário e ponto de encontro do free tour de Atenas nas mensagens do fornecedor',
  ],
  ['leonardo', 'Comprar os dois bilhetes do Leonardo Express e conferir a partida de 26/11'],
  ['rome-pass', 'Escolher entre o Roma 72H e bilhetes urbanos avulsos'],
  ['vicus', 'Confirmar com a secretaria o guia, horário e valor do Vicus Caprarius'],
  ['gamm', 'Comprar o ingresso na bilheteria do GAMM e conferir a promoção de terça-feira'],
  ['planetarium', 'Conferir vagas e comprar os ingressos das duas sessões do Planetário'],
  ['dinner', 'Confirmar disponibilidade e preço da feijoada na Churrascaria dos Amigos'],
  [ryanairKey, 'Fazer o check-in da Ryanair e salvar o cartão de embarque do FR3946'],
  ['ciao', 'Conferir o pagamento integral do Ciao Termini e o valor pago pelo tour do Vaticano'],
  ['transport', 'Acompanhar os avisos dos serviços de trem e metrô antes de cada deslocamento'],
  ['environment-tax', 'Conferir o pagamento da taxa ambiental de € 9 no Ilissos'],
];

function expense(
  key: string,
  title: string,
  category: Expense['category'],
  amount: number,
  day: number,
  options: Partial<Pick<Expense, 'paid' | 'certainty' | 'amountMax' | 'notes'>> = {},
): Expense {
  return {
    id: 'plan-exp-' + key,
    title,
    category,
    amount,
    date: tripDates[day],
    status: options.paid ? 'Realizado' : 'Previsto',
    paid: false,
    certainty: 'Consultado',
    notes: '',
    ...options,
  };
}

export function suppliedItinerary(): AppState {
  const state = emptyState();
  state.itineraryRevision = ITINERARY_REVISION;
  state.activities = itineraryActivities();
  state.days.forEach((day, index) => {
    day.notes = dayNotes[index];
  });

  const paid = { paid: true, certainty: 'Confirmado' } as const;
  state.expenses = [
    expense('ita-out', 'ITA · Palermo → Atenas com conexão', 'Passagens aéreas', 108.62, 0, paid),
    expense('ilissos', 'Ilissos Hotel · hospedagem', 'Hotel', 135.67, 0, paid),
    expense('acropolis-tour', 'Tour da Acrópole e Museu · com entradas', 'Passeios', 110, 1, paid),
    expense('kotsanas', 'Museu Kotsanas · ingresso', 'Ingressos', 7.42, 1, paid),
    expense('hadrian', 'Biblioteca de Adriano · ingresso', 'Ingressos', 10, 2, paid),
    expense('zeus', 'Templo de Zeus Olímpico · ingresso', 'Ingressos', 20, 2, paid),
    expense('agora', 'Ágora Antiga · ingresso', 'Ingressos', 20, 2, paid),
    expense('ita-athens-rome', 'ITA · Atenas → Roma', 'Passagens aéreas', 134.44, 3, paid),
    expense('borghese', 'Galleria Borghese · ingresso', 'Ingressos', 18, 5, paid),
    expense('pass', 'Passe turístico de Atenas · 72h', 'Transporte', 20, 0),
    expense('athens-lunch', 'Almoço de sábado em Atenas', 'Alimentação', 15, 1, {
      amountMax: 25,
      certainty: 'Estimativa',
    }),
    expense('free-tour', 'Free tour de Atenas · contribuição sugerida', 'Passeios', 10, 2, {
      amountMax: 15,
      certainty: 'Estimativa',
    }),
    expense('ilissos-tax', 'Ilissos Hotel · taxa ambiental', 'Hotel', 9, 3, {
      notes: 'Indicada para pagamento no hotel. Conferir no check-out.',
    }),
    expense('leonardo-in', 'Leonardo Express · aeroporto → Termini', 'Transporte', 14, 3),
    expense('ciao', 'Ciao Termini · total informado', 'Hotel', 224.55, 3, {
      notes: 'Inclui imposto municipal estimado. Pagamento integral a confirmar.',
    }),
    expense('vatican', 'Tour do Vaticano · preço anunciado', 'Passeios', 69, 4, {
      notes: 'Guia reservado. Conferir o valor efetivamente pago.',
    }),
    expense('vicus', 'Vicus Caprarius · guia em italiano', 'Passeios', 8, 4, {
      notes: 'Solicitação enviada. Horário a confirmar.',
    }),
    expense('gamm', 'GAMM Game Museum · bilheteria', 'Ingressos', 10, 4, {
      amountMax: 15,
      notes: '€ 10 na promoção de terça, € 15 tarifa inteira.',
    }),
    expense('emporio', 'Jantar no Empório Brasileiro', 'Alimentação', 20, 4, {
      amountMax: 30,
      certainty: 'Estimativa',
    }),
    expense('planetarium', 'Planetário de Roma · duas sessões', 'Ingressos', 17, 5, {
      notes: 'Tarifa de bilheteria. Pré-venda online acrescenta € 1 por sessão.',
    }),
    expense('leonardo-out', 'Leonardo Express · Termini → aeroporto', 'Transporte', 14, 6),
    expense(
      parkingKey,
      'Estacionamento P1 Lunga Sosta · Palermo',
      'Transporte',
      PALERMO_PARKING_PRICE,
      0,
      {
        ...paid,
        notes:
          'Reserva de 20/11 às 09h00 a 26/11 às 23h00. Acesso pelo QR code no e-mail de confirmação.',
      },
    ),
    expense(
      ryanairKey,
      'Ryanair FR3946 · Roma Fiumicino → Palermo',
      'Passagens aéreas',
      RYANAIR_RETURN_PRICE,
      6,
      {
        ...paid,
        notes: `Passagem confirmada para 26/11. A tarifa inclui ${RYANAIR_RETURN_BAG}.`,
      },
    ),
  ];

  state.hotel = {
    name: 'Ilissos Hotel',
    address: 'Kallirrois 72, Atenas',
    checkIn: '20/11 · chegada estimada 20h30–21h',
    checkOut: '23/11 · até 11h, com saída planejada até 08h',
    notes:
      'Hospedagem paga (€ 135,67). Café da manhã incluído em 21, 22 e 23/11. Taxa ambiental de € 9 indicada para pagamento no hotel. Syngrou-Fix fica a cerca de 650 m.',
    website: '',
  };
  state.romeHotel = {
    name: 'Ciao Termini',
    address: 'Via Bixio 71, Roma',
    checkIn: '23/11 · 14h–19h, com chegada estimada 15h30–16h30',
    checkOut: '26/11 · 08h–11h, com saída planejada às 09h15',
    notes:
      'Hospedagem reservada. Total informado de € 224,55, incluindo imposto municipal estimado. Conferir pagamento integral. Café da manhã não incluído. Avisar se a chegada atrasar para depois das 19h.',
    website: '',
  };

  state.flights = [
    {
      id: 'plan-flight-out',
      origin: 'Palermo (PMO)',
      destination: 'Roma Fiumicino (FCO)',
      departure: '20/11 · 12h35 (Itália)',
      arrival: '20/11 · 13h50 (Itália)',
      confirmation: 'Confirmado',
      notes:
        'ITA AZ1784. Conexão de 1h45. Passagem Palermo → Atenas comprada por € 108,62 para os dois trechos.',
    },
    {
      id: 'plan-flight-az718',
      origin: 'Roma Fiumicino (FCO)',
      destination: 'Atenas (ATH)',
      departure: '20/11 · 15h35 (Itália)',
      arrival: '20/11 · 18h35 (Grécia)',
      confirmation: 'Confirmado',
      notes: 'ITA AZ718. Incluído na mesma passagem do trecho Palermo → Roma.',
    },
    {
      id: 'plan-flight-home',
      origin: 'Atenas (ATH)',
      destination: 'Roma Fiumicino (FCO)',
      departure: '23/11 · 12h45 (Grécia)',
      arrival: '23/11 · 13h55 (Itália)',
      confirmation: 'Confirmado',
      notes: 'ITA AZ719. Chegada no Terminal 1. Valor informado de € 134,44.',
    },
    {
      id: 'plan-flight-ryanair',
      origin: 'Roma Fiumicino (FCO)',
      destination: 'Palermo (PMO)',
      departure: '26/11 · 13h50 (Itália)',
      arrival: '26/11 · 15h00 (Itália)',
      confirmation: 'Confirmado',
      notes: `Ryanair FR3946 confirmado e pago por € 64,89. A passagem inclui ${RYANAIR_RETURN_BAG}.`,
    },
  ];
  state.useful = {
    ...state.useful,
    publicTransport: [
      'Atenas: passe turístico de 72h por € 20, com ida e volta do aeroporto. Na chegada, linha 3 → Syntagma e linha 2 sentido Elliniko → Syngrou-Fix. Na volta, linha 2 sentido Anthoupoli → Syntagma e linha 3 com letreiro Airport.',
      sources.athensPass,
      'Roma: Leonardo Express € 14 por trecho e 32 minutos. O Roma 72H custa € 22 e cobre transporte urbano, com o Leonardo Express à parte.',
      sources.leonardo,
      sources.romePass,
    ].join('\n'),
    tickets: [
      'Acrópole e Museu da Acrópole: entradas incluídas no tour. Kotsanas: ingresso válido para o dia 21/11.',
      'Domingo 22/11: Biblioteca de Adriano 08h30–09h30, Zeus 11h30–12h30 e Ágora Antiga 14h–15h são faixas de entrada dos ingressos.',
      'Vicus Caprarius: reserva guiada solicitada. GAMM e Planetário: ingressos a comprar.',
      sources.vicus,
      sources.planetariumTickets,
    ].join('\n'),
    importantTimes:
      'Horários locais. Atenas está uma hora à frente da Itália. As chegadas e margens estimadas estão assinaladas no roteiro. O free tour está reservado, com encontro e horário sujeitos à mensagem do fornecedor.',
    personalNotes:
      'O financeiro inclui os valores informados no cronograma. Pedágio, combustível e parte das refeições ainda estão sem valor. O funicular e o passe urbano de Roma são opcionais e ficam fora da soma das despesas.',
  };
  state.checklist = checklist.map(([key, title, done = false]) => ({
    id: 'trip-check-' + key,
    title,
    done,
  }));
  state.alternatives = [];
  return stateSchema.parse(state);
}
