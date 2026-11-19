import { itineraryActivities } from './itineraryActivities';
import type { Activity } from './schema';

type PhotoLicense = 'CC BY 2.0' | 'CC BY-SA 3.0' | 'CC BY-SA 4.0';

export const metroPhotos = {
  airport: {
    file: 'ath-airport',
    original: 'Athens_Airport_suburban_rail_and_metro_station.jpg',
    caption: 'Plataformas da estação ferroviária do aeroporto de Atenas.',
    author: 'George Kokkinidis-GR',
    license: 'CC BY-SA 4.0',
  },
  airportBridge: {
    file: 'ath-airport-bridge',
    original: 'Athens_airport_train_station.jpg',
    caption: 'Passarela coberta que liga o terminal à estação do aeroporto de Atenas.',
    author: 'Peloponnisios',
    license: 'CC BY-SA 4.0',
  },
  airportGates: {
    file: 'ath-airport-gates',
    original: 'Athens_International_Airport_metro_-_1.jpg',
    caption: 'Catracas do metrô na estação do aeroporto de Atenas.',
    author: 'AleWi',
    license: 'CC BY-SA 4.0',
  },
  syntagma: {
    file: 'ath-syntagma',
    original: 'Entrance_of_Syntagma_station.jpg',
    caption: 'Placa “Platforms” no saguão da estação Syntagma.',
    author: 'HerrGutmannsWiki',
    license: 'CC BY-SA 4.0',
  },
  fix: {
    file: 'ath-syngrou-fix',
    original: 'Sygrou-Fix_metro_station_entrance_Sygrou.jpg',
    caption: 'Um dos acessos a Syngrou-Fix pela avenida Syngrou.',
    author: 'Argybz',
    license: 'CC BY-SA 4.0',
  },
  acropoli: {
    file: 'ath-acropoli',
    original: 'Akropoli_metro_station_entrance_Makrygianni.jpg',
    caption: 'Entrada da estação Acropoli na rua Makrygianni, perto do ponto de encontro.',
    author: 'Argybz',
    license: 'CC BY-SA 4.0',
  },
  monastiraki: {
    file: 'ath-monastiraki',
    original: 'Monastiraki_station.jpg',
    caption: 'Plataforma da estação Monastiraki.',
    author: 'Юкатан',
    license: 'CC BY-SA 3.0',
  },
  manzoni: {
    file: 'rome-manzoni',
    original: "L'ingresso_della_metropolitana_di_Manzoni.jpg",
    caption: 'Acesso de rua à estação Manzoni, em Roma.',
    author: 'Simone Ramella',
    license: 'CC BY 2.0',
  },
  ottaviano: {
    file: 'rome-ottaviano',
    original:
      'Entrée_Station_Métro_Ottaviano_San_Pietro_Viale_Guilio_Cesare_-_Rome_(IT62)_-_2021-08-28_-_2.jpg',
    caption: 'Acesso à estação Ottaviano na Viale Giulio Cesare.',
    author: 'Chabe01',
    license: 'CC BY-SA 4.0',
  },
} satisfies Record<
  string,
  { file: string; original: string; caption: string; author: string; license: PhotoLicense }
>;

export type MetroPhotoId = keyof typeof metroPhotos;
type MetroLine = '2' | '3' | 'A' | 'B';

type MetroStep = {
  title: string;
  text: string;
  line?: MetroLine;
  sign?: string;
  map?: { label: string; destination: string; origin?: string };
  photo?: MetroPhotoId;
};

type MetroGuide = {
  stations: string[];
  summary: string;
  steps: MetroStep[];
  sources: { label: string; url: string }[];
};

const athensLine2 = { label: 'Linha 2 · STASY', url: 'https://www.stasy.gr/en/timetables/line-2/' };
const athensLine3 = {
  label: 'Linha 3 e horários do aeroporto · STASY',
  url: 'https://www.stasy.gr/en/timetables/line-3/',
};
const hotelDirections = {
  label: 'Caminho oficial do Ilissos',
  url: 'https://ilissos.reserve-online.net/directions',
};
const romeNetwork = {
  label: 'Mapa oficial · ATAC',
  url: 'https://www.atac.roma.it/en/utility/maps',
};
const romeFare = {
  label: 'Bilhete BIT · ATAC',
  url: 'https://www.atac.roma.it/biglietti-e-abbonamenti/bit',
};
const romeUpdates = {
  label: 'Avisos de serviço · Roma Mobilità',
  url: 'https://romamobilita.it/infomobilita/in-agenda/',
};

