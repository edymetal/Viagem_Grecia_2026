import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Activity, LocalDocument } from '../data/schema';
import { matchingMapPoints } from '../lib/mapPoints';
import { MapDestinationCard } from './MapDestinationCard';
import { Modal } from './ui';

export function OnlineMap({
  activities,
  documents,
  search,
}: {
  activities: Activity[];
  documents: LocalDocument[];
  search: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [preferredCity, setPreferredCity] = useState('Atenas');
  const matching = matchingMapPoints(activities, search);
  const cities = [...new Set(matching.map((point) => point.city))];
  const city = cities.includes(preferredCity) ? preferredCity : cities[0];
  const visible = matching.filter((point) => point.city === city);
  const selected = visible.find((point) => point.name === selectedId);
  const signature = JSON.stringify(
    visible.map((point) => point.name),
  );
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  useEffect(() => {
    setSelectedId(null);
    if (!online || !container.current || !visible.length) return;
    let active = true;
    let map: LeafletMap | undefined;
    setFailed(false);
    void import('leaflet')
      .then((L) => {
        if (!active || !container.current) return;
        map = L.map(container.current, { scrollWheelZoom: false, zoomControl: false });
        L.control
          .zoom({
            position: 'topright',
            zoomInTitle: 'Aproximar mapa',
            zoomOutTitle: 'Afastar mapa',
          })
          .addTo(map);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; colaboradores do <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
          .on('tileerror', () => {
            if (active) setFailed(true);
          })
          .addTo(map);
        for (const point of visible) {
          const marker = L.marker([point.latitude, point.longitude], {
            title: point.name,
            alt: point.name,
            icon: L.divIcon({
              className: 'trip-map-marker',
              html: '<span aria-hidden="true">●</span>',
              iconSize: [36, 36],
              iconAnchor: [18, 36],
            }),
          }).on('click', () => setSelectedId(point.name));
          marker.on('add', () => {
            const icon = marker.getElement();
            icon?.setAttribute('aria-label', `Ver ponto: ${point.name}`);
            icon?.addEventListener('keydown', (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              event.stopPropagation();
              setSelectedId(point.name);
            });
          });
          marker.addTo(map);
        }
        map.fitBounds(
          visible.map((p) => [p.latitude, p.longitude] as [number, number]),
          { padding: [35, 35], maxZoom: 16 },
        );
        const observer = new ResizeObserver(() => map?.invalidateSize());
        observer.observe(container.current);
        map.on('unload', () => observer.disconnect());
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      map?.remove();
    };
    // The signature tracks precisely the displayed marker/popup data.
  }, [online, signature, attempt]);
  return (
    <>
      <section className="online-map-card card" aria-label="Mapa interativo dos pontos do roteiro">
        <div className="card-heading">
          <h2>Pontos no mapa</h2>
          {cities.length > 1 && (
            <select
              aria-label="Cidade no mapa"
              value={city}
              onChange={(event) => setPreferredCity(event.target.value)}
            >
              {cities.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          )}
          <span className="small muted">{visible.length} locais</span>
        </div>
        {!online ? (
          <p className="notice">
            Mapa indisponível offline. Os destinos e as fotos continuam nos cards abaixo.
          </p>
        ) : !visible.length ? (
          <p className="notice">
            Nenhum ponto com coordenadas verificadas nesta busca. Consulte os cards abaixo.
          </p>
        ) : (
          <>
            <div
              ref={container}
              className="online-trip-map"
              aria-label={`Mapa de ${city} com locais do roteiro`}
            />
            {failed && (
              <p className="notice" role="status">
                O fundo do mapa não pôde ser carregado. Os cards continuam disponíveis.{' '}
                <button className="text-button" onClick={() => setAttempt((n) => n + 1)}>
                  Tentar novamente
                </button>
              </p>
            )}
          </>
        )}
        <p className="small muted">
          Toque em um ponto para abrir os detalhes. Use a busca para aproximar um local.
        </p>
      </section>
      {selected && (
        <Modal title="Ponto no mapa" onClose={() => setSelectedId(null)}>
          <div className="map-point-preview">
            {selected.note && <p className="notice">{selected.note}</p>}
            <MapDestinationCard activity={selected.activity} documents={documents} point={selected} />
          </div>
        </Modal>
      )}
    </>
  );
}
