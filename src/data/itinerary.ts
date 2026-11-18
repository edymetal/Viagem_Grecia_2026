import { emptyState } from './factories';
import {
  itineraryActivities,
  PALERMO_PARKING_PRICE,
  RYANAIR_RETURN_BAG,
  RYANAIR_RETURN_PRICE,
  sources,
} from './itineraryActivities';
import { stateSchema, tripDates, type AppState, type Expense } from './schema';

export const ITINERARY_REVISION = 'cronograma-2026-11-18-atenas-roma-deslocamentos-revisados';
const parkingKey = 'parking';
const ryanairKey = 'ryanair';
export const PARKING_EXPENSE_ID = 'plan-exp-' + parkingKey;
export const RETURN_FLIGHT_EXPENSE_ID = 'plan-exp-' + ryanairKey;

const dayNotes = [
  'Sair de carro às 07h40–07h50. P1 Lunga Sosta a partir de 09h, com QR code. Os voos ITA têm 1h45 de conexão em Fiumicino. Em Atenas, uma hora à frente da Itália, mirar o metrô das 19h22 ou 19h58. Ilissos entre 20h20 e 21h10 se pegar uma dessas saídas.',
  'Chegar à entrada principal da estação Acropoli até 09h15. Guia das 09h20 às 09h25 e tour às 09h30. Baixar o ingresso anexo ao e-mail da Civitatis. Se o tour atrasar, encurtar ou pular Filopapo para priorizar o Kotsanas. Licabeto é opcional.',
  'Entrar na Biblioteca até 09h30, em Zeus até 12h30 e na Ágora até 15h. Troca da guarda às 11h. Jardim Nacional antes do pôr do sol, cerca de 17h09. Conferir a mensagem do guia antes de ir ao free tour das 18h35.',
  'Sair do Ilissos às 08h. Em Syntagma, mirar a linha 3 Airport das 08h54, com chegada às 09h34. Alternativa: 09h30 → 10h10. Voo às 12h45 na Grécia, chegada às 13h55 na Itália. Ciao Termini recebe até 19h.',
  'Vaticano às 10h15, com encontro na Via Germanico 8 até 10h. Vicus solicitado para 15h. Se for confirmado, sair da região do Borgo Pio até 14h para fazer o trajeto a pé com margem.',
  'Chegar à Galleria Borghese por volta das 09h, com ingresso e documento. Estar em Flaminio até 14h30 para chegar ao Planetário por volta de 15h15–15h30. As sessões das 16h e 17h estão no programa. Ingressos a comprar.',
  'Leonardo Express às 10h05 na grade, com chegada às 10h37. A Ryanair fecha o portão às 13h20 para o voo das 13h50. Com pouso às 15h, retirada do carro no P1 por volta das 15h30–16h e chegada a Santo Stefano entre 17h05 e 18h.',
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
  ['rome-pass', 'Prever cinco bilhetes urbanos BIT de Roma (€ 7,50 no total)'],
  ['vicus', 'Confirmar com a secretaria o guia, horário e valor do Vicus Caprarius'],
  ['gamm', 'Comprar o ingresso do GAMM na terça-feira (€ 10 na bilheteria)'],
  ['planetarium', 'Conferir vagas e comprar os ingressos das duas sessões do Planetário'],
  ['dinner', 'Confirmar disponibilidade e preço da feijoada na Churrascaria dos Amigos'],
  [ryanairKey, 'Fazer o check-in da Ryanair e salvar o cartão de embarque do FR3946'],
  ['ciao', 'Pagar a taxa municipal de € 18 no Ciao Termini'],
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
  const estimate = { certainty: 'Estimativa' } as const;
  const bitPrice = 1.5;
  const tollPrice = 3.1;
  const tollNotes = 'A20 Santo Stefano di Camastra ↔ Buonfornello, carro classe A.';
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
    expense('fuel', 'Gasolina · Santo Stefano ↔ aeroporto de Palermo', 'Transporte', 28, 0, {
      ...estimate,
      amountMax: 36,
      notes: 'Ida e volta: cerca de 260 km, consumo estimado de 5,5 a 7,0 L/100 km e gasolina self a cerca de € 1,96/L na Sicília.',
    }),
    expense('toll-out', 'Pedágio A20 · ida para Palermo', 'Transporte', tollPrice, 0, {
      notes: tollNotes,
    }),
    expense('toll-back', 'Pedágio A20 · volta a Santo Stefano', 'Transporte', tollPrice, 6, {
      notes: tollNotes,
    }),
    expense('athens-arrival-meals', 'Lanche de viagem e jantar em Atenas', 'Alimentação', 20, 0, {
      ...estimate,
      amountMax: 35,
    }),
    expense('athens-lunch', 'Almoço de sábado em Atenas', 'Alimentação', 15, 1, {
      ...estimate,
      amountMax: 25,
    }),
    expense('athens-saturday-dinner', 'Jantar de sábado em Atenas', 'Alimentação', 15, 1, {
      ...estimate,
      amountMax: 25,
    }),
    expense('athens-sunday-meals', 'Almoço e jantar de domingo em Atenas', 'Alimentação', 30, 2, {
      ...estimate,
      amountMax: 50,
    }),
    expense('free-tour', 'Free tour de Atenas · contribuição sugerida', 'Passeios', 10, 2, {
      ...estimate,
      amountMax: 15,
      notes: 'Reserva gratuita. O voucher sugere contribuição voluntária de € 10 a € 15 ao guia.',
    }),
    expense('ilissos-tax', 'Ilissos Hotel · taxa ambiental', 'Hotel', 9, 3, {
      notes: 'Indicada para pagamento no hotel. Conferir no check-out.',
    }),
    expense('leonardo-in', 'Leonardo Express · aeroporto → Termini', 'Transporte', 14, 3),
    expense('ciao', 'Ciao Termini · hospedagem', 'Hotel', 206.55, 3, {
      ...paid,
      notes: 'Hospedagem paga pela Booking.com. A taxa municipal é cobrada pela acomodação.',
    }),
    expense('ciao-tax', 'Ciao Termini · taxa municipal', 'Hotel', 18, 3, {
      certainty: 'Confirmado',
      notes: 'Cobrança na acomodação: € 6 por pessoa por noite × 3 noites.',
    }),
    expense('rome-arrival-meals', 'Almoço de viagem e jantar em Roma', 'Alimentação', 25, 3, {
      ...estimate,
      amountMax: 40,
    }),
    expense('rome-metro-tuesday', 'Metrô de Roma · 1 bilhete BIT', 'Transporte', bitPrice, 4, {
      notes: 'Manzoni → Ottaviano. O Leonardo Express tem bilhete próprio.',
    }),
    expense('rome-metro-wednesday', 'Metrô de Roma · 4 bilhetes BIT', 'Transporte', 4 * bitPrice, 5, {
      notes: 'Manzoni → Spagna, Flaminio → EUR Fermi, EUR Fermi → Cornelia e Cornelia → Manzoni. Cada trajeto com baldeação interna usa um bilhete.',
    }),
    expense('vatican', 'Tour do Vaticano · em italiano', 'Passeios', 69, 4, {
      ...paid,
      notes: 'Pagamento confirmado no e-mail da GetYourGuide.',
    }),
    expense('vicus', 'Vicus Caprarius · guia em italiano', 'Passeios', 8, 4, {
      notes: 'Solicitação enviada. Horário a confirmar.',
    }),
    expense('gamm', 'GAMM Game Museum · bilheteria', 'Ingressos', 10, 4, {
      notes: 'Happy Tuesday: € 10 para todos às terças. Em outro dia, a tarifa inteira é € 15.',
    }),
    expense('rome-tuesday-breakfast', 'Café da manhã de terça em Roma', 'Alimentação', 4, 4, {
      ...estimate,
      amountMax: 7,
    }),
    expense('rome-tuesday-lunch', 'Almoço no McDonald’s Borgo Pio', 'Alimentação', 9, 4, {
      ...estimate,
      amountMax: 12,
    }),
    expense('emporio', 'Jantar no Empório Brasileiro', 'Alimentação', 20, 4, {
      ...estimate,
      amountMax: 30,
    }),
    expense('planetarium', 'Planetário de Roma · duas sessões', 'Ingressos', 17, 5, {
      amountMax: 19,
      notes: '€ 17 na bilheteria ou € 19 na pré-venda (€ 1 adicional por sessão).',
    }),
    expense('rome-wednesday-meals', 'Refeições de quarta em Roma', 'Alimentação', 46, 5, {
      ...estimate,
      amountMax: 72,
      notes: 'Café € 4–7, Burger King € 9–12, açaí € 8–13 e jantar € 25–40. Confirmar preço e disponibilidade da feijoada.',
    }),
    expense('rome-return-meals', 'Café da manhã e almoço de viagem', 'Alimentação', 14, 6, {
      ...estimate,
      amountMax: 25,
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
    checkIn: '20/11 · chegada estimada 20h20–21h10',
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
      'Total de € 224,55: € 206,55 de hospedagem pagos pela Booking.com e € 18 de taxa municipal a pagar na acomodação. Café da manhã não incluído. Avisar se a chegada atrasar para depois das 19h.',
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
      'Roma: Leonardo Express € 14 por trecho e 32 minutos. Para cinco viagens de metrô, o orçamento usa cinco BIT de € 1,50 (total € 7,50). O Roma 72H de € 22 é uma alternativa aos BIT, com o Leonardo Express à parte.',
      sources.leonardo,
      sources.romeBit,
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
      'O financeiro inclui as compras confirmadas, os valores a pagar e as estimativas de gasolina e refeições. O funicular do Licabeto é opcional. Em Roma, a previsão usa bilhetes BIT; trocar pelo Roma 72H acrescenta € 14,50.',
  };
  state.checklist = checklist.map(([key, title, done = false]) => ({
    id: 'trip-check-' + key,
    title,
    done,
  }));
  state.alternatives = [];
  return stateSchema.parse(state);
}
