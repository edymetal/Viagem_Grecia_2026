import { ChevronRight, MapPin, TrainFront } from 'lucide-react';
import type { metroGuideFor } from '../data/metroGuides';
import { mapsLink } from '../lib/domain';
import { MetroPhoto } from './MetroPhoto';

export function MetroDirections({
  guide,
}: {
  guide: NonNullable<ReturnType<typeof metroGuideFor>>;
}) {
  return (
    <section className="card detail-section metro-guide" aria-labelledby="metro-guide-title">
      <h3 id="metro-guide-title">
        <TrainFront size={19} aria-hidden="true" /> Metrô passo a passo
      </h3>
      <ol className="metro-stations" aria-label="Estações do percurso">
        {guide.stations.map((station, index) => (
          <li key={station}>
            {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
            <span>{station}</span>
          </li>
        ))}
      </ol>
      <p className="metro-summary">{guide.summary}</p>
      {guide.personalDescription && (
        <p className="detail-description">{guide.personalDescription}</p>
      )}
      <ol className="metro-steps" role="list">
        {guide.steps.map(({ title, text, line, sign, map, photo }) => (
          <li key={title}>
            <h4>{title}</h4>
            {(line || sign) && (
              <p className="metro-sign">
                {line && <span className={`metro-line metro-line-${line}`}>Linha {line}</span>}
                {sign && <strong>{sign}</strong>}
              </p>
            )}
            <p>{text}</p>
            {map && (
              <a
                className="metro-map-link"
                href={mapsLink(map.destination, map.origin ? 'walking' : undefined, map.origin)}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin size={16} aria-hidden="true" /> {map.label}
              </a>
            )}
            {photo && <MetroPhoto key={photo} id={photo} />}
          </li>
        ))}
      </ol>
      <details className="metro-sources">
        <summary>Mapas, horários e avisos</summary>
        <div className="detail-external-links">
          {guide.sources.map(({ url, label }) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              {label} ↗
            </a>
          ))}
        </div>
      </details>
    </section>
  );
}
