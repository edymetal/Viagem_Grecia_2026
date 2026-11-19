import { mapDestination } from '../lib/domain';
import { FIUMICINO_WALK_ID, itineraryActivities, PALERMO_PARKING } from './itineraryActivities';
import type { Activity } from './schema';

type Access = {
  directions?: string;
  point?: string;
  via?: string[];
  walk?: { from: string; to?: string; label?: string };
  source?: string;
};

const ilissosDirections = 'https://ilissos.reserve-online.net/directions';
const atacMap = 'https://www.atac.roma.it/en/utility/maps';
const terminiAccess =
  'https://www.rfi.it/it/stazioni/pagine-stazioni/Roma-Termini-totem-informativi/entra-in-stazione.html';
const gardenGate = 'National Garden main entrance, Vasilissis Amalias, Athens';
const zeusGate = 'Olympieion entrance, Vasilissis Olgas, Athens';
const museum = 'Museu da Acrópole, Dionysiou Areopagitou 15, Atenas';

const accessGroups: [string[], Access][] = [
  [['plan-1-01'], {
    directions:
      'Pegue a A20 rumo a Palermo, siga pela A19 e entre na A29 sentido Trapani/Punta Raisi. Na saída Aeroporto, siga as placas P1 Lunga Sosta até a cancela da reserva.',
  }],
  [['nov-20-parking'], { via: ['plan-1-01'] }],
  [['plan-1-06'], {
    via: ['nov-20-parking'],
    walk: { from: PALERMO_PARKING, to: 'Aeroporto Falcone Borsellino, Palermo' },
    directions:
      'Do P1 Lunga Sosta, siga a sinalização de pedestres até o terminal, a cerca de 600 m (8–12 min). Procure Partenze / Departures e consulte o painel pelo número AZ1784 para localizar o balcão ou o portão.',
    source: 'https://www.aeroportodipalermo.it/parcheggi/p1-parcheggio-lunga-sosta/',
  }],
  [['plan-1-07'], { via: ['plan-1-06'] }],
  [['plan-1-08'], {
    directions:
      'Ao sair do avião em Fiumicino, siga Connettenti / Flight Connections. No painel, procure AZ718 para Atene / Athens e siga a sinalização do portão indicado.',
  }],
  [['nov-20-az718'], { via: ['plan-1-08'] }],
  [['plan-1-11'], { via: ['plan-1-10'] }],
  [['plan-1-12'], { via: ['plan-1-11'] }],
  [['corr-1-hotel-walk', 'plan-1-13'], {
    via: ['plan-1-12', 'corr-1-hotel-walk'],
  }],
  [['nov-21-fix', 'nov-22-fix', 'plan-4-03'], {
    directions:
      'Do Ilissos, siga da Kallirrois pela Falirou e Amvrosiou Frantzi até a avenida Syngrou. Procure o acesso do metrô Syngrou-Fix junto à rua Drakou. Para Acropoli ou Syntagma, use a linha 2 no sentido Anthoupoli.',
    source: ilissosDirections,
  }],
  [['nov-21-metro'], { via: ['nov-21-fix'] }],
  [['plan-2-10', 'plan-2-11'], { via: ['nov-21-metro', 'plan-2-10'] }],
  [['plan-2-07'], {
    point: museum,
    directions:
      'Use como referência a saída principal do Museu da Acrópole, no calçadão Dionysiou Areopagitou, 15. Dali você pode seguir para Filopapo ou direto ao Kotsanas se o tour atrasar.',
    source: 'https://www.theacropolismuseum.gr/en/plan-your-visit',
  }],
  [['nov-21-filopapo'], { via: ['nov-21-filopapo-walk'] }],
  [['plan-2-04', 'plan-2-05'], {
    via: ['plan-2-04'],
    walk: { from: museum, label: 'Atalho a pé saindo do Museu da Acrópole' },
    directions:
      'Do monumento de Filopapo, desça até a região da Acrópole e siga em direção a Syntagma e Kolonaki. Se pular a colina, vá direto do Museu da Acrópole ao Kotsanas.',
  }],
  [['nov-21-lycabettus'], {
    point: 'Lycabettus Hill Funicular Lower Station, 1 Aristippou, Athens',
    via: ['nov-21-lycabettus-walk'],
  }],
  [['nov-21-lycabettus-walk'], {
    point: 'Lycabettus Hill Funicular Lower Station, 1 Aristippou, Athens',
  }],
  [['nov-22-monastiraki'], { via: ['nov-22-fix'] }],
  [['plan-2-03'], {
    point: 'Hadrian’s Library entrance, Areos 3, Athens',
    via: ['nov-22-monastiraki'],
    walk: { from: 'Estação Monastiraki, Atenas' },
  }],
  [['plan-3-06'], { via: ['plan-3-04'] }],
  [['plan-3-08', 'plan-3-09'], { point: zeusGate, via: ['plan-3-08'] }],
  [['plan-3-10'], { walk: { from: zeusGate } }],
  [['plan-3-03'], { via: ['plan-3-02'] }],
  [['nov-22-garden-walk'], {
    point: gardenGate,
    directions: 'Da Ágora, volte à região de Monastiraki e siga a Ermou até Syntagma.',
  }],
  [['plan-3-07'], {
    point: gardenGate,
    via: ['nov-22-garden-walk'],
    walk: { from: gardenGate, to: 'Zappeion Hall, Atenas', label: 'Caminhada até o Zappeion' },
  }],
  [['nov-22-checkin', 'nov-22-free-tour'], { via: ['nov-22-snack'] }],
  [['nov-22-snack'], {
    directions:
      'Do Jardim Nacional ou do Zappeion, siga em direção a Plaka e use a Ágora Romana como referência para encontrar a igreja indicada no voucher.',
  }],
  [['plan-4-04'], { via: ['plan-4-03'] }],
  [['corr-4-airport'], {
    via: ['plan-4-04'],
    directions:
      'Ao sair do metrô, siga Airport Terminal / Departures pela passarela coberta até o terminal principal. No piso de partidas, procure AZ719 e localize o balcão da ITA ou siga à segurança se já tiver o cartão e não precisar despachar mala.',
    source: 'https://www.aia.gr/en/traveller/general-instructions',
  }],
  [['plan-4-06'], { via: ['corr-4-airport'] }],
  [['nov-23-train'], { via: [FIUMICINO_WALK_ID] }],
  [['nov-23-checkin'], { via: ['nov-23-hotel-walk'] }],
  [['nov-24-walk', 'nov-25-manzoni'], {
    directions:
      'Saia da Via Bixio, 71, e caminhe em direção ao Viale Manzoni. Procure o M vermelho no cruzamento com a Via Emanuele Filiberto. Na linha A, o sentido Battistini segue para Spagna e Ottaviano.',
    source: atacMap,
  }],
  [['nov-24-metro'], { via: ['nov-24-walk'] }],
  [['nov-24-meet', 'nov-24-vatican'], {
    via: ['nov-24-metro', 'nov-24-meet'],
    walk: { from: 'Estação Ottaviano, Roma' },
  }],
  [['nov-24-lunch'], { via: ['nov-24-mcd-walk'] }],
  [['nov-24-vicus-walk'], {
    directions:
      'Do Borgo Pio, atravesse o Tibre em direção ao centro histórico e siga para a região da Fontana di Trevi.',
  }],
  [['nov-24-vicus'], { via: ['nov-24-vicus-walk'] }],
  [['nov-24-gamm'], { via: ['nov-24-gamm-walk'] }],
  [['nov-24-dinner'], { via: ['nov-24-emporio-walk'] }],
  [['nov-24-return'], {
    directions:
      'Da Via Milazzo, siga em direção à estação Termini. Use a Via Giolitti no lado do Esquilino como referência e continue até a Via Bixio. Confira o número 71 na porta da hospedagem.',
    source: terminiAccess,
  }],
  [['nov-25-borghese'], {
    via: ['nov-25-borghese-route'],
    walk: { from: 'Piazza di Spagna, Roma' },
  }],
  [['nov-25-borghese-route'], { via: ['nov-25-manzoni'] }],
  [['nov-25-bk-walk'], {
    directions:
      'Dos jardins, saia para o centro pelo lado da Via Pinciana ou da Porta Pinciana, conforme onde terminar o passeio. Siga em direção à Via Nazionale.',
  }],
  [['nov-25-lunch'], { via: ['nov-25-bk-walk'] }],
  [['nov-25-oakberry-walk'], {
    directions:
      'Da Via Nazionale, siga em direção à Piazza del Popolo e passe pela Porta del Popolo para chegar ao Piazzale Flaminio.',
  }],
  [['nov-25-acai'], { via: ['nov-25-oakberry-walk'] }],
  [['nov-25-flaminio'], {
    directions:
      'Saia da Oakberry para o Piazzale Flaminio e procure a entrada com o M vermelho da linha A. Valide o bilhete e siga para o sentido Anagnina. Desça em Termini para trocar para a linha B.',
    source: atacMap,
  }],
  [['nov-25-planetarium-route'], { via: ['nov-25-flaminio'] }],
  [['nov-25-stars', 'nov-25-voyager'], {
    via: ['nov-25-planetarium-route'],
    walk: { from: 'EUR Fermi metro, Roma' },
  }],
  [['nov-25-dinner'], {
    via: ['nov-25-dinner-route'],
    walk: { from: 'Cornelia metro, Roma' },
  }],
  [['nov-26-platform', 'nov-26-train'], { via: ['nov-26-termini', 'nov-26-platform'] }],
  [['nov-26-airport'], {
    via: ['nov-26-train'],
    directions:
      'Ao sair do Leonardo Express, siga Aeroporto / Partenze pela passarela. Confira o terminal do FR3946 no cartão de embarque ou no painel, siga até o piso de partidas e procure a segurança e o portão.',
    source: 'https://adr.airsiders.com/?lang=it',
  }],
  [['nov-26-flight'], { via: ['nov-26-airport'] }],
  [['nov-26-drive'], {
    via: ['nov-26-luggage'],
    directions:
      'Ao sair do P1, siga pela A29 rumo a Palermo, pela A19 e pela A20 sentido Messina. Saia em Santo Stefano di Camastra e siga para o destino final na cidade.',
  }],
];

const accessById = new Map(
  accessGroups.flatMap(([ids, access]) => ids.map((id) => [id, access] as const)),
);
const planned = new Map(itineraryActivities().map((activity) => [activity.id, activity]));

function matchesPlannedLocation(activity: Activity) {
  const original = planned.get(activity.id);
  return (
    original &&
    original.date === activity.date &&
    mapDestination(original) === mapDestination(activity) &&
    original.transport.mode === activity.transport.mode &&
    original.transport.origin === activity.transport.origin &&
    original.transport.destination === activity.transport.destination
  );
}

export function itineraryAccessFor(activity: Activity, activities: Activity[]) {
  const access = accessById.get(activity.id);
  if (!access || !matchesPlannedLocation(activity)) return null;

  const via = (access.via ?? []).flatMap((id) => {
    const leg = activities.find((item) => item.id === id && item.date === activity.date);
    return leg && leg.id !== activity.id && matchesPlannedLocation(leg) ? [leg] : [];
  });
  return { ...access, via };
}
