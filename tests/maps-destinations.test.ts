import { describe, expect, it } from 'vitest';
import { itineraryActivities } from '../src/data/itineraryActivities';
import { mapDestination, mapsLink } from '../src/lib/domain';

describe('endereços do Google Maps', () => {
  it('leva a estação e a origem selecionadas para pontos identificados', () => {
    const link = new URL(mapsLink('Estação Manzoni, Roma', 'transit', 'Estação Syngrou-Fix, Atenas'));
    expect(link.searchParams.get('destination_place_id')).toBe('ChIJH167-JVhLxMRTtRrDi9lFao');
    expect(link.searchParams.get('origin_place_id')).toBe('ChIJddlgsBq9oRQRmCsWlm96bHQ');
    expect(link.searchParams.get('travelmode')).toBe('transit');
  });
  it('especifica a entrada da Ágora e o endereço do hotel', () => {
    expect(new URL(mapsLink('Ágora Antiga, Adrianou 24, Atenas')).searchParams.get('query')).toBe('Ancient Agora entrance Adrianou 24 Athens');
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
});