const fix = 'Estação Syngrou-Fix, Atenas';
const ilissos = 'Ilissos Hotel, Kallirrois 72, Atenas';
const monastiraki = 'Estação Monastiraki, Atenas';
const manzoni = 'Estação Manzoni, Roma';
const ottaviano = 'Estação Ottaviano, Roma';
const eurFermi = 'Estação EUR Fermi, Roma';
const cornelia = 'Estação Cornelia, Roma';
const planetarium = 'Planetário de Roma, Piazza Giovanni Agnelli 10, Roma';
const churrascaria = 'Churrascaria dos Amigos, Via Aurelia 528A, Roma';

const fixToHotel: MetroStep = {
  title: 'Saia pela Drakou e siga ao Ilissos',
  sign: 'Drakou / Δράκου',
  text: 'Valide o passe na saída. Já na avenida Syngrou, siga até Amvrosiou Frantzi e vire à direita. Vire à esquerda em Falirou e siga até Kallirrois. O hotel fica no nº 72, a cerca de 650 m da estação.',
  map: { label: 'Caminhada até o Ilissos Hotel', destination: ilissos, origin: fix },
  photo: 'fix',
};

const fixNorth: MetroStep = {
  title: 'Entre em Syngrou-Fix pela Drakou',
  line: '2',
  sign: 'Anthoupoli / Ανθούπολη',
  text: 'Procure a entrada na região da rua Drakou com a avenida Syngrou. Encoste o ATH.ENA Ticket no leitor azul da catraca e siga para a plataforma no sentido Anthoupoli. Acropoli é a primeira parada e Syntagma, a segunda.',
  map: { label: 'Entrada Syngrou-Fix no mapa', destination: 'Syngrou Fix Metro Drakou, Atenas' },
  photo: 'fix',
};

const changeToElliniko: MetroStep = {
  title: 'Troque de linha em Syntagma',
  line: '2',
  sign: 'Elliniko / Ελληνικό',
  text: 'Ao sair do trem, permaneça dentro da estação e siga as placas vermelhas da linha 2. Embarque sentido Elliniko. Passe por Acropoli e desça na parada seguinte, Syngrou-Fix.',
};

const romeTicket =
  'Encoste seu cartão contactless no leitor Tap & Go ou valide um BIT de € 1,50 na catraca.';
const manzoniToCenter: MetroStep = {
  title: 'Entre no metrô em Manzoni',
  line: 'A',
  sign: 'Battistini',
  text: `Procure o “M” vermelho no cruzamento de Viale Manzoni com Via Emanuele Filiberto. ${romeTicket} Siga para a plataforma sentido Battistini. Vittorio Emanuele é a primeira parada.`,
  map: { label: 'Manzoni no mapa', destination: manzoni },
  photo: 'manzoni',
};

