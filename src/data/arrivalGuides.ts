import { itineraryActivities } from './itineraryActivities';
import type { Activity } from './schema';
import { mapDestination } from '../lib/domain';

type ArrivalGuide = {
  heading: string;
  point: string;
  steps: string[];
  source: string;
  mapTarget?: { destination: string; label: string };
  note?: string;
};

const guides: [string[], ArrivalGuide][] = [
  [
    ['nov-20-parking', 'plan-1-01', 'nov-26-luggage'],
    {
      heading: 'Acesso ao estacionamento',
      point: 'P1 Parcheggio Lunga Sosta, Aeroporto de Palermo',
      steps: [
        'Ao chegar de carro, siga as placas P1 / Lunga Sosta. Procure o estacionamento descoberto do lado do mar, em frente ao Centro Direzionale do aeroporto.',
        'Na cancela do P1, escaneie o QR do comprovante. Do estacionamento ao terminal, conte cerca de 600 m a pé. Na volta, use o mesmo caminho e mantenha o QR à mão para a saída.',
      ],
      source: 'https://www.aeroportodipalermo.it/parcheggi/p1-parcheggio-lunga-sosta/',
    },
  ],
  [
    ['corr-1-hotel-walk', 'plan-1-13'],
    {
      heading: 'Entrada do hotel',
      point: 'Ilissos Hotel, Kallirrois 72, Atenas',
      steps: [
        'Em Syngrou-Fix, use a saída Drakou. Na avenida Syngrou, vire à direita na Amvrosiou Frantzi e depois à esquerda na Falirou. Vá até o fim da Falirou, na Kallirrois.',
        'Na Kallirrois, procure a fachada do Ilissos Hotel e confira o número 72. Entre pela recepção para o check-in.',
      ],
      source: 'https://ilissos.reserve-online.net/directions',
    },
  ],
  [
    ['plan-2-10', 'plan-2-11'],
    {
      heading: 'Ponto de encontro',
      point: 'Entrada principal do metrô Acropoli, rua Makrygianni',
      mapTarget: { destination: 'Estação Acropoli, Atenas', label: 'Abrir encontro no mapa' },
      steps: [
        'Desça em Acropoli na linha 2 e suba à rua Makrygianni. Use o pino enviado pelo guia para identificar a entrada da estação na rua.',
        'Esteja no local até 9h15. O guia pediu apresentação entre 9h20 e 9h25 na entrada do metrô. Tenha o ingresso da Acrópole salvo para seguir com o grupo às 9h30.',
      ],
      note: 'Museu da Acrópole às 12h. A entrada principal fica no calçadão Dionysiou Areopagitou, 15. Para o tour, siga as instruções do guia sobre o acesso e o reencontro do grupo.',
      source: 'https://www.theacropolismuseum.gr/en/plan-your-visit',
    },
  ],
  [
    ['nov-21-filopapo-walk', 'nov-21-filopapo'],
    {
      heading: 'Acesso à trilha',
      point: 'Calçadão Dionysiou Areopagitou, lado de Filopapo',
      steps: [
        'Do Museu da Acrópole, siga pelo calçadão Dionysiou Areopagitou até perto da curva para Apostolou Pavlou.',
        'Entre pelo caminho pavimentado perto do quiosque. Você passará pela igreja Agios Dimitrios Loumbardiaris. Continue pela subida até o monumento no topo.',
      ],
      source: 'https://www.thisisathens.org/itineraries/accessible-guide-ancient-athens-uncovered-movement-impaired',
    },
  ],
  [
    ['plan-2-04', 'plan-2-05'],
    {
      heading: 'Entrada do museu',
      point: 'Museu Kotsanas, Pindarou 6, esquina com Akademias',
      steps: [
        'Em Kolonaki, procure o cruzamento da rua Pindarou com a avenida Akademias. A entrada do Museu Kotsanas fica no número 6 da Pindarou.',
        'Na recepção, procure o nome Kotsanas ou Museum of Ancient Greek Technology e apresente o ingresso válido para o dia.',
      ],
      source: 'https://kotsanas.com/athens/',
    },
  ],
  [
    ['nov-21-lycabettus-walk', 'nov-21-lycabettus'],
    {
      heading: 'Entrada do funicular',
      point: 'Estação inferior, esquina de Ploutarchou com Aristippou',
      steps: [
        'Em Kolonaki, suba a Ploutarchou em direção à colina. Conte com trechos íngremes e escadas.',
        'Na esquina com Aristippou, entre na estação inferior do funicular. A bilheteria fica na estação. O ponto do mapa leva ao embarque embaixo.',
      ],
      source: 'https://www.lycabettushill.com/lycabettus-hill-map-location/',
    },
  ],
  [
    ['plan-2-03'],
    {
      heading: 'Entrada do sítio arqueológico',
      point: 'Biblioteca de Adriano, Areos 3, Monastiraki',
      steps: [
        'No metrô Monastiraki, siga a saída Monastiraki Square. Na praça, use a antiga mesquita Tzistarakis como referência e entre na rua Areos.',
        'Procure a entrada da biblioteca no número 3, junto à vedação das ruínas. Tenha o ingresso pronto para entrar até 9h30.',
      ],
      source: 'https://www.hh.gr/en/destinations/hadrian-library/',
    },
  ],
  [
    ['plan-3-04', 'plan-3-06'],
    {
      heading: 'Onde assistir',
      point: 'Túmulo do Soldado Desconhecido, em frente ao Parlamento',
      steps: [
        'Siga pela Ermou até a Praça Syntagma. Atravesse a avenida Vasilissis Amalias pela faixa de pedestres em direção ao Parlamento.',
        'Procure o memorial com as duas guaritas dos guardas. A cerimônia acontece na área em frente ao túmulo. Escolha um lugar atrás do cordão de segurança, se houver.',
      ],
      source: 'https://accessibleroutes.thisisathens.org/en/mobility-national-garden-of-athens-and-surrounding-highlights/',
    },
  ],
  [
    ['plan-3-08', 'plan-3-09'],
    {
      heading: 'Entrada do sítio arqueológico',
      point: 'Olympieion, avenida Vasilissis Olgas, Atenas',
      steps: [
        'Do Parlamento, desça pela Vasilissis Amalias até a altura do Arco de Adriano. Entre na Vasilissis Olgas, na direção do Zappeion.',
        'Siga a vedação do sítio até o portão do Olympieion na Vasilissis Olgas. Use a sinalização e as passagens abertas. Tenha o ingresso pronto para entrar até 12h30.',
      ],
      source: 'https://www.hh.gr/en/destinations/olympieion/',
    },
  ],
  [
    ['plan-3-10'],
    {
      heading: 'Onde ver o arco',
      point: 'Arco de Adriano, esquina de Vasilissis Amalias e Vasilissis Olgas',
      steps: [
        'Da entrada do Olympieion, volte pela Vasilissis Olgas em direção à Vasilissis Amalias. O arco é visível de fora do sítio.',
        'Se a área imediata do arco estiver isolada, faça a parada na calçada pública, do lado de Vasilissis Amalias.',
      ],
      source: 'https://efaathculture.gr/arxaiologikos-xoros-olympieiou-archaeological-site-of-olympieion/',
    },
  ],
  [
    ['plan-3-02', 'plan-3-03'],
    {
      heading: 'Entrada do sítio arqueológico',
      point: 'Ágora Antiga, Adrianou 24, Atenas',
      steps: [
        'Pela região de Monastiraki, siga pela Adrianou no sentido de Thiseio. Procure o número 24 no lado da linha do trem.',
        'Use a entrada sinalizada da Ágora Antiga. A Ágora Romana é outro sítio, perto da Biblioteca de Adriano. Tenha o ingresso pronto para a faixa de 14h a 15h.',
      ],
      source: 'https://www.hh.gr/en/announcements/phaistos-29-7/',
    },
  ],
  [
    ['nov-22-garden-walk', 'plan-3-07'],
    {
      heading: 'Entrada do jardim',
      point: 'Portão principal, avenida Vasilissis Amalias, Atenas',
      steps: [
        'Na Vasilissis Amalias, siga pelo lado do Parlamento em direção à entrada Amalias / National Garden. O portão principal fica entre quiosques, no muro do parque.',
        'Ao terminar o passeio, siga as indicações internas para Zappeion se quiser ver a fachada pela saída sul.',
      ],
      source: 'https://www.thisisathens.org/itineraries/accessible-national-garden-surrounding-highlights-visual-impaired',
    },
  ],
  [
    ['nov-22-snack', 'nov-22-checkin', 'nov-22-free-tour'],
    {
      heading: 'Ponto de encontro do voucher',
      point: 'Igreja Panagia Grigorousa, Taxiarchon 7, Atenas',
      steps: [
        'A partir da praça Monastiraki, siga pela Areos, passe pela Biblioteca de Adriano e caminhe em direção à Ágora Romana.',
        'Procure a pequena igreja na esquina de Dexippou com Taxiarchon. Apresente-se no local indicado pelo voucher até 18h20 para o tour das 18h35.',
      ],
      note: 'A página pública da Civitatis mostra as escadas em frente à Epimenidou 9. Use Taxiarchon 7, que consta no seu voucher. Se receber uma nova instrução para sua reserva, siga o endereço mais recente do fornecedor.',
      source: 'https://www.civitatis.com/it/atene/free-tour-atene/',
    },
  ],
  [
    ['nov-23-hotel-walk', 'nov-23-checkin'],
    {
      heading: 'Entrada da hospedagem',
      point: 'Ciao Termini, Via Bixio 71, Roma',
      steps: [
        'Na estação Roma Termini, saia pelo lado da Via Giovanni Giolitti. Siga por essa rua até a Via Bixio e procure o número 71.',
        'No número 71, procure Ciao Termini no interfone. A reserva indica check-in entre 14h e 19h. Consulte a mensagem da acomodação se precisar de instruções para acessar o prédio.',
      ],
      source: 'https://www.booking.com/hotel/it/ciao-termini.html',
    },
  ],
  [
    ['nov-24-meet', 'nov-24-vatican'],
    {
      heading: 'Ponto de encontro',
      point: 'Agência Tours About, Via Germanico 8, Roma',
      mapTarget: { destination: 'Via Germanico 8, Roma', label: 'Abrir encontro no mapa' },
      steps: [
        'Desça no metrô Ottaviano e saia na Viale Giulio Cesare pelo lado da Via Ottaviano. Caminhe pela Via Ottaviano em direção ao Vaticano até cruzar a Via Germanico.',
        'Na Via Germanico, siga até o número 8, perto da esquina com a Via Leone IV. Procure a agência Tours About e apresente o voucher até 10h para o tour das 10h15.',
        'Depois da apresentação, siga com o guia até a entrada dos Museus Vaticanos, no Viale Vaticano.',
      ],
      source: 'https://www.toursabout.com/it/index.htm',
    },
  ],
  [
    ['nov-24-mcd-walk', 'nov-24-lunch'],
    {
      heading: 'Entrada do restaurante',
      point: 'McDonald’s Borgo Pio, Via Borgo Pio 93–96, Roma',
      steps: [
        'Da Praça de São Pedro, siga para a Via del Mascherino. Procure a unidade na esquina com a Via Borgo Pio, nos números 93 a 96.',
      ],
      source: 'https://www.mcdonalds.it/ristoranti-aderenti',
    },
  ],
  [
    ['nov-24-vicus-walk', 'nov-24-vicus'],
    {
      heading: 'Entrada da visita guiada',
      point: 'Vicus Caprarius, Vicolo del Puttarello 25, Roma',
      steps: [
        'Chegue à região da Fontana di Trevi e procure a placa de rua Vicolo del Puttarello. A viela fica a cerca de dois minutos da fonte.',
        'Procure o número 25 e a identificação Vicus Caprarius. A porta é discreta e dá acesso à recepção do sítio subterrâneo. Apresente a reserva da visita das 15h ali.',
      ],
      source: 'https://www.vicuscaprarius.com/contatti/',
    },
  ],
  [
    ['nov-24-gamm-walk', 'nov-24-gamm'],
    {
      heading: 'Entrada do museu',
      point: 'GAMM Game Museum, Via delle Terme di Diocleziano 35/36, Roma',
      steps: [
        'Use a Piazza della Repubblica como referência. Da estação Repubblica são cerca de 100 metros até a Via delle Terme di Diocleziano, segundo o museu.',
        'Procure a identificação GAMM nos números 35/36 e entre nessa porta para a bilheteria.',
      ],
      source: 'https://www.gammuseum.com/new/museo/',
    },
  ],
  [
    ['nov-24-emporio-walk', 'nov-24-dinner'],
    {
      heading: 'Entrada do restaurante',
      point: 'Empório Brasileiro, Via Milazzo 41/43, Roma',
      steps: [
        'Chegando pela região de Termini, use a Via Marsala como referência para localizar a Via Milazzo. Procure a fachada do Empório Brasileiro nos números 41/43.',
      ],
      source: 'https://www.tripadvisor.it/Restaurant_Review-g187791-d26799698-Reviews-Emporio_Brasileiro-Rome_Lazio.html',
    },
  ],
  [
    ['nov-25-borghese-route', 'nov-25-borghese'],
    {
      heading: 'Entrada da galeria',
      point: 'Galleria Borghese, Piazzale Scipione Borghese 5, Roma',
      steps: [
        'Chegando de Spagna, suba até Trinità dei Monti e entre no parque pela Porta Pinciana. Siga para a Galleria Borghese. O acesso ao parque mais próximo do museu fica na Via Pinciana.',
        'No Piazzale Scipione Borghese, procure a sinalização de entrada da própria galeria. Se precisar da bilheteria, siga Biglietteria. Chegue às 9h com ingresso e documento para a sessão das 9h30.',
      ],
      source: 'https://galleriaborghese.cultura.gov.it/en/info/',
    },
  ],
  [
    ['nov-25-villa'],
    {
      heading: 'Acesso aos jardins',
      point: 'Villa Borghese, saída da Galleria Borghese',
      steps: [
        'Ao sair da galeria no Piazzale Scipione Borghese, você já estará no parque. Entre pelas alamedas do próprio jardim e programe o retorno ao piazzale se quiser sair pelo lado da Via Pinciana.',
      ],
      source: 'https://www.comune.roma.it/web/it/scheda-servizi.page?contentId=INF75656',
    },
  ],
  [
    ['nov-25-planetarium-route', 'nov-25-stars', 'nov-25-voyager'],
    {
      heading: 'Entrada do planetário',
      point: 'Planetario di Roma, Piazza Giovanni Agnelli 10',
      steps: [
        'Saia em EUR Fermi para a Viale America. Siga até a Viale dell’Arte, vire à esquerda e depois à direita na Viale della Civiltà Romana.',
        'Na Piazza Giovanni Agnelli, procure a escadaria do número 10 e a sinalização Planetario. O acesso sem degraus fica ao lado da escada. Lá dentro, siga para a bilheteria ou apresente os ingressos.',
      ],
      source: 'https://www.planetarioroma.it/it/informazioni_pratiche/orari_costi_e_indirizzi/planetario_e_museo_astronomico',
    },
  ],
  [
    ['nov-25-bk-walk', 'nov-25-lunch'],
    {
      heading: 'Entrada do restaurante',
      point: 'Burger King Roma Nazionale, Via Nazionale 178/179, Roma',
      steps: [
        'Procure a fachada Burger King na Via Nazionale, nos números 178/179. É a unidade Roma Nazionale no mapa da rede.',
      ],
      source: 'https://www.burgerking.it/trova-un-ristorante?storeId=18796',
    },
  ],
  [
    ['nov-25-oakberry-walk', 'nov-25-acai'],
    {
      heading: 'Onde encontrar',
      point: 'Oakberry, Piazzale Flaminio 5, Roma',
      steps: [
        'Use a saída Flaminio da linha A como referência. Procure a fachada da Oakberry no número 5 do Piazzale Flaminio.',
      ],
      source: 'https://www.oakberry.com/locator-map',
    },
  ],
  [
    ['nov-25-dinner-route', 'nov-25-dinner'],
    {
      heading: 'Entrada do restaurante',
      point: 'Churrascaria dos Amigos, Via Aurelia 528A, Roma',
      steps: [
        'Da estação Cornelia, reserve 12–18 minutos a pé. Use o número 528A da Via Aurelia como destino e procure a identificação da Churrascaria dos Amigos na fachada.',
      ],
      source: 'https://www.thefork.it/ristorante/churrascaria-dos-amigos-r865791',
    },
  ],
  [
    ['nov-26-termini', 'nov-26-platform'],
    {
      heading: 'Entrada da estação',
      point: 'Roma Termini, acesso ao saguão pela Via Giovanni Giolitti 2',
      mapTarget: { destination: 'Via Giovanni Giolitti 2, Roma', label: 'Abrir entrada no mapa' },
      steps: [
        'Vindo da Via Bixio, siga pela Via Giovanni Giolitti em direção à Piazza dei Cinquecento. Entre no número 2 para acessar o saguão e as máquinas de bilhetes.',
        'Depois de comprar o bilhete, procure Fiumicino Aeroporto no painel Partenze. Siga o Binario mostrado no painel e vá até a catraca correspondente.',
      ],
      source: 'https://www.rfi.it/en/stations/station-page/roma-termini---information-totem/accessing-the-station.html',
    },
  ],
];

const originalActivities = new Map(itineraryActivities().map((a) => [a.id, a]));

export function arrivalGuideFor(activity: Activity): ArrivalGuide | undefined {
  const original = originalActivities.get(activity.id);
  if (
    !original ||
    original.date !== activity.date ||
    mapDestination(original) !== mapDestination(activity)
  )
    return undefined;
  return guides.find(([ids]) => ids.includes(activity.id))?.[1];
}
