import { emptyActivity } from './factories';
import { tripDates, type Activity } from './schema';
import { activityInstant } from '../lib/domain';

const athens = 'Europe/Athens';
const italy = 'Europe/Rome';
const ilissos = 'Ilissos Hotel, Kallirrois 72, Atenas';
const ciao = 'Ciao Termini, Via Bixio 71, Roma';
const ath = 'Aeroporto Internacional de Atenas (ATH)';
const pmo = 'Aeroporto de Palermo (PMO)';
export const PALERMO_PARKING = 'P1 Lunga Sosta, Aeroporto de Palermo (PMO)';
export const PALERMO_PARKING_PRICE = 65;
export const RYANAIR_RETURN_PRICE = 64.89;
export const RYANAIR_RETURN_BAG = 'uma mala pequena de até 40 × 30 × 20 cm';
const fco = 'Aeroporto de Roma Fiumicino (FCO)';
const termini = 'Roma Termini';
const syntagma = 'Praça Syntagma, Atenas';
const acropoli = 'Estação Acropoli, Atenas';
const fix = 'Estação Syngrou-Fix, Atenas';
const home = 'Santo Stefano di Camastra';
const library = 'Biblioteca de Adriano, Atenas';
const zeus = 'Templo de Zeus Olímpico, Atenas';
const agora = 'Ágora Antiga, Adrianou 24, Atenas';
const garden = 'Jardim Nacional de Atenas';
const museum = 'Museu da Acrópole, Atenas';
const filopapo = 'Monumento de Filopapo, Atenas';
const kotsanas = 'Museu Kotsanas, Pindarou 6, Atenas';
const funicular = 'Funicular do Monte Licabeto, Atenas';
const freeTour = 'Igreja dos Santos Arcanjos e da Virgem Maria Vigilante, Taxiarchon 7, Atenas';
const planetarium = 'Planetário de Roma, Piazza Giovanni Agnelli 10, Roma';
const vaticanMeeting = 'Via Germanico 8, Roma';
const vaticanEnd = 'Praça de São Pedro, Vaticano';
const mcdonalds = 'McDonald’s Borgo Pio, Roma';
const vicus = 'Vicus Caprarius, Vicolo del Puttarello 25, Roma';
const gamm = 'GAMM Game Museum, Via delle Terme di Diocleziano 35/36, Roma';
const emporio = 'Empório Brasileiro, Via Milazzo 41/43, Roma';
const borghese = 'Galleria Borghese, Piazzale Scipione Borghese 5, Roma';
const burgerKing = 'Burger King, Via Nazionale 178, Roma';
const oakberry = 'Oakberry, Piazzale Flaminio 5, Roma';
const churrascaria = 'Churrascaria dos Amigos, Via Aurelia 528A, Roma';

export const sources = {
  athensPass: 'https://www.oasa.gr/en/tickets/prices-of-products/',
  athensMetro: 'https://www.stasy.gr/en/stations/syntagma/',
  greekTickets: 'https://hhticket.gr/',
  leonardo: 'https://www.trenitalia.com/it/regionale/collegamenti-regionale/leonardo-express.html',
  trenitaliaUpdates:
    'https://www.trenitalia.com/it/informazioni/infomobilita/notizie-infomobilita.html',
  romePass: 'https://www.atac.roma.it/biglietti-e-abbonamenti/roma72h',
  vicus: 'https://www.vicuscaprarius.com/faq/',
  gamm: 'https://www.gammuseum.com/new/biglietteria/',
  planetarium:
    'https://www.planetarioroma.it/it/mostra-evento/programmazione-del-planetario-dal-1-al-29-novembre',
  planetariumTickets: 'https://www.planetarioroma.it/informazioni_pratiche/biglietti',
};

type TransportMode = Activity['transport']['mode'];
type Row = [
  id: string,
  start: string,
  end: string,
  title: string,
  description: string,
  details?: Partial<Activity>,
];

const booked = { confirmation: 'Confirmada' } as const;
const pending = { confirmation: 'Pendente' } as const;
const approximate = { timeCertainty: 'Estimativa' } as const;
const paidPrice = (price: number): Partial<Activity> => ({ price, priceCertainty: 'Confirmado' });
const referencePrice = (price: number, priceMax?: number): Partial<Activity> => ({
  price,
  priceMax,
  priceCertainty: 'Consultado',
});
const at = (location: string): Partial<Activity> => ({ location });
const route = (
  mode: TransportMode,
  origin: string,
  destination: string,
  lines = '',
  minutes: number | null = null,
): Partial<Activity> => ({
  location: destination,
  transport: {
    mode,
    origin,
    destination,
    lines,
    minutes,
    station: '',
    price: null,
    certainty: mode === 'Avião' ? 'Confirmado' : 'Estimativa',
    notes: '',
  },
});