const guides: Record<string, MetroGuide> = {
  'plan-1-12': {
    stations: ['Airport', 'Syntagma', 'Syngrou-Fix'],
    summary:
      'Grade de sexta em horário de Atenas. Airport 19h22 → Syntagma 20h01, 19h58 → 20h37 ou 20h34 → 21h13. Conte mais 8–15 min para a troca e o trecho da linha 2.',
    steps: [
      {
        title: 'Embarque na estação do aeroporto',
        line: '3',
        sign: 'Dimotiko Theatro / Δημοτικό Θέατρο',
        text: 'Depois de comprar o passe, encoste o bilhete no leitor azul da catraca. No painel, procure Metro e o destino Dimotiko Theatro. O trem suburbano é identificado como Proastiakos e usa a mesma estação.',
        photo: 'airportGates',
      },
      {
        title: 'Desça em Syntagma',
        line: '3',
        sign: 'Syntagma / Σύνταγμα',
        text: 'A viagem dura cerca de 39 min. Quando passar por Evangelismos, prepare-se para sair na estação seguinte.',
      },
      changeToElliniko,
      fixToHotel,
    ],
    sources: [athensLine3, athensLine2, hotelDirections],
  },
  'nov-21-metro': {
    stations: ['Syngrou-Fix', 'Acropoli'],
    summary:
      'Reserve 10–20 min entre entrar em Syngrou-Fix e sair em Acropoli. Chegue ao ponto do guia até 09h15.',
    steps: [
      fixNorth,
      {
        title: 'Desça em Acropoli e vá ao encontro do guia',
        line: '2',
        sign: 'Akropoli / Ακρόπολη · Makrygianni',
        text: 'Desça na primeira parada. Valide na saída e siga as placas para Makrygianni / Athanasiou Diakou. Suba até a rua Makrygianni e confirme o ponto exato no mapa enviado pelo guia.',
        map: { label: 'Ponto de encontro do guia', destination: 'Estação Acropoli, Atenas' },
        photo: 'acropoli',
      },
    ],
    sources: [
      athensLine2,
      { label: 'Saídas de Acropoli · STASY', url: 'https://www.stasy.gr/en/stations/akropoli/' },
    ],
  },
  'plan-2-14': {
    stations: ['Evangelismos', 'Syntagma', 'Syngrou-Fix'],
    summary:
      'Se estiver na região do Licabeto após o jantar, reserve 25–40 min de Evangelismos ao Ilissos.',
    steps: [
      {
        title: 'Encontre a estação Evangelismos',
        line: '3',
        sign: 'Evangelismos / Ευαγγελισμός · Dimotiko Theatro',
        text: 'Na avenida Vasilissis Sofias, procure o acesso Rizari, perto do parque Rizari. Valide o passe e embarque na linha azul sentido Dimotiko Theatro. Syntagma é a primeira parada.',
        map: { label: 'Evangelismos no mapa', destination: 'Evangelismos metro Rizari, Atenas' },
      },
      changeToElliniko,
      fixToHotel,
    ],
    sources: [
      athensLine3,
      hotelDirections,
      {
        label: 'Acesso Rizari · Guia oficial de Atenas',
        url: 'https://accessibleroutes.thisisathens.org/en/mobility-national-garden-of-athens-and-surrounding-highlights/evangelismos-metro-station-line-3/',
      },
    ],
  },
  'nov-22-monastiraki': {
    stations: ['Syngrou-Fix', 'Syntagma', 'Monastiraki'],
    summary:
      'Reserve 20–30 min com a baldeação e a caminhada de 2–4 min até a Biblioteca de Adriano.',
    steps: [
      fixNorth,
      {
        title: 'Troque para a linha azul em Syntagma',
        line: '3',
        sign: 'Dimotiko Theatro / Δημοτικό Θέατρο',
        text: 'Desça na segunda parada. Siga as placas da linha 3 dentro da estação e embarque sentido Dimotiko Theatro. Monastiraki é a primeira parada.',
      },
      {
        title: 'Saia pela praça Monastiraki',
        sign: 'Monastiraki square / Πλατεία Μοναστηρακίου',
        text: 'Valide na saída e suba para a praça. Siga em direção à rua Areos, ao lado da mesquita da praça, até a entrada da Biblioteca de Adriano.',
        map: {
          label: 'Caminhada até a Biblioteca de Adriano',
          destination: 'Biblioteca de Adriano, Atenas',
          origin: monastiraki,
        },
        photo: 'monastiraki',
      },
    ],
    sources: [
      athensLine2,
      {
        label: 'Saídas de Monastiraki · STASY',
        url: 'https://www.stasy.gr/en/stations/monastiraki/',
      },
    ],
  },
  'corr-3-return': {
    stations: ['Monastiraki ou Syntagma', 'Syngrou-Fix'],
    summary:
      'A volta depende do local onde terminar o tour. Reserve 25–40 min da região de Plaka ou Monastiraki e confira os painéis se sair após 21h40.',
    steps: [
      {
        title: 'Se estiver perto da praça Monastiraki',
        line: '3',
        sign: 'Doukissis Plakentias / Airport',
        text: 'Valide na entrada e siga para a linha 3 no sentido Doukissis Plakentias ou Airport. Qualquer trem desse sentido passa por Syntagma, a primeira parada.',
        map: { label: 'Monastiraki no mapa', destination: monastiraki },
        photo: 'monastiraki',
      },
      {
        title: 'Se estiver perto da praça Syntagma',
        line: '2',
        sign: 'Elliniko / Ελληνικό',
        text: 'Entre por um acesso da praça e valide o passe. Se chegar pelo metrô de Monastiraki, faça a troca por dentro. Na linha 2 sentido Elliniko, passe por Acropoli e desça em Syngrou-Fix.',
        map: { label: 'Syntagma no mapa', destination: 'Estação Syntagma, Atenas' },
        photo: 'syntagma',
      },
      fixToHotel,
    ],
    sources: [
      athensLine2,
      hotelDirections,
      {
        label: 'Obras noturnas de 22 a 26/11 · To Vima',
        url: 'https://www.tovima.com/society/athens-metro-four-stations-to-close-early-tonight/',
      },
    ],
  },
  'plan-4-04': {
    stations: ['Syngrou-Fix', 'Syntagma', 'Airport'],
    summary:
      'Tente chegar à plataforma em Syntagma até 08h45. As saídas da grade são 08h54 → 09h34 ou 09h30 → 10h10, em horário de Atenas.',
    steps: [
      fixNorth,
      {
        title: 'Em Syntagma, espere o trem com destino Airport',
        line: '3',
        sign: 'Airport / Αεροδρόμιο',
        text: 'Desça na segunda parada e troque por dentro da estação. Confira “Airport” no painel e no trem antes de embarcar. Quando o destino exibido for Doukissis Plakentias, espere a próxima composição com destino Airport. O serviço ao aeroporto passa a cada 36 min na grade publicada.',
      },
      {
        title: 'Desça no aeroporto e atravesse para o terminal',
        sign: 'Departures / Partidas',
        text: 'Desça no ponto final e use o mesmo passe na catraca de saída. Siga para o terminal pela passarela coberta e procure Departures. Reserve mais 8–15 min até o terminal.',
        photo: 'airport',
      },
    ],
    sources: [
      athensLine3,
      {
        label: 'Acesso ao terminal · Aeroporto de Atenas',
        url: 'https://www.aia.gr/en/traveller/transportation-airport/public-transportation-airport',
      },
    ],
  },
  'nov-24-metro': {
    stations: ['Manzoni', 'Ottaviano'],
    summary: 'Reserve 25–40 min de Manzoni até a Via Germanico, 8. Esteja no encontro até 10h.',
    steps: [
      manzoniToCenter,
      {
        title: 'Desça em Ottaviano e siga à Via Germanico, 8',
        line: 'A',
        sign: 'Ottaviano · San Pietro / Musei Vaticani',
        text: 'Depois de Flaminio e Lepanto, desça em Ottaviano. Procure a saída de Viale Giulio Cesare pelo lado da Via Ottaviano. Siga a pé pela Via Ottaviano em direção ao Vaticano e entre na Via Germanico. A caminhada leva cerca de 4–7 min.',
        map: {
          label: 'Caminhada até o ponto do tour',
          destination: 'Via Germanico 8, Roma',
          origin: ottaviano,
        },
        photo: 'ottaviano',
      },
    ],
    sources: [romeNetwork, romeFare, romeUpdates],
  },
  'nov-25-borghese-route': {
    stations: ['Manzoni', 'Spagna', 'Galleria Borghese'],
    summary:
      'Reserve 35–50 min desde Manzoni, com 18–25 min a pé entre Spagna e a Galleria Borghese.',
    steps: [
      manzoniToCenter,
      {
        title: 'Desça em Spagna e entre no parque pela Porta Pinciana',
        line: 'A',
        sign: 'Spagna · Piazza di Spagna',
        text: 'Spagna vem após Barberini. Saia na Piazza di Spagna e suba até Trinità dei Monti. A partir dali, use o mapa a pé até a Porta Pinciana, no fim da Via Vittorio Veneto. Entre no parque e siga até o Piazzale Scipione Borghese, 5.',
        map: {
          label: 'Caminhada até a Galleria Borghese',
          destination: 'Galleria Borghese, Roma',
          origin: 'Piazza di Spagna, Roma',
        },
      },
    ],
    sources: [
      romeNetwork,
      romeFare,
      {
        label: 'Como chegar · Galleria Borghese',
        url: 'https://galleriaborghese.cultura.gov.it/visita/',
      },
      romeUpdates,
    ],
  },
  'nov-25-planetarium-route': {
    stations: ['Flaminio', 'Termini', 'EUR Fermi'],
    summary:
      'Reserve 45–60 min com a baldeação e a caminhada. Saia de Flaminio por volta de 14h30.',
    steps: [
      {
        title: 'Entre em Flaminio pelo Piazzale Flaminio',
        line: 'A',
        sign: 'Anagnina',
        text: `Saindo do Oakberry, procure o “M” vermelho no Piazzale Flaminio, perto da Porta del Popolo. ${romeTicket} Passe por Spagna, Barberini e Repubblica e desça em Termini.`,
        map: {
          label: 'Flaminio no mapa',
          destination: 'Stazione Metro Flaminio, Piazzale Flaminio, Roma',
        },
      },
      {
        title: 'Em Termini, troque para a linha B',
        line: 'B',
        sign: 'Laurentina',
        text: 'Siga as placas azuis da Metro B e permaneça dentro das catracas. O mesmo bilhete vale para a baldeação. Depois de EUR Magliana e EUR Palasport, desça em EUR Fermi, uma estação antes de Laurentina.',
      },
      {
        title: 'Saia em Viale America e caminhe até o Planetário',
        sign: 'EUR Fermi · Viale America',
        text: 'Caminhe pela Viale America, vire à esquerda na Viale dell’Arte e à direita na Viale della Civiltà Romana. O Planetário fica na Piazza Giovanni Agnelli, 10. Reserve 10–15 min para a caminhada.',
        map: { label: 'Caminhada até o Planetário', destination: planetarium, origin: eurFermi },
      },
    ],
    sources: [
      romeNetwork,
      romeFare,
      {
        label: 'Como chegar · Planetário de Roma',
        url: 'https://www.museiscientificiroma.eu/pagina_planetario1.htm',
      },
      romeUpdates,
    ],
  },
  'nov-25-dinner-route': {
    stations: ['EUR Fermi', 'Termini', 'Cornelia'],
    summary:
      'Reserve 65–90 min do Planetário à churrascaria, incluindo a caminhada nos dois extremos.',
    steps: [
      {
        title: 'Volte a pé para EUR Fermi',
        line: 'B',
        sign: 'Rebibbia ou Jonio',
        text: `Volte pela Viale della Civiltà Romana, Viale dell’Arte e Viale America. ${romeTicket} Os trens para Rebibbia e Jonio passam por Termini. Desça depois de Cavour.`,
        map: { label: 'Caminhada até EUR Fermi', destination: eurFermi, origin: planetarium },
      },
      {
        title: 'Em Termini, mude para a linha A',
        line: 'A',
        sign: 'Battistini',
        text: 'Siga as placas da linha A laranja por dentro das catracas. Embarque sentido Battistini. Passe por Baldo degli Ubaldi e desça em Cornelia, uma estação antes do ponto final.',
      },
      {
        title: 'Caminhe de Cornelia até a churrascaria',
        sign: 'Cornelia · Via Aurelia 528A',
        text: 'Suba para a região da Via di Boccea. No mapa a pé, siga em direção à Via Aurelia e continue até o nº 528A, Churrascaria dos Amigos. Calcule 12–18 min a partir da estação.',
        map: { label: 'Caminhada até a churrascaria', destination: churrascaria, origin: cornelia },
      },
    ],
    sources: [romeNetwork, romeFare, romeUpdates],
  },
  'nov-25-return': {
    stations: ['Cornelia', 'Manzoni', 'Ciao Termini'],
    summary:
      'Reserve 40–55 min para voltar ao Ciao Termini. A estação para descer fica duas paradas depois de Termini.',
    steps: [
      {
        title: 'Volte a Cornelia e embarque sentido Anagnina',
        line: 'A',
        sign: 'Anagnina',
        text: `Volte cerca de 12–18 min a pé até o acesso de Cornelia. ${romeTicket} Baldo degli Ubaldi é a primeira parada no sentido correto.`,
        map: { label: 'Caminhada até Cornelia', destination: cornelia, origin: churrascaria },
      },
      {
        title: 'Desça em Manzoni e siga à Via Bixio, 71',
        line: 'A',
        sign: 'Manzoni · Museo della Liberazione',
        text: 'Passe por Termini e Vittorio Emanuele. Desça em Manzoni e suba para a região de Viale Manzoni / Via Emanuele Filiberto. O Ciao Termini fica na Via Bixio, 71, a 6–10 min a pé.',
        map: {
          label: 'Caminhada até o Ciao Termini',
          destination: 'Ciao Termini, Via Bixio 71, Roma',
          origin: manzoni,
        },
        photo: 'manzoni',
      },
    ],
    sources: [romeNetwork, romeFare, romeUpdates],
  },
};

const plannedRoutes = new Map(
  itineraryActivities()
    .filter(({ id }) => guides[id])
    .map((activity) => [activity.id, activity]),
);

export function metroGuideFor(activity: Activity) {
  const planned = plannedRoutes.get(activity.id);
  if (
    !planned ||
    planned.date !== activity.date ||
    planned.location !== activity.location ||
    planned.transport.mode !== activity.transport.mode ||
    planned.transport.origin !== activity.transport.origin ||
    planned.transport.destination !== activity.transport.destination ||
    planned.transport.lines !== activity.transport.lines
  )
    return null;

  return {
    ...guides[activity.id],
    personalDescription: activity.description !== planned.description ? activity.description : '',
  };
}
