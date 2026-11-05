import { useState } from 'react';
import { ArrowUpRight, BedDouble, ChevronRight, MapPin, Wifi, Search } from 'lucide-react';
import { DestinationLinks, MapDestinationCard } from '../components/MapDestinationCard';
import type { TravelStore } from '../hooks/useTravel';
import { mapDestination } from '../lib/domain';
import { Empty, PageHeading } from '../components/ui';
import { OnlineMap } from '../components/OnlineMap';

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
    <section className="map-screen">
      <PageHeading
        eyebrow="A CIDADE NO SEU RITMO"
        title="Mapa e caminhos"
        description="Seus destinos e deslocamentos, reunidos em um lugar."
      />
      <OnlineMap activities={locations} documents={store.documents} />
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
            <MapDestinationCard activity={a} documents={store.documents} key={a.id} />
          ))}
        </div>
      )}
      {store.state!.hotel.address && (
        <section className="card hotel-map-card" aria-label="Hospedagem no mapa">
          <div className="hotel-map-heading">
            <span className="icon-tile pink">
              <BedDouble size={26} />
            </span>
            <div>
              <span className="eyebrow">SUA BASE EM ATENAS</span>
              <h3>{store.state!.hotel.name || 'Hospedagem'}</h3>
            </div>
          </div>
          <p className="destination-address">
            <MapPin size={16} />
            <span>{store.state!.hotel.address}</span>
          </p>
          <DestinationLinks
            destination={store.state!.hotel.address}
            title={store.state!.hotel.name || 'Hospedagem'}
          />
          <a href="#hotel" className="destination-details-link">
            Ver hospedagem
            <ChevronRight size={17} />
          </a>
        </section>
      )}
    </section>
  );
}
