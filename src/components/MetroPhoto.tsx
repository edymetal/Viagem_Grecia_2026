import { metroPhotos, type MetroPhotoId } from '../data/metroGuides';

export function MetroPhoto({ id }: { id: MetroPhotoId }) {
  const photo = metroPhotos[id];
  const original = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(photo.original)}`;
  const image = `${import.meta.env.BASE_URL}images/metro/${photo.file}.webp`;
  const license =
    photo.license === 'CC BY 2.0'
      ? 'https://creativecommons.org/licenses/by/2.0/'
      : `https://creativecommons.org/licenses/by-sa/${photo.license.endsWith('3.0') ? '3.0' : '4.0'}/`;

  return (
    <figure className="metro-photo">
      <img alt={photo.caption} src={image} loading="lazy" decoding="async" />
      <figcaption>
        {photo.caption}{' '}
        <small>
          {photo.author} ·{' '}
          <a href={original} target="_blank" rel="noreferrer">
            Original
          </a>{' '}
          ·{' '}
          <a href={license} target="_blank" rel="noreferrer">
            {photo.license}
          </a>
          {' · Redimensionada'}
        </small>
      </figcaption>
    </figure>
  );
}
