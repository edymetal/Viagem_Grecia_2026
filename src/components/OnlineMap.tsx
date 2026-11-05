import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import points from '../data/map-points.json';
import { suppliedItinerary } from '../data/itinerary';
import type { Activity } from '../data/schema';
import { mapDestination, mapsLink } from '../lib/domain';
import { itineraryHref } from '../lib/itineraryRoute';

const originalDestinations = new Map(
  suppliedItinerary().activities.map((a) => [a.id, mapDestination(a)]),
);

export function OnlineMap({ activities }: { activities: Activity[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const visible = points.flatMap((point) => {
    const activity = activities.find(
      (a) =>
        point.activityIds.includes(a.id) && mapDestination(a) === originalDestinations.get(a.id),
    );
    return activity ? [{ ...point, activity }] : [];
  });
  const signature = JSON.stringify(
    visible.map((p) => [p.name, p.activity.id, p.activity.title, p.activity.date]),
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
          const popup = document.createElement('div');
          const title = document.createElement('strong');
          title.textContent = point.name;
          popup.append(title);
          const detail = document.createElement('a');
          detail.textContent = 'Ver atividade';
          detail.href = itineraryHref(point.activity.date, point.activity.id);
          popup.append(detail);
          const navigation = document.createElement('a');
          navigation.textContent = 'Abrir no Google Maps';
          navigation.href = mapsLink(mapDestination(point.activity));
          navigation.target = '_blank';
          navigation.rel = 'noreferrer';
          popup.append(navigation);
          L.marker([point.latitude, point.longitude], {
            title: point.name,
            alt: point.name,
            icon: L.divIcon({
              className: 'trip-map-marker',
              html: '<span aria-hidden="true">●</span>',
              iconSize: [36, 36],
              iconAnchor: [18, 36],
            }),
          })
            .bindPopup(popup)
            .addTo(map);
        }
        map.fitBounds(
          visible.map((p) => [p.latitude, p.longitude] as [number, number]),
          { padding: [35, 35], maxZoom: 16 },
        );
        map.on('popupopen', (event) => {
          event.popup
            .getElement()
            ?.querySelector('.leaflet-popup-close-button')
            ?.setAttribute('aria-label', 'Fechar ponto');
        });
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
    <section className="online-map-card card" aria-label="Mapa interativo dos pontos do roteiro">
      <div className="card-heading">
        <h2>Pontos no mapa</h2>
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
            aria-label="Mapa de Atenas com locais do roteiro"
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
        Toque em um ponto para abrir os detalhes. Coordenadas indicam o local, não a entrada ou o
        encontro do guia. Locais sem coordenadas verificadas ficam nos cards. Mapa online:
        OpenStreetMap; rotas: Google Maps.
      </p>
    </section>
  );
}
