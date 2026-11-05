import rows from './itinerary-activities.json' with { type: 'json' };
import { emptyActivity, emptyState } from './factories';
import { stateSchema, tripDates, type Activity, type AppState, type Expense } from './schema';

// Supplied planning data. Prices/availability have not been independently rechecked.
// No booking codes, age, personal documents or paid reservations are embedded.
export const ITINERARY_REVISION = 'cronograma-2026-11-05-correcao-2';
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
  'plan-1-01': {
    location: 'Estação Santo Stefano di Camastra–Mistretta',
    notes:
      'Sair de casa com antecedência. Percurso casa → estação ainda não definido; chegar até 06h45.',
  },
  'plan-1-02': {
    location: 'Palermo Centrale',
    notes:
      'Regional 12863. €14,40 consultados para os dois trens de ida em conjunto; reconferir antes da compra.',
  },
  'plan-1-03': {
    location: 'Palermo Centrale',
  },
  'plan-1-04': {
    location: 'Palermo Aeroporto',
    notes: 'Regional 21721, incluído nos €14,40 consultados para os dois trens de ida.',
  },
  'plan-1-05': {
    location: 'Aeroporto de Palermo',
  },
  'plan-1-06': {
    location: 'Aeroporto de Palermo',
  },
  'plan-1-07': {
    location: 'Aeroporto de Palermo',
  },
  'plan-1-08': {
    location: 'Roma–Fiumicino',
    duration: 105,
    notes:
      'Espera anteriormente consultada de 1h45. Os horários individuais dos voos dependem da opção final; reconferir antes de comprar.',
  },
  'plan-1-09': {
    location: 'Aeroporto de Atenas',
  },
  'plan-1-10': {
    location: 'Estação de metrô do aeroporto de Atenas',
  },
  'plan-1-11': {
    location: 'Estação de metrô do aeroporto de Atenas',
    website: 'https://www.oasa.gr/en/tickets/prices-of-products/',
    notes:
      'Passe de 72 horas: previsão anterior de €20, incluindo ida e volta ao aeroporto. Guardar e validar o mesmo bilhete. Compra pendente.',
  },
  'plan-1-12': {
    address: '',
    website: 'https://www.adamshotel.gr/location',
    location: 'Estação Akropoli, Atenas',
    notes:
      'Linha 3 até Syntagma; linha 2 sentido Elliniko até Akropoli. Bloco com espera e troca; 19h35 não é uma partida confirmada. A caminhada ao hotel está em etapa separada.',
  },
  'plan-1-13': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    website: 'https://www.adamshotel.gr/location',
    location: 'Adam’s Hotel, Plaka',
    notes:
      'Check-in e acomodação 20h55–21h15. Hotel escolhido, reserva pendente; avisar a chegada à noite.',
  },
  'plan-1-14': {
    location: 'Plaka, Atenas',
  },
  'plan-1-15': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    location: 'Adam’s Hotel, Plaka',
  },
  'plan-2-01': {},
  'plan-2-02': {
    location: 'Biblioteca de Adriano, Atenas',
  },
  'plan-2-03': {
    location: 'Biblioteca de Adriano, Atenas',
    openingHours: 'Inverno: 08h–15h; última entrada 14h40 (cronograma anterior; reconferir).',
    website:
      'https://www.visitgreece.gr/en/experiences/culture/archaeological-sites-monuments/the-roman-agora-and-hadrians-library',
    ticketUrl: 'https://hhticket.gr/',
  },
  'plan-2-04': {
    location: 'Museu Kotsanas, Atenas',
  },
  'plan-2-05': {
    location: 'Museu Kotsanas, Atenas',
    openingHours: 'Diariamente: 10h–18h (cronograma anterior; reconferir).',
    website: 'https://kotsanas.com/athens/',
    ticketUrl: 'https://kotsanas.com/athens/',
  },
  'plan-2-06': {
    location: 'Plaka, Atenas',
  },
  'plan-2-07': {
    location: 'Plaka, Atenas',
  },
  'plan-2-08': {
    location: 'Anafiotika, Atenas',
  },
  'plan-2-09': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    location: 'Adam’s Hotel, Plaka',
  },
  'plan-2-10': {
    location: '',
    address: '',
    notes:
      'Horário, duração e endereço exato dependem da confirmação do operador. Não há ponto de encontro presumido.',
  },
  'plan-2-11': {
    location: 'Acrópole de Atenas',
    openingHours: 'Inverno: 08h–17h (cronograma anterior; reconferir).',
    website: 'https://hhticket.gr/',
    ticketUrl: 'https://hhticket.gr/',
    guideUrl:
      'https://www.getyourguide.com/athens-l91/full-athens-acropolis-pnyx-philopappou-agora-anafiotik-t1239169/',
    notes:
      'Passeio com guia em português proposto para 14h30–16h30, ainda sem confirmação. Confirmar horário, duração, antecedência e ponto de encontro com o operador. Comprar ingresso oficial separadamente após confirmar as exigências; guia com preço pendente. Partenon incluído no sítio; não somar outra entrada.',
  },
  'plan-2-12': {
    location: 'Adam’s Hotel, Plaka',
    address: 'Cherefodos, 6, Plaka, Atenas',
  },
  'plan-2-13': {
    location: 'Adam’s Hotel, Plaka',
    address: 'Cherefodos, 6, Plaka, Atenas',
  },
  'plan-2-14': {
    location: 'Plaka, Atenas',
  },
  'plan-3-01': {},
  'plan-3-02': {
    location: 'Ágora Antiga, Atenas',
    notes: 'Acesso da Ágora pela rua Adrianou, 24, conforme correção recebida.',
  },
  'plan-3-03': {
    location: 'Ágora Antiga, Atenas',
    openingHours: 'Inverno: 08h–17h (cronograma anterior; reconferir).',
    website: 'https://www.hh.gr/en/destinations/ancient-agora-athens/',
    ticketUrl: 'https://hhticket.gr/',
  },
  'plan-3-04': {
    location: 'Praça Syntagma, Atenas',
  },
  'plan-3-05': {
    location: 'Parlamento, Praça Syntagma, Atenas',
  },
  'plan-3-06': {
    location: 'Parlamento, Praça Syntagma, Atenas',
  },
  'plan-3-07': {
    location: 'Jardim Nacional / exterior do Zappeion, Atenas',
    notes:
      'Bloco de 35 minutos para caminhar de Syntagma até Zeus com paradas breves. Não comporta visita longa ao jardim; encurtar as paradas em caso de atraso.',
  },
  'plan-3-08': {
    location: 'Templo de Zeus Olímpico, Atenas',
  },
  'plan-3-09': {
    location: 'Templo de Zeus Olímpico, Atenas',
    openingHours: 'Inverno: fecha 15h; última entrada 14h40 (cronograma anterior; reconferir).',
    website: 'https://accessible.thisisathens.org/place/1742',
    ticketUrl: 'https://hhticket.gr/',
  },
  'plan-3-10': {
    location: 'Arco de Adriano, Atenas',
  },
  'plan-3-11': {
    location: 'Akropoli / Museu da Acrópole, Atenas',
  },
  'plan-3-12': {
    location: '',
    address: '',
    notes:
      'Horário, duração e endereço exato dependem da confirmação do operador. Não há ponto de encontro presumido.',
  },
  'plan-3-13': {
    location: 'Museu da Acrópole, Atenas',
    openingHours:
      'Domingos: 09h–20h. Escavação: fecha 17h, última entrada 16h30 (cronograma anterior; reconferir).',
    website: 'https://www.theacropolismuseum.gr/en/plan-your-visit',
    ticketUrl: 'https://etickets.theacropolismuseum.gr/',
    guideUrl:
      'https://www.getyourguide.com/pt-br/atenas-l91/excursao-pelas-obras-primas-do-museu-da-acropole-t1167645/',
    notes:
      'Passeio com guia em português proposto para 14h30–16h30, ainda sem confirmação. Confirmar horário, duração, antecedência e ponto de encontro com o operador. Comprar ingresso oficial separadamente após confirmar as exigências; guia com preço pendente. A escavação precisa ser coordenada com o operador; não está garantida uma visita separada depois do tour.',
  },
  'plan-3-14': {
    location: 'Museu da Acrópole, Atenas',
    website: 'https://www.theacropolismuseum.gr/en/plan-your-visit',
    notes:
      'Somente 10 minutos para finalizar a visita e sair. Este bloco substitui o tempo adicional do roteiro anterior; não é uma visita extra à escavação.',
  },
  'plan-3-15': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    location: 'Adam’s Hotel, Plaka',
  },
  'plan-3-16': {
    location: 'Plaka, Atenas',
  },
  'plan-3-17': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    location: 'Adam’s Hotel, Plaka',
  },
  'plan-4-01': {},
  'plan-4-02': {
    address: 'Cherefodos, 6, Plaka, Atenas',
  },
  'plan-4-03': {
    location: 'Estação Akropoli, Atenas',
  },
  'plan-4-04': {
    location: 'Aeroporto de Atenas',
    website: 'https://www.stasy.gr/en/contact/faq/',
    notes:
      'Linha 2 sentido Anthoupoli até Syntagma; linha 3 com letreiro Airport. Bloco inclui espera e troca; 08h30 não é uma partida confirmada. Usar o mesmo passe, dentro da validade; conferir serviços aeroportuários.',
  },
  'plan-4-05': {
    location: 'Aeroporto de Atenas',
  },
  'plan-4-06': {
    location: 'Aeroporto de Atenas',
  },
  'plan-4-07': {
    location: 'Roma–Fiumicino',
    duration: 200,
    notes:
      'Espera anteriormente consultada de 3h20. Horários individuais dos trechos ainda precisam ser transcritos da opção final.',
  },
  'plan-4-08': {
    location: 'Aeroporto de Palermo',
  },
  'plan-4-09': {
    location: 'Aeroporto de Palermo',
  },
  'plan-4-10': {
    location: 'Aeroporto de Palermo',
  },
  'plan-4-11': {
    location: 'Palermo Centrale',
    notes:
      'Regional 5628. €14,40 consultados para os dois trens da volta em conjunto; reconferir antes de comprar.',
  },
  'plan-4-12': {
    location: 'Palermo Centrale',
  },
  'plan-4-13': {
    location: 'Santo Stefano di Camastra–Mistretta',
    notes: 'Regional 12928, incluído nos €14,40 consultados para os dois trens da volta.',
  },
  'plan-4-14': {
    location: 'Santo Stefano di Camastra–Mistretta',
    notes:
      'Chegada à estação às 22h59. Transporte estação → casa ainda não definido; horário final em casa desconhecido.',
  },
  'corr-1-wait': {
    location: 'Estação Santo Stefano di Camastra–Mistretta',
  },
  'corr-1-gate': {
    location: 'Aeroporto de Palermo',
  },
  'corr-1-hotel-walk': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    location: 'Adam’s Hotel, Plaka',
  },
  'corr-2-hotel-walk': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    location: 'Adam’s Hotel, Plaka',
  },
  'corr-2-return': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    location: 'Adam’s Hotel, Plaka',
  },
  'corr-3-hotel-walk': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    location: 'Adam’s Hotel, Plaka',
  },
  'corr-3-return': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    location: 'Adam’s Hotel, Plaka',
  },
  'corr-4-room-check': {
    address: 'Cherefodos, 6, Plaka, Atenas',
    location: 'Adam’s Hotel, Plaka',
  },
  'corr-2-library-entry': {
    location: 'Biblioteca de Adriano, Atenas',
  },
  'corr-2-library-exit': {
    location: 'Biblioteca de Adriano, Atenas',
  },
  'corr-2-kotsanas-entry': {
    location: 'Museu Kotsanas, Atenas',
  },
  'corr-2-kotsanas-exit': {
    location: 'Museu Kotsanas, Atenas',
  },
  'corr-2-anafiotika-walk': {
    location: 'Anafiotika, Atenas',
  },
  'corr-3-agora-entry': {
    location: 'Ágora Antiga, Atenas',
  },
  'corr-3-agora-exit': {
    location: 'Ágora Antiga, Atenas',
  },
  'corr-3-zeus-exit': {
    location: 'Templo de Zeus Olímpico, Atenas',
  },
  'corr-3-arch-walk': {
    location: 'Arco de Adriano, Atenas',
  },
  'corr-2-guide-walk': {
    location: '',
    address: '',
    notes:
      'Horário, duração e endereço exato dependem da confirmação do operador. Não há ponto de encontro presumido.',
  },
  'corr-3-guide-walk': {
    location: '',
    address: '',
    notes:
      'Horário, duração e endereço exato dependem da confirmação do operador. Não há ponto de encontro presumido.',
  },
  'corr-4-airport': {
    location: 'Aeroporto de Atenas',
  },
  'corr-4-gate': {
    location: 'Aeroporto de Atenas',
  },
  'corr-4-station-walk': {
    location: 'Palermo Aeroporto',
  },
  'corr-4-platform': {
    location: 'Palermo Aeroporto',
  },
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
  'plan-1-10': [
    'A pé',
    'Desembarque no aeroporto de Atenas',
    'Estação de metrô do aeroporto de Atenas',
  ],
  'plan-1-12': [
    'Metrô',
    'Aeroporto de Atenas',
    'Akropoli, Atenas',
    '3 → Syntagma; 2 sentido Elliniko → Akropoli',
  ],
  'corr-1-hotel-walk': ['A pé', 'Estação Akropoli, Atenas', 'Adam’s Hotel, Plaka'],
  'plan-2-02': ['A pé', 'Adam’s Hotel, Plaka', 'Biblioteca de Adriano, Atenas'],
  'plan-2-04': ['A pé', 'Biblioteca de Adriano, Atenas', 'Museu Kotsanas, Atenas'],
  'plan-2-06': [
    'A pé',
    'Museu Kotsanas, Atenas',
    'Restaurante a escolher próximo ao hotel em Plaka',
  ],
  'corr-2-anafiotika-walk': ['A pé', 'Restaurante a escolher em Plaka', 'Anafiotika, Atenas'],
  'corr-2-hotel-walk': ['A pé', 'Anafiotika, Atenas', 'Adam’s Hotel, Plaka'],
  'plan-2-12': ['A pé', 'Término do passeio da Acrópole a confirmar', 'Adam’s Hotel, Plaka'],
  'plan-3-02': ['A pé', 'Adam’s Hotel, Plaka', 'Ágora Antiga, Adrianou 24, Atenas'],
  'plan-3-04': ['A pé', 'Ágora Antiga, Atenas', 'Parlamento, Praça Syntagma, Atenas'],
  'plan-3-07': [
    'A pé',
    'Parlamento, Praça Syntagma, Atenas',
    'Templo de Zeus Olímpico, Atenas',
    'Via Jardim Nacional e exterior do Zappeion',
  ],
  'corr-3-arch-walk': ['A pé', 'Templo de Zeus Olímpico, Atenas', 'Arco de Adriano, Atenas'],
  'corr-3-restaurant-walk': [
    'A pé',
    'Arco de Adriano, Atenas',
    'Restaurante a escolher próximo ao Museu da Acrópole',
  ],
  'corr-3-hotel-walk': ['A pé', 'Museu da Acrópole, Atenas', 'Adam’s Hotel, Plaka'],
  'plan-4-03': ['A pé', 'Adam’s Hotel, Plaka', 'Estação Akropoli, Atenas'],
  'plan-4-04': [
    'Metrô',
    'Akropoli, Atenas',
    'Aeroporto de Atenas',
    '2 sentido Anthoupoli → Syntagma; 3 → Airport',
  ],
  'plan-4-05': ['A pé', 'Estação do aeroporto de Atenas', 'Embarques do aeroporto de Atenas'],
  'corr-4-station-walk': ['A pé', 'Terminal de Palermo Aeroporto', 'Estação Palermo Aeroporto'],
  'plan-4-11': ['Trem', 'Palermo Aeroporto', 'Palermo Centrale', 'Regional 5628'],
  'plan-4-13': [
    'Trem',
    'Palermo Centrale',
    'Santo Stefano di Camastra–Mistretta',
    'Regional 12928',
  ],
  'corr-1-restaurant': ['A pé', 'Adam’s Hotel, Plaka', 'Restaurante a escolher em Plaka'],
  'corr-1-return': ['A pé', 'Restaurante a escolher em Plaka', 'Adam’s Hotel, Plaka'],
  'corr-2-restaurant': ['A pé', 'Adam’s Hotel, Plaka', 'Restaurante a escolher em Plaka'],
  'corr-2-return': ['A pé', 'Restaurante a escolher em Plaka', 'Adam’s Hotel, Plaka'],
  'corr-3-restaurant': ['A pé', 'Adam’s Hotel, Plaka', 'Restaurante a escolher em Plaka'],
  'corr-3-return': ['A pé', 'Restaurante a escolher em Plaka', 'Adam’s Hotel, Plaka'],
  'plan-1-15': ['A pé', 'Restaurante a escolher em Plaka', 'Adam’s Hotel, Plaka'],
  'corr-2-guide-walk': ['A pé', 'Adam’s Hotel, Plaka', ''],
  'corr-3-guide-walk': ['A pé', 'Restaurante a escolher próximo ao museu', ''],
};
function activities(): Activity[] {
  return rows.map((row) => {
    const base = emptyActivity(tripDates[row.day]);
    const price = row.cost.match(/€([\d.,]+)(?:[–-]€?([\d.,]+))?/);
    const isFood = /café|almoço|jantar|lanche/i.test(row.title);
    const minutes =
      row.start && row.end
        ? Number(row.end.slice(0, 2)) * 60 +
          Number(row.end.slice(3)) -
          Number(row.start.slice(0, 2)) * 60 -
          Number(row.start.slice(3))
        : null;
    const a: Activity = {
      ...base,
      id: row.id,
      title: row.title,
      start: row.start,
      end: row.end,
      timeZone: row.timeZone as Activity['timeZone'],
      timeCertainty: row.timeCertainty as Activity['timeCertainty'],
      timeNote: row.timeNote,
      confirmation: 'Planejada',
      description: row.details,
      duration: minutes,
      price: price ? Number(price[1].replace(',', '.')) : null,
      priceMax: price?.[2] ? Number(price[2].replace(',', '.')) : null,
      priceCertainty: price ? (isFood ? 'Estimativa' : 'Consultado') : 'Não informado',
      ...details[row.id],
    };
    if (isFood)
      a.notes += `${a.notes ? '\n' : ''}Incluído na estimativa global de alimentação (€80–120); não somar novamente em Gastos. Café da manhã depende de inclusão na tarifa do hotel, ainda pendente.`;
    if (routes[row.id]) {
      const [mode, origin, destination, lines = ''] = routes[row.id];
      a.transport = {
        ...a.transport,
        mode,
        origin,
        destination,
        lines,
        station: mode === 'Metrô' ? 'Akropoli / Syntagma' : '',
        minutes,
        certainty: mode === 'Trem' ? 'Não informado' : 'Estimativa',
        notes: `${row.details}${a.notes ? '\n' + a.notes : ''}`,
      };
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
    'Chegar à estação até 06h45; trajeto desde casa ainda não definido. Metrô 19h35–20h45 estimado, caminhada 20h45–20h55 e check-in 20h55–21h15. Voos e trens consultados: reconferir antes de comprar.',
    'Guia da Acrópole em português: solicitar 14h30–16h30, ainda sem vaga garantida. Reservar somente guia e depois ingresso oficial compatível. Partenon incluído no sítio, sem entrada separada.',
    'Domingo com acessos e saídas separados. Jardim e Zappeion são passagem breve até Zeus; encurtar em caso de atraso para preservar almoço e guia. Museu 14h30–16h30 provisório; coordenar a escavação com o operador, sem visita extra garantida depois. Ágora por Adrianou, 24.',
    'Preparar bagagem 07h40–08h; check-out 08h–08h15. Metrô 08h30–10h é janela estimada, não partida confirmada. Terminal 10h15, meta aproximada de 2h30 antes do voo. Chegada à estação 22h59; trajeto estação → casa ainda não definido. Horários locais; compras pendentes.',
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
      'Guia separado, preço pendente. Escavação a coordenar com o operador; nenhuma visita extra garantida após o tour.',
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
    checkIn: '20/11/2026 · a partir de 15h (Atenas); chegada planejada 20h55–21h15',
    checkOut: '23/11/2026 · até 11h (Atenas); saída planejada 08h–08h15',
    website: hotel,
    notes:
      'Escolhido em Plaka, três noites, um adulto. Ainda não reservado. Preço final, taxas, café da manhã e cancelamento pendentes. Akropoli a aproximadamente 350 m.\nInformações: https://adamshotel.reserve-online.net/about\nOpção de reserva: https://www.booking.com/hotel/gr/adams-athens.pt-pt.html?checkin=2026-11-20&checkout=2026-11-23&group_adults=1&no_rooms=1',
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
      'Metrô e caminhadas. Passe 3-day Tourist Ticket: €20; 72h de transporte urbano e ida/volta do aeroporto dentro da validade. Guardar o mesmo bilhete e validar entrada/saída. Exemplo de validade: sexta 19h30 → segunda 19h30, não ativação confirmada.\nIda: linha 3 azul → Syntagma; linha 2 vermelha sentido Elliniko → Akropoli; 10 min reservados a pé ao hotel (20h45–20h55).\nVolta: linha 2 sentido Anthoupoli → Syntagma; linha 3 com letreiro Airport. Nem todos os trens vão ao aeroporto. Frequência aeroportuária informada: 36 min.\nFontes do texto: https://www.oasa.gr/en/tickets/prices-of-products/ e https://www.stasy.gr/en/contact/faq/',
    tickets:
      'Primeiro reservar os dois guias Carlimar/GetYourGuide em português, SOMENTE GUIA. Depois comprar ingressos oficiais com horários compatíveis; não comprar modalidade GetYourGuide com entrada incluída.\nIntegrais: Acrópole/Partenon €30; Ágora Antiga/museu €20; Biblioteca de Adriano €10; Zeus €20; Museu da Acrópole/escavação €20; Kotsanas principal €7. Total €107 sem guias. Sem desconto por idade no orçamento.\nhttps://hhticket.gr/\nhttps://etickets.theacropolismuseum.gr/\nhttps://kotsanas.com/athens/',
    importantTimes:
      'Horários locais: Atenas uma hora à frente da Itália em novembro. Guias propostos, não confirmados: Acrópole sábado 14h30–16h30; Museu domingo 14h30–16h30.\nBiblioteca de Adriano 08h–15h, última entrada 14h40. Acrópole 08h–17h. Ágora Antiga 08h–17h. Kotsanas 10h–18h. Zeus fecha 15h, última entrada 14h40. Museu domingo 09h–20h; escavação fecha 17h, última entrada 16h30. Guarda dominical às 11h. Horários conforme texto fornecido, não revalidados pelo app.',
    personalNotes:
      'Planejamento fornecido, nenhuma compra ou reserva realizada. Escadas, entradas dos sítios e pausas podem acrescentar minutos aos deslocamentos estimados. Estádio Panatenaico removido do roteiro.\nSubtotal fornecido €361,81 sem hotel, alimentação e guias; com alimentação €441,81–481,81. Hotel e dois guias pendentes. Hotel e guias ainda sem preço confirmado; não é orçamento fechado. Os trajetos casa → estação e estação → casa precisam ser definidos.',
  };
  s.checklist = [
    'Comprar voos ITA após conferir condições e disponibilidade',
    'Comprar os trens de ida e volta na Sicília',
    'Reservar Adam’s Hotel e confirmar preço, taxas, café e cancelamento',
    'Confirmar horário e preço do guia da Acrópole em português, somente guia',
    'Confirmar horário e preço do guia do Museu da Acrópole, somente guia',
    'Comprar ingressos oficiais somente após compatibilizar os guias',
    'Coordenar a escavação do museu com o operador, sem visita extra garantida',
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
      description:
        'Alternativa fora do roteiro corrigido; depende de reorganizar os horários e confirmar acesso com o operador.',
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
