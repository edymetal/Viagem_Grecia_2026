import { useState } from 'react';
import { ArrowUpRight, Footprints, MapPinned, TrainFront, Wifi, Search } from 'lucide-react';
import { ActivityVisual } from '../components/ActivityVisual';
import type { TravelStore } from '../hooks/useTravel';
import { dateLabel, mapDestination, zoneLabel } from '../lib/domain';
import { Empty, MapsLinks, PageHeading } from '../components/ui';
import { TransportDetails } from './Itinerary';

export function MapPage({
  store,
  navigate,
}: {
  store: TravelStore;
  navigate: (page: string) => void;
}) {
  const [search, setSearch] = useState('');
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
  const locations = store.state!.activities.filter(
    (a) =>
      mapDestination(a) && normalize(`${a.title} ${mapDestination(a)}`).includes(normalize(search)),
  );
  return (
    <>
      <PageHeading
        eyebrow="A CIDADE NO SEU RITMO"
        title="Mapa e caminhos"
        description="Seus destinos e deslocamentos, reunidos em um lugar."
      />
      <div className="map-intro card">
        <div className="map-pattern" aria-hidden="true">
          <div className="map-pin">
            <MapPinned size={40} strokeWidth={1.5} />
          </div>
          <span className="map-road r1" />
          <span className="map-road r2" />
          <span className="map-road r3" />
        </div>
        <div>
          <span className="eyebrow">CAMINHAR. DESCOBRIR. REPETIR.</span>
          <h2>Explore com o Google Maps</h2>
          <p className="muted">
            Abra um destino ou peça um percurso a pé e de transporte público. As rotas são
            calculadas pelo Google Maps ao abrir o link.
          </p>
          <div className="inline small">
            <Footprints size={17} />
            Caminhadas <span>·</span>
            <TrainFront size={17} />
            Metrô
          </div>
        </div>
      </div>
      <p className="notice inline">
        <Wifi size={18} />
        Google Maps e sites externos precisam de internet. Este aplicativo guarda apenas os
        endereços e detalhes que você adicionar; não armazena mapas ou calcula rotas.
      </p>
      <div className="section-title">
        <h2>
          Destinos do roteiro <span className="count-badge">{locations.length}</span>
        </h2>
        <button className="text-button" onClick={() => navigate('roteiro')}>
          Editar roteiro <ArrowUpRight size={15} />
        </button>
      </div>
      <label className="map-search">
        <Search size={20} />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar atrações e lugares"
          aria-label="Buscar destinos do roteiro"
        />
      </label>
      {!locations.length ? (
        <section className="card">
          <Empty title={search ? 'Nenhum destino encontrado' : 'Seus caminhos começam no roteiro'}>
            {search
              ? 'Tente outro nome ou limpe a busca para ver os destinos do roteiro.'
              : 'Adicione uma atividade com endereço ou destino para ver os links de navegação aqui. Nenhuma rota foi presumida.'}
          </Empty>
        </section>
      ) : (
        <div className="location-grid">
          {locations.map((a) => (
            <article className="card location-card" key={a.id}>
              <span className="eyebrow">
                {dateLabel(a.date)}
                {a.start && ` · ${a.start}`}
                {` · ${zoneLabel(a)}`}
              </span>
              <div className="location-identity">
                <ActivityVisual activity={a} />
                <h3>{a.title}</h3>
              </div>
              <p className="muted">{mapDestination(a)}</p>
              <MapsLinks address={mapDestination(a)} origin={a.transport.origin} />
              <TransportDetails activity={a} />
            </article>
          ))}
        </div>
      )}
      {store.state!.hotel.address && (
        <section className="card location-card">
          <span className="eyebrow">SUA BASE EM ATENAS</span>
          <h3>{store.state!.hotel.name || 'Hospedagem'}</h3>
          <p className="muted">{store.state!.hotel.address}</p>
          <MapsLinks address={store.state!.hotel.address} />
        </section>
      )}
    </>
  );
}