const rows: Row[][] = [
  [
    [
      'plan-1-01',
      '08:00',
      '08:15',
      'Saída de Santo Stefano de carro',
      'Janela de saída. Cerca de 130 km e 1h30 de estrada, com pedágio.',
      { ...route('Carro', home, PALERMO_PARKING, '', 90), ...approximate },
    ],
    [
      'nov-20-parking',
      '',
      '10:00',
      'P1 Lunga Sosta · estacionamento e ida ao terminal',
      'Reserva paga. Entrada reservada em 20/11 às 09h00 e saída reservada em 26/11 às 23h00. Acesso pelo QR code no e-mail de confirmação. O terminal fica a cerca de 6 minutos a pé.',
      {
        ...at(PALERMO_PARKING),
        ...booked,
        ...approximate,
        ...paidPrice(PALERMO_PARKING_PRICE),
        timeNote:
          'Meta de chegada ao terminal até 10h. A entrada na reserva está indicada para 09h00.',
      },
    ],
    [
      'plan-1-06',
      '10:00',
      '12:00',
      'Procedimentos no aeroporto de Palermo',
      'Fazer os procedimentos do voo, passar pela segurança e localizar o portão.',
      at(pmo),
    ],
    [
      'plan-1-07',
      '12:35',
      '13:50',
      'Voo ITA AZ1784 · Palermo → Roma',
      'Primeiro trecho da passagem Palermo → Atenas. Valor conjunto de € 108,62 para os dois voos.',
      { ...route('Avião', pmo, fco, 'AZ1784', 75), ...booked },
    ],
    [
      'plan-1-08',
      '13:50',
      '15:35',
      'Conexão em Roma Fiumicino',
      '1h45 de conexão. Conferir o portão do próximo voo nos painéis.',
      at(fco),
    ],
    [
      'nov-20-az718',
      '15:35',
      '18:35',
      'Voo ITA AZ718 · Roma → Atenas',
      'Partida às 15h35 na Itália e chegada às 18h35 na Grécia. A passagem comprada inclui os dois trechos.',
      { ...route('Avião', fco, ath, 'AZ718', 120), ...booked, endTimeZone: athens },
    ],
    [
      'plan-1-10',
      '18:35',
      '',
      'Desembarque e caminhada até o metrô',
      'Seguir as placas para o metrô após o desembarque.',
      {
        ...route('A pé', ath, 'Estação de metrô do aeroporto de Atenas'),
        timeZone: athens,
        ...approximate,
      },
    ],
    [
      'plan-1-11',
      '',
      '',
      'Comprar o passe turístico de Atenas',
      'Passe de 72h a partir da primeira validação. Inclui ida e volta do aeroporto. Guardar o bilhete até o retorno de segunda-feira.',
      {
        ...at(ath),
        ...pending,
        ...referencePrice(20),
        timeZone: athens,
        website: sources.athensPass,
      },
    ],
    [
      'plan-1-12',
      '',
      '',
      'Metrô até Syngrou-Fix',
      'Linha 3 até Syntagma. Trocar para a linha 2 em direção a Elliniko.',
      {
        ...route('Metrô', ath, fix, 'Linha 3 → Syntagma · linha 2 → Elliniko'),
        timeZone: athens,
        website: sources.athensMetro,
      },
    ],
    [
      'corr-1-hotel-walk',
      '',
      '',
      'Caminhada até o Ilissos Hotel',
      'Aproximadamente 650 m a partir de Syngrou-Fix.',
      { ...route('A pé', fix, ilissos, '', 10), timeZone: athens },
    ],
    [
      'plan-1-13',
      '20:30',
      '21:00',
      'Chegada e check-in no Ilissos Hotel',
      'Janela estimada de chegada. Hotel reservado e hospedagem paga. Café da manhã incluído em 21, 22 e 23/11. Taxa ambiental de € 9 indicada para pagamento no hotel.',
      {
        ...at(ilissos),
        ...booked,
        ...approximate,
        timeZone: athens,
        address: 'Kallirrois 72, Atenas',
      },
    ],
    [
      'plan-1-14',
      '',
      '',
      'Jantar em Atenas',
      'Horário e restaurante livres após o check-in.',
      { ...at('Atenas'), timeZone: athens },
    ],
  ],
  [
    [
      'plan-2-01',
      '07:30',
      '08:15',
      'Café da manhã no Ilissos',
      'Incluído na hospedagem.',
      at(ilissos),
    ],
    [
      'nov-21-fix',
      '08:30',
      '',
      'Saída do hotel e caminhada a Syngrou-Fix',
      'Percurso de aproximadamente 650 m.',
      route('A pé', ilissos, fix, '', 10),
    ],
    [
      'nov-21-metro',
      '',
      '',
      'Metrô até Acropoli',
      'Acropoli fica a uma estação. Incluir o tempo de espera pelo próximo trem.',
      route('Metrô', fix, acropoli, 'Linha 2 sentido Anthoupoli'),
    ],
    [
      'plan-2-10',
      '',
      '09:15',
      'Chegar ao ponto de encontro do guia',
      'Apresentar-se na estação Acropoli até 09h15, com 15 minutos de antecedência. Conferir as instruções do voucher.',
      at(acropoli),
    ],
    [
      'plan-2-11',
      '09:30',
      '14:00',
      'Tour da Acrópole, Partenon e Museu da Acrópole',
      'Guia em italiano. As entradas estão incluídas nos € 110 pagos pelo tour. Término aproximado às 14h.',
      {
        ...at('Acrópole e Partenon, Atenas'),
        ...booked,
        ...paidPrice(110),
        timeNote: 'Início confirmado; término estimado.',
        website: 'https://www.theacropolismuseum.gr/en/plan-your-visit',
      },
    ],
    [
      'plan-2-07',
      '14:00',
      '14:50',
      'Almoço perto do Museu da Acrópole',
      'Restaurante a escolher. Se o tour atrasar, reduzir a parada em Filopapo para chegar ao Kotsanas a tempo.',
      { ...at(museum), price: 15, priceMax: 25, priceCertainty: 'Estimativa' },
    ],
    [
      'nov-21-filopapo-walk',
      '14:50',
      '15:20',
      'Caminhada e subida a Filopapo',
      'Cerca de 1 km. A caminhada estimada de 17 minutos tem margem para a subida.',
      route('A pé', museum, filopapo, '', 17),
    ],
    [
      'nov-21-filopapo',
      '15:20',
      '15:50',
      'Colina de Filopapo',
      'Passeio e fotos. Entrada gratuita.',
      { ...at(filopapo), ...paidPrice(0) },
    ],
    [
      'plan-2-04',
      '15:50',
      '16:30',
      'Caminhada até o Museu Kotsanas',
      'Aproximadamente 2,5 km a partir do monumento. Chegar antes do fechamento às 18h.',
      route('A pé', filopapo, kotsanas, '', 36),
    ],
    [
      'plan-2-05',
      '16:30',
      '17:45',
      'Museu Kotsanas',
      'Ingresso de € 7,42 comprado, válido para o dia. A visita às 16h30 é planejada.',
      {
        ...at(kotsanas),
        ...booked,
        ...paidPrice(7.42),
        openingHours: '10h–18h',
        website: 'https://kotsanas.com/athens/',
        address: 'Pindarou 6, Atenas',
      },
    ],
    [
      'nov-21-lycabettus-walk',
      '17:45',
      '18:10',
      'Caminhada até a região do funicular do Licabeto',
      'Trecho de subida, aproximadamente 650 m.',
      route('A pé', kotsanas, funicular, '', 13),
    ],
    [
      'nov-21-lycabettus',
      '18:10',
      '',
      'Monte Licabeto · passeio opcional',
      'Vista noturna, se houver disposição. Funicular opcional, com referência de € 13 ida e volta a conferir.',
      { ...at(funicular), price: 13, priceCertainty: 'Estimativa' },
    ],
    [
      'plan-2-14',
      '',
      '',
      'Jantar e retorno ao Ilissos',
      'Restaurante e horário livres. Pelo metrô, caminhar até Evangelismos e trocar em Syntagma para a linha 2 sentido Elliniko. Descer em Syngrou-Fix e caminhar até o hotel.',
      route('Metrô', 'Evangelismos, Atenas', ilissos, 'Linha 3 → Syntagma · linha 2 → Syngrou-Fix'),
    ],
  ],
  [
    [
      'plan-3-01',
      '07:15',
      '08:00',
      'Café da manhã no Ilissos',
      'Incluído na hospedagem.',
      at(ilissos),
    ],
    [
      'nov-22-fix',
      '08:15',
      '',
      'Saída do hotel e caminhada a Syngrou-Fix',
      'Aproximadamente 650 m.',
      { ...route('A pé', ilissos, fix, '', 10), ...approximate },
    ],
    [
      'nov-22-monastiraki',
      '',
      '',
      'Metrô até Monastiraki',
      'Trocar em Syntagma para a linha 3 sentido Dimotiko Theatro. A biblioteca fica a cerca de 2 minutos a pé da estação.',
      route(
        'Metrô',
        fix,
        'Estação Monastiraki, Atenas',
        'Linha 2 → Syntagma · linha 3 → Monastiraki',
      ),
    ],
    [
      'plan-2-03',
      '09:05',
      '09:45',
      'Biblioteca de Adriano',
      'Ingresso comprado por € 10. A faixa de entrada do bilhete é 08h30–09h30.',
      {
        ...at(library),
        ...booked,
        ...paidPrice(10),
        openingHours: '08h–15h (referência de inverno)',
        ticketUrl: sources.greekTickets,
      },
    ],
    [
      'plan-3-04',
      '09:45',
      '10:15',
      'Caminhada até a Praça Syntagma',
      'Cerca de 1 km. Chegar com antecedência para escolher um local para assistir à cerimônia.',
      route('A pé', library, syntagma, '', 14),
    ],
    [
      'plan-3-06',
      '11:00',
      '',
      'Troca solene da guarda',
      'Cerimônia dominical em frente ao Parlamento. Término sujeito à duração da cerimônia e ao tempo para sair da praça.',
      at(syntagma),
    ],
    [
      'plan-3-08',
      '',
      '',
      'Caminhada até o Templo de Zeus',
      'Sair após a troca da guarda. Cerca de 1 km, além do tempo de saída da praça.',
      route('A pé', syntagma, zeus, '', 14),
    ],
    [
      'plan-3-09',
      '11:50',
      '12:35',
      'Templo de Zeus Olímpico e Arco de Adriano',
      'Ingresso comprado por € 20, com entrada entre 11h30 e 12h30. Ver o Arco de Adriano por fora no mesmo bloco.',
      { ...at(zeus), ...booked, ...paidPrice(20), ticketUrl: sources.greekTickets },
    ],
    [
      'plan-3-10',
      '',
      '',
      'Arco de Adriano · visita exterior',
      'Ver o arco durante o bloco do Templo de Zeus, entre 11h50 e 12h35.',
      at('Arco de Adriano, Atenas'),
    ],
    [
      'plan-3-11',
      '12:35',
      '13:30',
      'Almoço na região do Templo de Zeus',
      'Restaurante a escolher na região ou no caminho até a Ágora.',
      at(zeus),
    ],
    [
      'plan-3-02',
      '13:30',
      '14:00',
      'Caminhada até a Ágora Antiga',
      'Cerca de 1,5 km a partir do Templo, dependendo do restaurante. Entrada pela região da Adrianou, 24.',
      route('A pé', zeus, agora, '', 20),
    ],
    [
      'plan-3-03',
      '14:00',
      '15:30',
      'Ágora Antiga de Atenas',
      'Ingresso comprado por € 20. Entrar entre 14h e 15h.',
      { ...at(agora), ...booked, ...paidPrice(20), ticketUrl: sources.greekTickets },
    ],
    [
      'nov-22-garden-walk',
      '15:30',
      '16:00',
      'Caminhada até o Jardim Nacional',
      'Cerca de 1,5 km a partir da Ágora.',
      route('A pé', agora, garden, '', 22),
    ],
    [
      'plan-3-07',
      '16:00',
      '16:40',
      'Jardim Nacional de Atenas',
      'Passeio gratuito, sujeito ao horário de fechamento no domingo.',
      { ...at(garden), ...paidPrice(0) },
    ],
    [
      'nov-22-snack',
      '16:40',
      '18:15',
      'Lanche e caminhada ao ponto do free tour',
      'Do jardim ao ponto previsto na Taxiarchon, cerca de 1 km / 13 minutos a pé. Verificar mensagens do guia antes de sair.',
      route('A pé', garden, freeTour, '', 13),
    ],
    [
      'nov-22-checkin',
      '18:15',
      '18:20',
      'Apresentação para o free tour',
      'Chegar até 18h20. O fornecedor pode confirmar ou alterar o endereço e horário.',
      { ...at(freeTour), ...pending },
    ],
    [
      'nov-22-free-tour',
      '18:35',
      '',
      'Free tour de Atenas em italiano',
      'Reserva gratuita informada. Ponto previsto na Taxiarchon 7. O voucher sugere contribuição de € 10–15; conferir as mensagens do fornecedor.',
      {
        ...at(freeTour),
        ...booked,
        timeCertainty: 'Proposto',
        timeNote: 'Horário e encontro sujeitos à mensagem do fornecedor.',
        price: 10,
        priceMax: 15,
        priceCertainty: 'Estimativa',
      },
    ],
    [
      'corr-3-return',
      '',
      '',
      'Retorno ao Ilissos Hotel',
      'Metrô e caminhada conforme o local onde o passeio terminar.',
      at(ilissos),
    ],
  ],
  [
    [
      'plan-4-01',
      '07:00',
      '07:45',
      'Café da manhã e organização da mala',
      'Café incluído na hospedagem.',
      at(ilissos),
    ],
    [
      'plan-4-02',
      '07:45',
      '08:00',
      'Check-out do Ilissos Hotel',
      'Saída antes do limite de 11h. Conferir a taxa ambiental de € 9.',
      { ...at(ilissos), ...referencePrice(9) },
    ],
    [
      'plan-4-03',
      '08:00',
      '08:15',
      'Caminhada até Syngrou-Fix',
      'Aproximadamente 650 m a partir do hotel.',
      route('A pé', ilissos, fix, '', 10),
    ],
    [
      'plan-4-04',
      '08:15',
      '',
      'Metrô até o aeroporto de Atenas',
      'Linha 2 sentido Anthoupoli até Syntagma. Na linha 3, embarcar somente em um trem com o letreiro Airport / Αεροδρόμιο. Usar o passe de 72h se ainda estiver válido.',
      {
        ...route('Metrô', fix, ath, 'Linha 2 → Syntagma · linha 3 → Airport'),
        ...approximate,
        website: sources.athensMetro,
      },
    ],
    [
      'corr-4-airport',
      '09:45',
      '10:15',
      'Chegada estimada ao aeroporto de Atenas',
      'A janela depende da espera e da troca de metrô. Após chegar, fazer os procedimentos de embarque e conferir o portão.',
      { ...at(ath), ...approximate },
    ],
    [
      'plan-4-06',
      '12:45',
      '13:55',
      'Voo ITA AZ719 · Atenas → Roma',
      'Saída às 12h45 na Grécia. Chegada às 13h55 na Itália, Terminal 1. Valor informado de € 134,44.',
      {
        ...route('Avião', ath, fco, 'AZ719', 130),
        ...booked,
        ...paidPrice(134.44),
        endTimeZone: italy,
      },
    ],
    [
      'nov-23-train',
      '13:55',
      '',
      'Leonardo Express de Fiumicino a Termini',
      'Após desembarcar, seguir as placas para a estação e pegar o trem direto. Horário de embarque a escolher. Tarifa oficial de € 14.',
      {
        ...route('Trem', fco, termini, 'Leonardo Express', 32),
        ...pending,
        ...referencePrice(14),
        timeZone: italy,
        website: sources.leonardo,
      },
    ],
    [
      'nov-23-hotel-walk',
      '',
      '',
      'Caminhada de Termini até o Ciao Termini',
      'Referência de 650 m / 9 minutos. Contar margem com a mala.',
      { ...route('A pé', termini, ciao, '', 9), timeZone: italy },
    ],
    [
      'nov-23-checkin',
      '15:30',
      '16:30',
      'Check-in no Ciao Termini',
      'Janela estimada de chegada. A hospedagem recebe das 14h às 19h. Avisar se houver atraso. Total informado de € 224,55 incluindo imposto estimado; conferir pagamento integral.',
      { ...at(ciao), ...booked, ...approximate, timeZone: italy, address: 'Via Bixio 71, Roma' },
    ],
    [
      'nov-23-dinner',
      '',
      '',
      'Tempo livre e jantar em Roma',
      'Descanso e jantar livres. O Roma 72H é opcional, custa € 22 e não cobre o Leonardo Express.',
      { ...at('Roma'), timeZone: italy, website: sources.romePass },
    ],
  ],
  [
    [
      'nov-24-breakfast',
      '08:00',
      '08:45',
      'Café da manhã fora do hotel',
      'Preparar-se para o passeio. Café da manhã não incluído na hospedagem.',
      at(ciao),
    ],
    [
      'nov-24-walk',
      '09:00',
      '09:10',
      'Caminhada até Manzoni',
      'Cerca de 400 m.',
      route('A pé', ciao, 'Estação Manzoni, Roma', '', 6),
    ],
    [
      'nov-24-metro',
      '09:10',
      '',
      'Metrô até Ottaviano',
      'Linha A em direção a Battistini. Ao descer, caminhar cerca de 300 m / 4 minutos até a Via Germanico, 8.',
      route(
        'Metrô',
        'Estação Manzoni, Roma',
        'Estação Ottaviano, Roma',
        'Linha A sentido Battistini',
      ),
    ],
    [
      'nov-24-meet',
      '',
      '10:00',
      'Chegar ao ponto de encontro do tour do Vaticano',
      'Apresentar-se até 10h, com 15 minutos de antecedência. Cobrir ombros e joelhos.',
      at(vaticanMeeting),
    ],
    [
      'nov-24-vatican',
      '10:15',
      '13:15',
      'Museus Vaticanos, Capela Sistina e Basílica de São Pedro',
      'Tour reservado em italiano pela GetYourGuide com a Enjoy Rome. Término estimado na Praça de São Pedro. Preço anunciado de € 69; valor pago a conferir.',
      {
        ...at('Museus Vaticanos, Vaticano'),
        ...booked,
        ...referencePrice(69),
        timeNote: 'Início confirmado; término estimado.',
      },
    ],
    [
      'nov-24-mcd-walk',
      '13:15',
      '13:25',
      'Caminhada ao McDonald’s Borgo Pio',
      'Aproximadamente 350 m.',
      route('A pé', vaticanEnd, mcdonalds, '', 5),
    ],
    [
      'nov-24-lunch',
      '13:25',
      '13:55',
      'Almoço no McDonald’s Borgo Pio',
      'Almoço rápido para manter a janela da visita seguinte.',
      at(mcdonalds),
    ],
    [
      'nov-24-vicus-walk',
      '13:55',
      '14:35',
      'Caminhada até o Vicus Caprarius',
      'Aproximadamente 2,5 km. Chegada estimada às 14h35, com margem antes do horário solicitado.',
      route('A pé', mcdonalds, vicus, '', 35),
    ],
    [
      'nov-24-vicus',
      '15:00',
      '15:40',
      'Vicus Caprarius · visita guiada em italiano',
      'Visita solicitada à secretaria. Aguardar a confirmação do horário. Tarifa oficial de € 8 para visita guiada; duração prevista de 40 minutos.',
      {
        ...at(vicus),
        ...pending,
        ...referencePrice(8),
        timeCertainty: 'Proposto',
        website: sources.vicus,
      },
    ],
    [
      'nov-24-gamm-walk',
      '15:40',
      '16:05',
      'Caminhada até o GAMM',
      'Aproximadamente 1,4 km, se o Vicus terminar às 15h40.',
      route('A pé', vicus, gamm, '', 21),
    ],
    [
      'nov-24-gamm',
      '16:15',
      '18:10',
      'GAMM Game Museum',
      'Comprar na bilheteria. Tarifa inteira de € 15; conferir a promoção de terça-feira de € 10 e a disponibilidade.',
      {
        ...at(gamm),
        ...pending,
        ...referencePrice(10, 15),
        openingHours: '09h30–19h30',
        website: sources.gamm,
      },
    ],
    [
      'nov-24-emporio-walk',
      '18:10',
      '18:25',
      'Caminhada até o Empório Brasileiro',
      'Cerca de 1 km a partir do GAMM. Chegada estimada entre 18h25 e 18h40.',
      route('A pé', gamm, emporio, '', 14),
    ],
    [
      'nov-24-dinner',
      '18:30',
      '',
      'Jantar no Empório Brasileiro',
      'Sem reserva de mesa. Confirmar pratos disponíveis. Estimativa de € 20–30 conforme o pedido.',
      { ...at(emporio), ...approximate, price: 20, priceMax: 30, priceCertainty: 'Estimativa' },
    ],
    [
      'nov-24-return',
      '',
      '',
      'Caminhada ao Ciao Termini',
      'Cerca de 1,4 km depois do jantar.',
      route('A pé', emporio, ciao, '', 19),
    ],
  ],
  [
    [
      'nov-25-breakfast',
      '07:15',
      '08:00',
      'Café da manhã fora do hotel',
      'Preparar-se para sair às 08h.',
      at(ciao),
    ],
    [
      'nov-25-manzoni',
      '08:00',
      '08:10',
      'Caminhada até Manzoni',
      'Cerca de 400 m.',
      route('A pé', ciao, 'Estação Manzoni, Roma', '', 6),
    ],
    [
      'nov-25-borghese-route',
      '08:10',
      '09:00',
      'Metrô e caminhada até a Galleria Borghese',
      'Linha A sentido Battistini até Spagna. Caminhar aproximadamente 1,3 km / 18 minutos e reservar margem para a saída da estação e os jardins.',
      { ...route('Metrô', 'Estação Manzoni, Roma', borghese, 'Linha A → Spagna'), ...approximate },
    ],
    [
      'nov-25-borghese',
      '09:30',
      '11:30',
      'Galleria Borghese',
      'Ingresso comprado por € 18. Chegar por volta das 09h e levar ingresso e documento de identificação.',
      {
        ...at(borghese),
        ...booked,
        ...paidPrice(18),
        website: 'https://galleriaborghese.beniculturali.it/',
      },
    ],
    [
      'nov-25-villa',
      '11:30',
      '12:00',
      'Jardins da Villa Borghese',
      'Passeio curto pelos jardins.',
      at('Villa Borghese, Roma'),
    ],
    [
      'nov-25-bk-walk',
      '12:00',
      '12:35',
      'Caminhada ao Burger King',
      'Da galeria, a referência é de 2,3–2,4 km / 31–32 minutos. A distância pode mudar conforme a saída dos jardins.',
      route('A pé', 'Villa Borghese, Roma', burgerKing),
    ],
    [
      'nov-25-lunch',
      '12:35',
      '13:10',
      'Almoço no Burger King',
      'Unidade da Via Nazionale.',
      at(burgerKing),
    ],
    [
      'nov-25-oakberry-walk',
      '13:10',
      '13:45',
      'Caminhada até a Oakberry',
      'Cerca de 2,2 km a partir do Burger King.',
      route('A pé', burgerKing, oakberry, '', 30),
    ],
    [
      'nov-25-acai',
      '13:45',
      '14:15',
      'Açaí na Oakberry',
      'Sobremesa antes de seguir ao Planetário.',
      at(oakberry),
    ],
    [
      'nov-25-flaminio',
      '14:15',
      '14:30',
      'Caminhada até a estação Flaminio',
      'Cerca de 200 m. A saída planejada de metrô é às 14h30.',
      route('A pé', oakberry, 'Estação Flaminio, Roma', '', 3),
    ],
    [
      'nov-25-planetarium-route',
      '14:30',
      '15:30',
      'Metrô e caminhada até o Planetário de Roma',
      'Linha A sentido Anagnina até Termini, linha B sentido Laurentina até EUR Fermi. Caminhar cerca de 800 m / 12 minutos. Chegada estimada entre 15h15 e 15h30.',
      {
        ...route('Metrô', 'Estação Flaminio, Roma', planetarium, 'A → Termini · B → EUR Fermi', 45),
        ...approximate,
      },
    ],
    [
      'nov-25-stars',
      '16:00',
      '',
      'Planetário · Ritorno alle stelle',
      'Sessão publicada para 16h. Ingresso a comprar, preferencialmente na bilheteria. Disponibilidade a conferir.',
      {
        ...at(planetarium),
        ...pending,
        ...referencePrice(8.5),
        website: sources.planetarium,
        ticketUrl: sources.planetariumTickets,
      },
    ],
    [
      'nov-25-voyager',
      '17:00',
      '',
      'Planetário · Interstellari — il viaggio delle sonde Voyager',
      'Sessão publicada para 17h. Ingresso a comprar. As duas sessões custam € 17 na tarifa inteira de bilheteria; a pré-venda online acrescenta € 1 por ingresso.',
      {
        ...at(planetarium),
        ...pending,
        ...referencePrice(8.5),
        website: sources.planetarium,
        ticketUrl: sources.planetariumTickets,
      },
    ],
    [
      'nov-25-dinner-route',
      '18:00',
      '',
      'Metrô e caminhada até a Churrascaria dos Amigos',
      'Descer a pé até EUR Fermi. Linha B sentido Rebibbia ou Jonio até Termini. Linha A sentido Battistini até Cornelia, depois cerca de 850 m / 11 minutos a pé.',
      {
        ...route('Metrô', planetarium, churrascaria, 'B → Termini · A → Cornelia'),
        ...approximate,
      },
    ],
    [
      'nov-25-dinner',
      '19:15',
      '',
      'Jantar na Churrascaria dos Amigos',
      'Janela de chegada 19h15–19h45. Sem reserva de mesa. Confirmar se haverá feijoada à la carte e o preço.',
      { ...at(churrascaria), ...approximate, ...pending },
    ],
    [
      'nov-25-return',
      '',
      '',
      'Retorno ao Ciao Termini',
      'Andar até Cornelia, linha A sentido Anagnina até Manzoni, e caminhar 6–7 minutos até o hotel.',
      route('Metrô', churrascaria, ciao, 'Linha A · Cornelia → Manzoni'),
    ],
  ],
  [
    [
      'nov-26-checkout',
      '07:30',
      '09:15',
      'Café da manhã, bagagem e check-out',
      'Café da manhã fora. A janela oficial de check-out do hotel é 08h–11h.',
      at(ciao),
    ],
    [
      'nov-26-termini',
      '09:15',
      '09:30',
      'Caminhada do Ciao Termini a Roma Termini',
      'Reservar cerca de 10–20 minutos com mala.',
      route('A pé', ciao, termini),
    ],
    [
      'nov-26-platform',
      '09:30',
      '10:00',
      'Bilhete e plataforma em Roma Termini',
      'Comprar ou apresentar o bilhete e localizar o trem. Conferir a partida também na véspera.',
      { ...at(termini), ...pending },
    ],
    [
      'nov-26-train',
      '10:05',
      '10:37',
      'Leonardo Express de Termini a Fiumicino',
      'Partida planejada. Alternativas consultadas: 10h20–10h52 e 10h35–11h07. Aviso da Trenitalia cancela dois trens noturnos em 25–26/11; conferir o serviço da manhã antes da viagem.',
      {
        ...route('Trem', termini, fco, 'Leonardo Express', 32),
        ...pending,
        ...referencePrice(14),
        website: sources.leonardo,
        ticketUrl: sources.trenitaliaUpdates,
      },
    ],
    [
      'nov-26-airport',
      '10:37',
      '',
      'Procedimentos de embarque em Fiumicino',
      'Seguir ao terminal, passar pela segurança e conferir o portão. Apresentar o cartão de embarque do FR3946.',
      { ...at(fco), ...approximate },
    ],
    [
      'nov-26-flight',
      '13:50',
      '15:00',
      'Voo Ryanair FR3946 · Roma Fiumicino → Palermo',
      `Voo confirmado e pago. Saída de Roma Fiumicino (FCO) às 13h50, com chegada a Palermo (PMO) às 15h00. A passagem inclui ${RYANAIR_RETURN_BAG}.`,
      {
        ...route('Avião', fco, pmo, 'FR3946', 70),
        ...booked,
        ...paidPrice(RYANAIR_RETURN_PRICE),
        timeCertainty: 'Confirmado',
      },
    ],
    [
      'nov-26-luggage',
      '15:00',
      '16:30',
      'Desembarque e retirada do carro no P1 Lunga Sosta',
      'Após o desembarque, caminhar cerca de 6 minutos até o P1 Lunga Sosta. Usar o QR code do e-mail. A retirada do carro está estimada entre 16h30 e 17h.',
      {
        ...route('A pé', pmo, PALERMO_PARKING, '', 6),
        ...approximate,
        timeNote:
          'Saída indicada na reserva às 23h00. O intervalo do roteiro é uma estimativa do desembarque e do deslocamento até o estacionamento.',
      },
    ],
    [
      'nov-26-drive',
      '16:30',
      '',
      'Retorno de carro a Santo Stefano',
      'A saída pode variar entre 16h e 17h, conforme o desembarque. Cerca de 130 km e 1h30–2h. Chegada estimada entre 17h30 e 19h.',
      { ...route('Carro', PALERMO_PARKING, home, '', 90), ...approximate },
    ],
  ],
];

export function itineraryActivities(): Activity[] {
  return rows.flatMap((day, index) =>
    day.map(([id, start, end, title, description, details]) => {
      const date = tripDates[index];
      const activity: Activity = {
        ...emptyActivity(date),
        id,
        start,
        end,
        title,
        description,
        timeZone: index === 0 || index >= 4 ? italy : athens,
        confirmation: 'Planejada',
        timeCertainty: 'Planejado',
        ...details,
      };
      if (start && end)
        activity.duration = (activityInstant(activity, 'end') - activityInstant(activity)) / 60_000;
      return activity;
    }),
  );
}
