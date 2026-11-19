import { describe, expect, it } from 'vitest';
import { itineraryActivities } from '../src/data/itineraryActivities';
import { itineraryAccessFor } from '../src/data/itineraryAccess';
import { mapDestination, mapsLink } from '../src/lib/domain';

describe('endereços do Google Maps', () => {
  it('liga os destinos aos deslocamentos anteriores, com caminhada final quando necessário', () => {
    const activities = itineraryActivities();
    const find = (id: string) => activities.find((activity) => activity.id === id)!;
    const arrivals = [
      ['plan-1-13', ['plan-1-12', 'corr-1-hotel-walk']],
      ['plan-2-11', ['nov-21-metro', 'plan-2-10']],
      ['plan-2-03', ['nov-22-monastiraki']],
      ['nov-23-train', ['nov-23-fiumicino-walk']],
      ['nov-24-vatican', ['nov-24-metro', 'nov-24-meet']],
      ['nov-25-voyager', ['nov-25-planetarium-route']],
      ['nov-26-flight', ['nov-26-airport']],
    ] as const;
    for (const [id, legs] of arrivals) {
      expect(itineraryAccessFor(find(id), activities)?.via.map((leg) => leg.id)).toEqual(legs);
    }
    expect(itineraryAccessFor(find('plan-2-03'), activities)).toMatchObject({
      point: 'Hadrian’s Library entrance, Areos 3, Athens',
      walk: { from: 'Estação Monastiraki, Atenas' },
    });
    const tour = find('nov-24-vatican');
    const remaining = activities.filter((activity) => activity.id !== 'nov-24-meet');
    expect(itineraryAccessFor(tour, remaining)?.via.map((leg) => leg.id)).toEqual(['nov-24-metro']);
    expect(itineraryAccessFor({ ...tour, address: 'Outro endereço' }, activities)).toBeNull();
  });

  it('leva a estação e a origem selecionadas para pontos identificados', () => {
    const link = new URL(mapsLink('Estação Manzoni, Roma', 'transit', 'Estação Syngrou-Fix, Atenas'));
    expect(link.searchParams.get('destination_place_id')).toBe('ChIJH167-JVhLxMRTtRrDi9lFao');
    expect(link.searchParams.get('origin_place_id')).toBe('ChIJddlgsBq9oRQRmCsWlm96bHQ');
    expect(link.searchParams.get('travelmode')).toBe('transit');
  });
  it('especifica a entrada da Ágora e o endereço do hotel', () => {
    expect(new URL(mapsLink('Ágora Antiga, Adrianou 24, Atenas')).searchParams.get('query')).toBe('37.975984,23.723179');
    expect(new URL(mapsLink('Ciao Termini, Via Bixio 71, Roma')).searchParams.get('query')).toBe('Via Bixio 71, Roma');
  });
  it('aponta a troca da guarda para o monumento, preservando endereços editados', () => {
    const guard = itineraryActivities().find(a => a.id === 'plan-3-06')!;
    expect(mapDestination(guard)).toBe('Túmulo do Soldado Desconhecido, Praça Syntagma, Atenas');
    expect(new URL(mapsLink(mapDestination(guard))).searchParams.get('query')).toBe('Tomb of the Unknown Soldier Athens Greece');
    expect(mapDestination({ ...guard, address: 'Outro endereço' })).toBe('Outro endereço');
  });
  it('preserva locais informados manualmente', () => {
    const url = new URL(mapsLink('Local personalizado', 'walking', 'Origem personalizada'));
    expect(url.searchParams.get('destination')).toBe('Local personalizado');
    expect(url.searchParams.get('origin')).toBe('Origem personalizada');
    expect(url.searchParams.has('destination_place_id')).toBe(false);
  });
  it('abre os pontos de encontro informados pelos fornecedores no Google Maps', () => {
    const activities = itineraryActivities();
    const acropolis = activities.find((activity) => activity.id === 'plan-2-10')!;
    const freeTour = activities.find((activity) => activity.id === 'nov-22-checkin')!;
    expect(mapsLink(mapDestination(acropolis))).toBe('https://goo.gl/maps/84CxmmK2pvrSsRrU9');
    expect(mapsLink(mapDestination(freeTour))).toBe('https://maps.app.goo.gl/LGBiFCQzG9FhhEVNA');
  });
});
