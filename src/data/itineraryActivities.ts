import { emptyActivity } from './factories';
import { tripDates, type Activity } from './schema';
import { activityInstant } from '../lib/domain';

const athens = 'Europe/Athens';
const italy = 'Europe/Rome';
const ilissos = 'Ilissos Hotel, Kallirrois 72, Atenas';
const ciao = 'Ciao Termini, Via Bixio 71, Roma';
const ath = 'Aeroporto Internacional de Atenas (ATH)';
const athensAirportMetro = 'Estação de metrô do aeroporto de Atenas';
const pmo = 'Aeroporto de Palermo (PMO)';
export const PALERMO_PARKING = 'P1 Lunga Sosta, Aeroporto de Palermo (PMO)';
export const PALERMO_PARKING_PRICE = 65;
export const RYANAIR_RETURN_PRICE = 64.89;
export const RYANAIR_RETURN_BAG = 'uma mala pequena de até 40 × 30 × 20 cm';
const fco = 'Aeroporto de Roma Fiumicino (FCO)';
const termini = 'Roma Termini';
const syntagma = 'Túmulo do Soldado Desconhecido, Praça Syntagma, Atenas';
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
  athensAirportMetro: 'https://www.stasy.gr/en/timetables/line-3/',
  greekTickets: 'https://hhticket.gr/',
  leonardo: 'https://www.trenitalia.com/it/regionale/collegamenti-regionale/leonardo-express.html',
  trenitaliaUpdates:
    'https://www.trenitalia.com/it/informazioni/infomobilita/notizie-infomobilita.html',
  romePass: 'https://www.atac.roma.it/biglietti-e-abbonamenti/roma72h',
  romeBit: 'https://www.atac.roma.it/biglietti-e-abbonamenti/bit',
  lycabettus: 'https://www.lycabettushill.com/cable-car/',
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
      '07:40',
      '07:50',
      'Saída de Santo Stefano de carro',
      'Cerca de 130 km pela A20/A19/A29, com pedágio. Planejar 1h35–2h de carro e chegar ao P1 entre 09h15 e 09h50.',
      { ...route('Carro', home, PALERMO_PARKING, '', 95), ...approximate },
    ],
    [
      'nov-20-parking',
      '',
      '10:00',
      'P1 Lunga Sosta · estacionamento e ida ao terminal',
      'Reserva paga. Vigência a partir de 09h00 de 20/11 até 23h00 de 26/11. Escanear na cancela de entrada o QR do PDF enviado por e-mail. Do P1 ao terminal são cerca de 600 m, ou 8–12 minutos com mala.',
      {
        ...at(PALERMO_PARKING),
        ...booked,
        ...approximate,
        ...paidPrice(PALERMO_PARKING_PRICE),
        timeNote:
          'Meta de chegada ao terminal por volta das 10h. A entrada da reserva está indicada para 09h00.',
      },
    ],
    [
      'plan-1-06',
      '10:00',
      '12:00',
      'Procedimentos no aeroporto de Palermo',
      'Ter os dois cartões de embarque à mão. Se despachar mala, confirmar na etiqueta que o destino final é ATH. Passar pela segurança e procurar o portão até 12h.',
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
      'Conexão na mesma passagem. Do pouso às 13h50 até a partida seguinte são 1h45. Seguir Connettenti / Flight Connections e ir direto ao portão do AZ718. A ITA informa fechamento 15 minutos antes da partida, às 15h20.',
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
      'Prever 30–55 minutos do pouso até a estação e a compra do passe. Após retirar a bagagem, seguir as placas Train / Metro e atravessar a passarela no nível de partidas até a estação.',
      {
        ...route('A pé', ath, athensAirportMetro, '', 10),
        timeZone: athens,
        ...approximate,
      },
    ],
    [
      'plan-1-11',
      '',
      '',
      'Comprar o passe turístico de Atenas',
      'Comprar o 3-day Tourist Ticket de € 20 na máquina ou bilheteria da estação. Validar na entrada e guardar até segunda. São 72h a partir da primeira validação, incluindo uma ida e uma volta entre aeroporto e cidade.',
      {
        ...at(athensAirportMetro),
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
      'Linha 3: 19h22 → 20h01 ou 19h58 → 20h37 até Syntagma, conforme o desembarque. Se precisar, a próxima saída é 20h34. Em Syntagma, trocar para a linha 2 sentido Elliniko. Prever 8–15 min para troca, espera e dois pontos até Syngrou-Fix.',
      {
        ...route('Metrô', athensAirportMetro, fix, 'Linha 3 → Syntagma · linha 2 → Elliniko', 50),
        timeZone: athens,
        website: sources.athensAirportMetro,
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
      '20:20',
      '21:10',
      'Chegada e check-in no Ilissos Hotel',
      'Chegada estimada se embarcar às 19h22 ou 19h58. Se pegar o metrô das 20h34, prever 21h30–21h45. Café da manhã incluído em 21, 22 e 23/11. Taxa ambiental de € 9 indicada para pagamento no hotel.',
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
      'Acropoli fica a uma estação. Prever 10–20 minutos da entrada em Syngrou-Fix até a saída da estação Acropoli, contando espera e caminhada interna.',
      route('Metrô', fix, acropoli, 'Linha 2 sentido Anthoupoli', 15),
    ],
    [
      'plan-2-10',
      '',
      '09:15',
      'Chegar ao ponto de encontro do guia',
      'Chegar até 09h15 à entrada principal da estação Acropoli. O guia confirmou apresentação entre 09h20 e 09h25. O botão Ir no mapa usa o ponto enviado pelo guia por e-mail.',
      at(acropoli),
    ],
    [
      'plan-2-11',
      '09:30',
      '14:00',
      'Tour da Acrópole, Partenon e Museu da Acrópole',
      'Tour Civitatis / Secrets of Greece em italiano, com entradas incluídas. Baixar o ingresso da Acrópole enviado por e-mail, válido para entrada entre 09h e 10h. O guia prevê o museu às 12h e informou que enviará as instruções na sexta. Término estimado às 14h.',
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
      'Restaurante a escolher. Se o tour terminar depois das 14h20, encurtar ou pular Filopapo e seguir do museu direto ao Kotsanas, cerca de 25–35 minutos a pé.',
      { ...at(museum), price: 15, priceMax: 25, priceCertainty: 'Estimativa' },
    ],
    [
      'nov-21-filopapo-walk',
      '14:50',
      '15:20',
      'Caminhada e subida a Filopapo',
      'Cerca de 1 km, com subida. Planejar 20–30 minutos até o monumento.',
      route('A pé', museum, filopapo, '', 25),
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
      'Aproximadamente 2,5 km desde o monumento. Planejar 35–45 minutos, com descida e travessias. Priorizar a chegada ao Kotsanas até 16h45 para fazer a visita com calma.',
      route('A pé', filopapo, kotsanas, '', 40),
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
      'Subida de cerca de 15–25 minutos até a estação inferior, na esquina de Ploutarchou e Aristippou, em Kolonaki.',
      route('A pé', kotsanas, funicular, '', 20),
    ],
    [
      'nov-21-lycabettus',
      '18:10',
      '',
      'Monte Licabeto · passeio opcional',
      'Vista noturna, se houver disposição. O funicular leva cerca de 3 minutos e costuma sair a cada 30 minutos. Conferir o painel na estação. Preço de referência: € 13 ida e volta ou € 10 por trecho.',
      { ...at(funicular), ...referencePrice(13), website: sources.lycabettus },
    ],
    [
      'plan-2-14',
      '',
      '',
      'Jantar e retorno ao Ilissos',
      'Restaurante e horário livres. De Evangelismos, usar a linha 3 até Syntagma, trocar pela linha 2 sentido Elliniko, descer em Syngrou-Fix e caminhar até o hotel. Prever 25–40 minutos da estação Evangelismos até o Ilissos.',
      route('Metrô', 'Evangelismos, Atenas', ilissos, 'Linha 3 → Syntagma · linha 2 → Syngrou-Fix', 30),
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
      'Linha 2 sentido Anthoupoli até Syntagma. Trocar para a linha 3 sentido Dimotiko Theatro. Prever 20–30 minutos incluindo a troca e a caminhada de 2–4 minutos da estação Monastiraki até a biblioteca.',
      route(
        'Metrô',
        fix,
        'Estação Monastiraki, Atenas',
        'Linha 2 → Syntagma · linha 3 → Monastiraki',
        25,
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
      'Cerca de 1 km e 15–20 minutos pela Ermou. A margem até 10h15 serve para escolher onde assistir em frente ao Túmulo do Soldado Desconhecido.',
      route('A pé', library, syntagma, '', 14),
    ],
    [
      'plan-3-06',
      '11:00',
      '11:25',
      'Troca solene da guarda',
      'A cerimônia dominical começa às 11h em frente ao Parlamento. Término estimado. Após a cerimônia, seguir pela avenida Vasilissis Amalias rumo ao Templo de Zeus.',
      at(syntagma),
    ],
    [
      'plan-3-08',
      '11:25',
      '11:50',
      'Caminhada até o Templo de Zeus',
      'Prever 15–25 minutos incluindo a saída da praça. Ir à entrada do Olympieion pela avenida Vasilissis Olgas. Passar pelo Arco de Adriano depois da entrada no sítio se a cerimônia atrasar.',
      route('A pé', syntagma, zeus, '', 14),
    ],
    [
      'plan-3-09',
      '11:50',
      '12:35',
      'Templo de Zeus Olímpico e Arco de Adriano',
      'Ingresso comprado por € 20, com entrada entre 11h30 e 12h30. Ver o Arco de Adriano por fora no mesmo bloco.',
      { ...at(zeus), ...booked, ...paidPrice(20), openingHours: '08h–15h (inverno)', ticketUrl: sources.greekTickets, website: 'https://www.hh.gr/en/destinations/olympieion/' },
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
      'Cerca de 1,5 km e 20–30 minutos a partir do Templo, dependendo do restaurante. Entrada pela Adrianou, 24. A meta é chegar às 14h.',
      route('A pé', zeus, agora, '', 20),
    ],
    [
      'plan-3-03',
      '14:00',
      '15:30',
      'Ágora Antiga de Atenas',
      'Ingresso comprado por € 20. Entrar entre 14h e 15h.',
      { ...at(agora), ...booked, ...paidPrice(20), openingHours: '08h–17h (inverno)', ticketUrl: sources.greekTickets, website: 'https://www.hh.gr/en/destinations/ancient-agora-athens/' },
    ],
    [
      'nov-22-garden-walk',
      '15:30',
      '16:00',
      'Caminhada até o Jardim Nacional',
      'Cerca de 1,5 km a partir da Ágora. Prever 20–30 minutos até a entrada pela avenida Vasilissis Amalias.',
      route('A pé', agora, garden, '', 22),
    ],
    [
      'plan-3-07',
      '16:00',
      '16:40',
      'Jardim Nacional de Atenas',
      'Passeio gratuito. O jardim fecha ao pôr do sol, cerca de 17h09 neste domingo. Se chegar às 16h, dá para sair pelo lado do Zappeion e ver a fachada antes do lanche.',
      { ...at(garden), ...paidPrice(0), openingHours: 'Do nascer ao pôr do sol', website: 'https://green-athens.gr/en/national-garden/' },
    ],
    [
      'nov-22-snack',
      '16:40',
      '18:15',
      'Lanche e caminhada ao ponto do free tour',
      'Do jardim ou do Zappeion ao ponto previsto, reservar 15–25 minutos a pé, além do lanche. Se o fornecedor confirmar Taxiarchon 7, iniciar a caminhada até 17h50.',
      route('A pé', garden, freeTour, '', 20),
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
      'O voucher mostra 18h35 e Taxiarchon 7. O fornecedor confirma o horário e o ponto exatos. Duração publicada de 2–3 horas e contribuição voluntária sugerida de € 10–15.',
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
      'Se terminar na região de Monastiraki ou Plaka, prever 25–40 minutos até o Ilissos. Pelo metrô, usar Syntagma e a linha 2 sentido Elliniko até Syngrou-Fix. A obra noturna da linha 2 afeta estações ao norte de Attiki.',
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
      'Linha 2 sentido Anthoupoli até Syntagma. Estar na plataforma da linha 3 até 08h45. Na tabela STASY, os trens Airport saem às 08h54 e 09h30 e chegam às 09h34 e 10h10. Usar o passe validado na sexta-feira.',
      {
        ...route('Metrô', fix, athensAirportMetro, 'Linha 2 → Syntagma · linha 3 → Airport', 80),
        ...approximate,
        website: sources.athensAirportMetro,
      },
    ],
    [
      'corr-4-airport',
      '09:40',
      '10:25',
      'Chegada estimada ao aeroporto de Atenas',
      'Da estação até o terminal, prever 8–15 minutos. A janela cobre os trens das 08h54 e 09h30. Seguir ao check-in ou à segurança e conferir o portão do AZ719.',
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
      '14:38',
      '',
      'Leonardo Express de Fiumicino a Termini',
      'O voo chega às 13h55. Prever 25–55 minutos para desembarque, eventual bagagem e acesso à estação. Opções na grade regular: 14h38 → 15h10 ou 14h53 → 15h25. Com atraso, pegar a próxima saída. Tarifa de € 14.',
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
      'Sair de Termini pelo lado da Via Giolitti. Prever 10–20 minutos a pé com a mala para chegar à Via Bixio, 71.',
      { ...route('A pé', termini, ciao, '', 15), timeZone: italy },
    ],
    [
      'nov-23-checkin',
      '15:30',
      '16:30',
      'Check-in no Ciao Termini',
      'Janela estimada de chegada. A hospedagem recebe das 14h às 19h. Avisar se houver atraso. Hospedagem de € 206,55 já paga; taxa municipal de € 18 a pagar na acomodação.',
      { ...at(ciao), ...booked, ...approximate, ...referencePrice(18), timeZone: italy, address: 'Via Bixio 71, Roma' },
    ],
    [
      'nov-23-dinner',
      '',
      '',
      'Tempo livre e jantar em Roma',
      'Descanso e jantar livres. O orçamento usa cinco bilhetes urbanos BIT (total € 7,50). O Roma 72H de € 22 é uma alternativa; o Leonardo Express tem bilhete próprio.',
      { ...at('Roma'), timeZone: italy, website: sources.romeBit },
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
      'Linha A sentido Battistini. Prever 25–40 minutos de Manzoni ao ponto de encontro, com espera, saída em Ottaviano e caminhada de 4–7 minutos à Via Germanico, 8.',
      {
        ...route(
          'Metrô',
          'Estação Manzoni, Roma',
          'Estação Ottaviano, Roma',
          'Linha A sentido Battistini',
          30,
        ),
        ...referencePrice(1.5),
        website: sources.romeBit,
      },
    ],
    [
      'nov-24-meet',
      '',
      '10:00',
      'Chegar ao ponto de encontro do tour do Vaticano',
      'Apresentar-se até 10h na Via Germanico, 8. Ida do hotel ao encontro em 35–50 minutos. Levar documento e cobrir ombros e joelhos.',
      at(vaticanMeeting),
    ],
    [
      'nov-24-vatican',
      '10:15',
      '13:15',
      'Museus Vaticanos, Capela Sistina e Basílica de São Pedro',
      'Tour em italiano com duração anunciada de 3 horas. Término estimado na região de São Pedro. A Basílica e a Capela Sistina estão sujeitas a mudanças de acesso por decisão do Vaticano.',
      {
        ...at('Museus Vaticanos, Vaticano'),
        ...booked,
        ...paidPrice(69),
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
      'Se o tour atrasar, encurtar o almoço ou comer no caminho para chegar ao Vicus antes das 15h.',
      at(mcdonalds),
    ],
    [
      'nov-24-vicus-walk',
      '13:55',
      '14:35',
      'Caminhada até o Vicus Caprarius',
      'Sair do Borgo Pio até 14h. Chegada prevista entre 14h35 e 14h55 ao Vicolo del Puttarello, 25, para a visita das 15h.',
      route('A pé', mcdonalds, vicus, '', 35),
    ],
    [
      'nov-24-vicus',
      '15:00',
      '15:30',
      'Vicus Caprarius · visita guiada em italiano',
      'Visita confirmada às 15h, com guia em italiano. O término está previsto entre 15h20 e 15h30.',
      {
        ...at(vicus),
        ...booked,
        ...referencePrice(8),
        timeCertainty: 'Confirmado',
        website: sources.vicus,
      },
    ],
    [
      'nov-24-gamm-walk',
      '15:30',
      '15:51',
      'Caminhada até o GAMM',
      'Saia logo após a visita ao Vicus. São cerca de 21 minutos a pé, com chegada prevista entre 15h41 e 15h51.',
      { ...route('A pé', vicus, gamm, '', 21), ...approximate },
    ],
    [
      'nov-24-gamm',
      '16:15',
      '18:10',
      'GAMM Game Museum',
      'Visita planejada das 16h15 às 18h10. Se chegar antes, você pode decidir na hora se entra mais cedo. Na terça-feira, o ingresso custa € 10 na bilheteria.',
      {
        ...at(gamm),
        ...referencePrice(10),
        openingHours: '09h30–19h30',
        website: sources.gamm,
      },
    ],
    [
      'nov-24-emporio-walk',
      '18:10',
      '18:25',
      'Caminhada até o Empório Brasileiro',
      'Prever 12–20 minutos a pé até o Empório da Via Milazzo, 41/43. Chegada estimada entre 18h25 e 18h40.',
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
      'Caminhada de cerca de 15–25 minutos até o Ciao Termini depois do jantar.',
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
      'Linha A sentido Battistini até Spagna. Planejar 18–25 minutos de caminhada até Piazzale Scipione Borghese, 5, incluindo a saída e a subida. Prever 35–50 minutos desde Manzoni.',
      { ...route('Metrô', 'Estação Manzoni, Roma', borghese, 'Linha A → Spagna', 45), ...approximate },
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
      'Prever 30–40 minutos. A distância depende do ponto em que terminar a caminhada nos jardins. Se houver atraso, preservar a ida ao Planetário.',
      route('A pé', 'Villa Borghese, Roma', burgerKing, '', 35),
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
      'Cerca de 2,2 km e 30–40 minutos a partir do Burger King. Se o almoço atrasar, encurtar a parada do açaí para estar em Flaminio até 14h30.',
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
      'Linha A sentido Anagnina até Termini, linha B sentido Laurentina até EUR Fermi. Caminhar 10–15 minutos até Piazza Giovanni Agnelli, 10. Reservar 45–60 minutos no total e chegar até 15h30.',
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
      'Sessão publicada para 16h. Ingresso a comprar. Chegar até 15h30 para retirar ou comprar os dois ingressos e localizar a entrada.',
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
      'Sessão publicada para 17h. Ingresso a comprar. As duas sessões custam € 17 na bilheteria ou € 19 na pré-venda.',
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
      'Descer a pé até EUR Fermi. Linha B sentido Rebibbia ou Jonio até Termini. Linha A sentido Battistini até Cornelia, depois 12–18 minutos a pé. Prever 65–90 minutos com a troca e a espera.',
      {
        ...route('Metrô', planetarium, churrascaria, 'B → Termini · A → Cornelia', 75),
        ...approximate,
      },
    ],
    [
      'nov-25-dinner',
      '19:15',
      '',
      'Jantar na Churrascaria dos Amigos',
      'Janela de chegada 19h15–19h45. O restaurante publica abertura às 18h na quarta. A mesa e a disponibilidade de feijoada seguem a confirmar.',
      { ...at(churrascaria), ...approximate, ...pending },
    ],
    [
      'nov-25-return',
      '',
      '',
      'Retorno ao Ciao Termini',
      'Andar até Cornelia, pegar a linha A sentido Anagnina até Manzoni e caminhar mais 6–10 minutos até o hotel. Prever 40–55 minutos no total.',
      route('Metrô', churrascaria, ciao, 'Linha A · Cornelia → Manzoni', 45),
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
      '09:35',
      'Caminhada do Ciao Termini a Roma Termini',
      'Reservar cerca de 10–20 minutos com mala.',
      route('A pé', ciao, termini, '', 15),
    ],
    [
      'nov-26-platform',
      '09:35',
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
      'Da estação até o terminal, planejar 10–15 minutos e seguir a indicação do cartão de embarque. Passar pela segurança e mirar o portão até 13h. A Ryanair informa fechamento do portão às 13h20 para a saída das 13h50.',
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
      '16:00',
      'Desembarque e retirada do carro no P1 Lunga Sosta',
      'A reserva da Ryanair inclui mala pequena de cabine. Prever 25–60 minutos do pouso até o carro, incluindo 8–12 minutos a pé ao P1. A saída é pela leitura da placa. Manter o QR disponível se precisar de assistência.',
      {
        ...route('A pé', pmo, PALERMO_PARKING, '', 10),
        ...approximate,
        timeNote:
          'Saída indicada na reserva às 23h00. O intervalo do roteiro é uma estimativa do desembarque e do deslocamento até o estacionamento.',
      },
    ],
    [
      'nov-26-drive',
      '16:00',
      '',
      'Retorno de carro a Santo Stefano',
      'Com pouso no horário, prever saída do P1 entre 15h30 e 16h. São cerca de 130 km e 1h35–2h de estrada. Chegada estimada entre 17h05 e 18h, sujeita ao trânsito e ao voo.',
      { ...route('Carro', PALERMO_PARKING, home, '', 95), ...approximate },
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
